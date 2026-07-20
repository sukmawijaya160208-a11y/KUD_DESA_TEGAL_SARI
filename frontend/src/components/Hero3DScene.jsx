'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, rotation, color, geometry, speed = 0.5, distort = 0.2 }) {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = rotation[0] + t * speed * 0.3;
      ref.current.rotation.y = rotation[1] + t * speed * 0.5;
      ref.current.position.x = position[0] + Math.sin(t * speed * 0.4) * 0.3;
      ref.current.position.y = position[1] + Math.cos(t * speed * 0.3) * 0.3;
      ref.current.position.z = position[2] + Math.sin(t * speed * 0.2) * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      {geometry}
      <MeshDistortMaterial color={color} roughness={0.3} metalness={0.1} distort={distort} speed={2} opacity={0.7} transparent />
    </mesh>
  );
}

function Particles({ count = 80 }) {
  const mesh = useRef();
  const { viewport } = useThree();
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  });

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    const positionsAttr = mesh.current.geometry.attributes.position;
    const array = positionsAttr.array;
    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.002;
      array[i * 3] += Math.cos(t * 0.2 + i * 0.5) * 0.001;
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#60A5FA" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function PalmLeaf({ position, scale: s, rotation, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += 0.003;
      ref.current.position.y += Math.sin(state.clock.getElapsedTime() * 0.2) * 0.001;
    }
  });

  const shape = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.quadraticCurveTo(0.3, 0.5, 0, 1);
    sh.quadraticCurveTo(-0.3, 0.5, 0, 0);
    return sh;
  }, []);

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={s}>
      <shapeGeometry args={[shape]} />
      <MeshDistortMaterial color={color} roughness={0.4} metalness={0.05} transparent opacity={0.25} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#60A5FA" />
      <pointLight position={[-5, -3, 2]} intensity={0.4} color="#059669" />

      <FloatingShape position={[-2.5, 1.5, -1]} rotation={[0.5, 0.8, 0.3]} color="#2563EB"
        geometry={<icosahedronGeometry args={[0.35, 0]} />} speed={0.4} distort={0.15} />
      <FloatingShape position={[2.8, -1.2, -0.5]} rotation={[0.2, 1.1, 0.7]} color="#059669"
        geometry={<octahedronGeometry args={[0.3, 0]} />} speed={0.6} distort={0.25} />
      <FloatingShape position={[-1.8, -1.8, 0.5]} rotation={[0.9, 0.3, 0.6]} color="#60A5FA"
        geometry={<torusKnotGeometry args={[0.25, 0.08, 32, 8]} />} speed={0.5} distort={0.2} />
      <FloatingShape position={[1.5, 1.8, -0.8]} rotation={[0.4, 0.6, 0.9]} color="#4CAF50"
        geometry={<dodecahedronGeometry args={[0.28, 0]} />} speed={0.35} distort={0.18} />
      <FloatingShape position={[0, -2.2, 1.2]} rotation={[1.2, 0.1, 0.5]} color="#FFD700"
        geometry={<icosahedronGeometry args={[0.2, 0]} />} speed={0.45} distort={0.3} />

      <PalmLeaf position={[-1.2, 1, 0.2]} scale={[0.6, 0.6, 0.6]} rotation={[0, 0, 0.8]} color="#4CAF50" />
      <PalmLeaf position={[1.8, 0.5, -0.3]} scale={[0.5, 0.5, 0.5]} rotation={[0.3, 0.5, -0.5]} color="#059669" />
      <PalmLeaf position={[-0.5, -1, 0.8]} scale={[0.4, 0.4, 0.4]} rotation={[0.8, 0.2, 1.2]} color="#1B5E20" />

      <Particles count={60} />
    </>
  );
}

export default function Hero3DScene() {
  if (typeof window === 'undefined') return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <Scene />
      </Canvas>
    </div>
  );
}
