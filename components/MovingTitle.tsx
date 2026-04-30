'use client';

import { useEffect } from 'react';

export default function MovingTitle() {
  useEffect(() => {
    // Expanded the space buffer so it doesn't jarringly jump at the end
    let title = "Comparative Study of Classical Cryptography (RSA) and Quantum Cryptography (ML-KEM) Applied in Modern Web Applications •                ";
    
    const interval = setInterval(() => {
      // Shift the first character to the end of the string
      title = title.substring(1) + title.substring(0, 1);
      document.title = title;
    }, 150); // Reduced interval from 250ms to 150ms for a smoother "ticker" feel

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render any UI, it only manages the document title
  return null;
}