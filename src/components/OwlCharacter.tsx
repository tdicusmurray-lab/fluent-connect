import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useLearningStore } from '@/stores/learningStore';

// Background configurations for each language (keyed by language code)
const languageBackgrounds: Record<string, {
  skyColor: string;
  groundColor: string;
  sunPosition: [number, number, number];
  showStars: boolean;
  landmark?: string;
}> = {
  es: { skyColor: '#87CEEB', groundColor: '#DEB887', sunPosition: [100, 20, 100], showStars: false, landmark: 'spain' },
  fr: { skyColor: '#B8C4E0', groundColor: '#8B7355', sunPosition: [50, 30, 80], showStars: false, landmark: 'france' },
  de: { skyColor: '#6B8E9F', groundColor: '#4A5D23', sunPosition: [30, 40, 100], showStars: false, landmark: 'germany' },
  it: { skyColor: '#FFB347', groundColor: '#C19A6B', sunPosition: [100, 15, 50], showStars: false, landmark: 'italy' },
  pt: { skyColor: '#87CEEB', groundColor: '#F4A460', sunPosition: [80, 25, 100], showStars: false, landmark: 'brazil' },
  ja: { skyColor: '#FFB7C5', groundColor: '#8FBC8F', sunPosition: [60, 50, 80], showStars: false, landmark: 'japan' },
  ko: { skyColor: '#4169E1', groundColor: '#2F4F4F', sunPosition: [40, 60, 100], showStars: true, landmark: 'korea' },
  zh: { skyColor: '#DC143C', groundColor: '#8B4513', sunPosition: [70, 35, 90], showStars: false, landmark: 'china' },
  ru: { skyColor: '#1C1C3C', groundColor: '#FFFFFF', sunPosition: [20, 10, 100], showStars: true, landmark: 'russia' },
  ar: { skyColor: '#FF8C00', groundColor: '#EDC9AF', sunPosition: [100, 10, 50], showStars: false, landmark: 'dubai' },
};

function Landmark({ type }: { type: string }) {
  switch (type) {
    case 'spain':
      // Simple fan-like shape representing flamenco
      return (
        <group position={[-3, -1.5, -2]}>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[0, 0.5 + i * 0.1, 0]} rotation={[0, 0, (i - 2) * 0.2]}>
              <boxGeometry args={[0.1, 1.2, 0.02]} />
              <meshStandardMaterial color="#DC143C" />
            </mesh>
          ))}
        </group>
      );
    case 'france':
      // Eiffel Tower silhouette
      return (
        <group position={[-3, -1.5, -2]}>
          <mesh position={[0, 1, 0]}>
            <coneGeometry args={[0.8, 2.5, 4]} />
            <meshStandardMaterial color="#4A4A4A" wireframe />
          </mesh>
        </group>
      );
    case 'japan':
      // Cherry blossom tree
      return (
        <group position={[3, -1.5, -2]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 1.5, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#FFB7C5" />
          </mesh>
        </group>
      );
    case 'china':
      // Pagoda shape
      return (
        <group position={[-3, -1.5, -2]}>
          {[0, 0.6, 1.1].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <coneGeometry args={[0.6 - i * 0.15, 0.4, 4]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>
          ))}
        </group>
      );
    case 'germany':
      // Castle turret
      return (
        <group position={[-3, -1.5, -2]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 1.5, 8]} />
            <meshStandardMaterial color="#696969" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.5, 0.6, 8]} />
            <meshStandardMaterial color="#2F4F4F" />
          </mesh>
        </group>
      );
    case 'italy':
      // Leaning tower
      return (
        <group position={[-3, -1.5, -2]} rotation={[0, 0, 0.1]}>
          {[0, 0.4, 0.8, 1.2, 1.6].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <cylinderGeometry args={[0.3 - i * 0.03, 0.3 - i * 0.02, 0.35, 16]} />
              <meshStandardMaterial color="#F5F5DC" />
            </mesh>
          ))}
        </group>
      );
    case 'brazil':
      // Palm tree
      return (
        <group position={[3, -1.5, -2]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 2, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {[-0.4, 0, 0.4].map((x, i) => (
            <mesh key={i} position={[x * 0.8, 1.8, 0]} rotation={[0.3, i - 1, x]}>
              <coneGeometry args={[0.15, 0.8, 4]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          ))}
        </group>
      );
    case 'russia':
      // Onion dome
      return (
        <group position={[-3, -1.5, -2]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 1, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0, 1.7, 0]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>
      );
    case 'korea':
      // Traditional gate (simplified)
      return (
        <group position={[-3, -1.5, -2]}>
          <mesh position={[-0.4, 0.4, 0]}>
            <boxGeometry args={[0.15, 1, 0.15]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
          <mesh position={[0.4, 0.4, 0]}>
            <boxGeometry args={[0.15, 1, 0.15]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1.2, 0.2, 0.3]} />
            <meshStandardMaterial color="#2F4F4F" />
          </mesh>
        </group>
      );
    case 'dubai':
      // Desert dunes
      return (
        <group position={[0, -2.5, -3]}>
          {[-2, 0, 2].map((x, i) => (
            <mesh key={i} position={[x, 0, i * 0.5]} rotation={[-0.1, 0, 0]}>
              <sphereGeometry args={[1.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#EDC9AF" />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}

function Background({ languageId }: { languageId: string }) {
  const config = languageBackgrounds[languageId] || languageBackgrounds.spanish;
  
  return (
    <>
      <Sky 
        sunPosition={config.sunPosition} 
        turbidity={8}
        rayleigh={2}
      />
      {config.showStars && <Stars radius={100} depth={50} count={1000} factor={4} />}
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={config.groundColor} />
      </mesh>
      
      {/* Landmark */}
      {config.landmark && <Landmark type={config.landmark} />}
    </>
  );
}

function Owl({ isSpeaking = false }: { isSpeaking?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
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
  const targetLanguage = useLearningStore(state => state.targetLanguage);
  const languageCode = targetLanguage?.code || 'es';

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        <Background languageId={languageCode} />
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
