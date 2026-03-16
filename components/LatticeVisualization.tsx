'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// HELPER: Creates a smooth circular texture for the particles
const circleTexture = typeof document !== 'undefined' ? (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
})() : null;

// 1. Pass progress to the lattice to control its spin speed AND pulse
function StructuredLattice({ progress }: { progress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // LIVE FEEDBACK: State to track the pulse animation
  const [pulse, setPulse] = useState(1);

  // Trigger a 30% scale bump every time progress increments
  useEffect(() => {
    if (progress > 0) setPulse(1.3);
  }, [progress]);
  
  const gridSize = 8;
  const spacing = 0.6; 
  const positions = useMemo(() => {
    const pos = [];
    const offset = (gridSize * spacing) / 2;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          pos.push(x * spacing - offset, y * spacing - offset, z * spacing - offset);
        }
      }
    }
    return new Float32Array(pos);
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Dynamic Spin
      const dynamicSpeed = 0.2 + (progress * 2); 
      pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * dynamicSpeed) * 0.5;
      pointsRef.current.rotation.x = Math.cos(state.clock.elapsedTime * dynamicSpeed) * 0.2;

      // Shrink the pulse back down to 1 over time
      if (pulse > 1) {
        setPulse((prev) => Math.max(1, prev - delta * 3)); 
      }
      pointsRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={positions.length / 3} 
            array={positions} 
            itemSize={3} 
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#A855F7" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </points>
      <mesh>
        <boxGeometry args={[gridSize * spacing, gridSize * spacing, gridSize * spacing]} />
        <meshBasicMaterial color="#A855F7" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// 2. Pass progress AND payload size to manipulate the noise stream
function NoiseStream({ progress, payloadSize }: { progress: number, payloadSize: number }) {
  const streamRef = useRef<THREE.Points>(null);
  
  // LIVE FEEDBACK: State to track the brightness flash
  const [flash, setFlash] = useState(0.9);

  // Flare the brightness up to 300% on each iteration
  useEffect(() => {
    if (progress > 0) setFlash(3.0);
  }, [progress]);

  const particleCount = useMemo(() => {
    return Math.min(2000, 100 + payloadSize * 5);
  }, [payloadSize]);

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8; 
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return pos;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!streamRef.current) return;
    const time = state.clock.getElapsedTime();
    const positions = streamRef.current.geometry.attributes.position.array as Float32Array;
    
    const travelSpeed = 0.04 + (progress * 0.15);
    const noiseAmplitude = 0.01 + Math.min(0.08, payloadSize * 0.0003);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += travelSpeed; 
      
      if (positions[i * 3] > 4) {
        positions[i * 3] = -4; 
      }
      
      positions[i * 3 + 1] += Math.sin(time * 5 + i) * noiseAmplitude; 
    }
    streamRef.current.geometry.attributes.position.needsUpdate = true;

    // Cool the brightness flash back down over time
    if (flash > 0.9) {
      setFlash((prev) => Math.max(0.9, prev - delta * 4));
    }
    (streamRef.current.material as THREE.PointsMaterial).opacity = flash;
  });

  return (
    <points ref={streamRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particleCount} 
          array={positions} 
          itemSize={3} 
          args={[positions, 3]}
        />
      </bufferGeometry>
      {/* ADDED: map={circleTexture} to make the particles perfectly circular */}
      <pointsMaterial 
        size={0.12} 
        color="#FFFFFF" 
        transparent 
        opacity={0.9} 
        blending={THREE.AdditiveBlending} 
        map={circleTexture || undefined}
        depthWrite={false}
      />
    </points>
  );
}

// 3. Export the main component
interface LatticeProps {
  progress?: number;
  payloadSize?: number;
}

export default function LatticeVisualization({ progress = 0, payloadSize = 12 }: LatticeProps) {
  return (
    <div className="w-full h-full absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#A855F7" />
        <pointLight position={[-10, 10, 10]} intensity={3} color="#3B82F6" />
        
        <group position={[-4, 0, 0]} scale={1.5}>
          <Sphere args={[1, 32, 32]}>
            <meshStandardMaterial color="#1E3A8A" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
          </Sphere>
          <Icosahedron args={[1.1, 3]}>
            <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.8} blending={THREE.AdditiveBlending} />
          </Icosahedron>
        </group>

        <NoiseStream progress={progress} payloadSize={payloadSize} />

        <group position={[4, 0, 0]}>
          <StructuredLattice progress={progress} />
        </group>

        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}