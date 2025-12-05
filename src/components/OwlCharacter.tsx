import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function Owl({ isSpeaking = false }: { isSpeaking?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle head movement
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
    // Blinking animation
    if (leftEyeRef.current && rightEyeRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 3) > 0.95 ? 0.1 : 1;
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Body */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>

        {/* Left ear tuft */}
        <mesh position={[-0.5, 1.5, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.2, 0.5, 32]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>

        {/* Right ear tuft */}
        <mesh position={[0.5, 1.5, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.2, 0.5, 32]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>

        {/* Belly */}
        <mesh position={[0, -0.5, 0.8]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>

        {/* Face area */}
        <mesh position={[0, 0.8, 0.6]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>

        {/* Left eye white */}
        <mesh position={[-0.3, 0.9, 0.85]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Right eye white */}
        <mesh position={[0.3, 0.9, 0.85]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Left pupil */}
        <mesh ref={leftEyeRef} position={[-0.3, 0.9, 1.0]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Right pupil */}
        <mesh ref={rightEyeRef} position={[0.3, 0.9, 1.0]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Eye shine - left */}
        <mesh position={[-0.25, 0.95, 1.1]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
        </mesh>

        {/* Eye shine - right */}
        <mesh position={[0.35, 0.95, 1.1]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
        </mesh>

        {/* Beak */}
        <mesh position={[0, 0.6, 1.1]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.12, 0.25, 32]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>

        {/* Left wing */}
        <mesh position={[-1.1, -0.3, 0]} rotation={[0, 0, 0.3]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#16a34a" />
          <mesh scale={[1, 1.5, 0.5]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </mesh>

        {/* Right wing */}
        <mesh position={[1.1, -0.3, 0]} rotation={[0, 0, -0.3]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#16a34a" />
          <mesh scale={[1, 1.5, 0.5]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </mesh>

        {/* Left foot */}
        <mesh position={[-0.4, -1.6, 0.3]}>
          <boxGeometry args={[0.25, 0.1, 0.4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>

        {/* Right foot */}
        <mesh position={[0.4, -1.6, 0.3]}>
          <boxGeometry args={[0.25, 0.1, 0.4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>

        {/* Speech indicator when speaking */}
        {isSpeaking && (
          <mesh position={[1.5, 1.2, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

interface OwlCharacterProps {
  isSpeaking?: boolean;
  className?: string;
}

export function OwlCharacter({ isSpeaking = false, className = "" }: OwlCharacterProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        <Owl isSpeaking={isSpeaking} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
