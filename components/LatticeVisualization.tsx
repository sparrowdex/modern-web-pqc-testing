'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

function StructuredLattice() {
  const pointsRef = useRef<THREE.Points>(null);
  
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

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
      pointsRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
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

function NoiseStream() {
  const streamRef = useRef<THREE.Points>(null);
  const particleCount = 300; 

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8; 
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!streamRef.current) return;
    const time = state.clock.getElapsedTime();
    const positions = streamRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += 0.08; 
      if (positions[i * 3] > 4) {
        positions[i * 3] = -4;
      }
      positions[i * 3 + 1] += Math.sin(time * 5 + i) * 0.02; 
    }
    streamRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={streamRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#FFFFFF" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function LatticeVisualization() {
  return (
    // FIXED: Changed h-[500px] to w-full h-full so it takes up the entire teleported overlay
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

        <NoiseStream />

        <group position={[4, 0, 0]}>
          <StructuredLattice />
        </group>

        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}