import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useLearningStore } from '@/stores/learningStore';

// Background configurations for each scenario
const scenarioBackgrounds: Record<string, {
  skyColor: string;
  groundColor: string;
  ambientIntensity: number;
  elements: string;
}> = {
  restaurant: { skyColor: '#2C1810', groundColor: '#4A3728', ambientIntensity: 0.4, elements: 'restaurant' },
  shopping: { skyColor: '#F5F5DC', groundColor: '#E8E4C9', ambientIntensity: 0.8, elements: 'shopping' },
  directions: { skyColor: '#87CEEB', groundColor: '#808080', ambientIntensity: 0.7, elements: 'city' },
  hotel: { skyColor: '#DEB887', groundColor: '#8B7355', ambientIntensity: 0.5, elements: 'hotel' },
  doctor: { skyColor: '#F0F8FF', groundColor: '#E0E0E0', ambientIntensity: 0.9, elements: 'clinic' },
  'job-interview': { skyColor: '#4682B4', groundColor: '#2F4F4F', ambientIntensity: 0.6, elements: 'office' },
  cafe: { skyColor: '#D2691E', groundColor: '#8B4513', ambientIntensity: 0.5, elements: 'cafe' },
  party: { skyColor: '#4B0082', groundColor: '#2E1A47', ambientIntensity: 0.3, elements: 'party' },
  free: { skyColor: '#87CEEB', groundColor: '#228B22', ambientIntensity: 0.7, elements: 'park' },
};

function ScenarioElements({ type }: { type: string }) {
  switch (type) {
    case 'restaurant':
      return (
        <group>
          {/* Table */}
          <mesh position={[-2.5, -1.2, -1]}>
            <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[-2.5, -1.7, -1]}>
            <cylinderGeometry args={[0.1, 0.1, 0.9, 16]} />
            <meshStandardMaterial color="#5D3A1A" />
          </mesh>
          {/* Wine bottle */}
          <mesh position={[-2.3, -0.9, -1]}>
            <cylinderGeometry args={[0.08, 0.1, 0.4, 16]} />
            <meshStandardMaterial color="#2F4F4F" />
          </mesh>
          {/* Candle */}
          <mesh position={[-2.7, -0.95, -1]}>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
            <meshStandardMaterial color="#FFF8DC" />
          </mesh>
          <pointLight position={[-2.7, -0.7, -1]} intensity={0.5} color="#FFA500" distance={2} />
          {/* Wall lamp */}
          <pointLight position={[3, 1, -2]} intensity={0.3} color="#FFD700" distance={4} />
        </group>
      );
    
    case 'shopping':
      return (
        <group>
          {/* Clothing rack */}
          <mesh position={[-3, -0.5, -1.5]}>
            <boxGeometry args={[0.05, 1.5, 0.05]} />
            <meshStandardMaterial color="#C0C0C0" />
          </mesh>
          <mesh position={[-2, -0.5, -1.5]}>
            <boxGeometry args={[0.05, 1.5, 0.05]} />
            <meshStandardMaterial color="#C0C0C0" />
          </mesh>
          <mesh position={[-2.5, 0.2, -1.5]}>
            <boxGeometry args={[1.2, 0.05, 0.05]} />
            <meshStandardMaterial color="#C0C0C0" />
          </mesh>
          {/* Hangers with clothes */}
          {[-2.8, -2.5, -2.2].map((x, i) => (
            <mesh key={i} position={[x, -0.1, -1.5]}>
              <boxGeometry args={[0.25, 0.5, 0.05]} />
              <meshStandardMaterial color={['#FF6B6B', '#4ECDC4', '#45B7D1'][i]} />
            </mesh>
          ))}
          {/* Shopping bag */}
          <mesh position={[2.5, -1.5, -1]}>
            <boxGeometry args={[0.4, 0.5, 0.2]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
        </group>
      );
    
    case 'city':
      return (
        <group>
          {/* Buildings */}
          {[
            { pos: [-3, 0, -3], h: 3, c: '#696969' },
            { pos: [-1.5, 0.5, -4], h: 4, c: '#778899' },
            { pos: [2, -0.2, -3.5], h: 2.5, c: '#708090' },
            { pos: [3.5, 0.3, -4], h: 3.5, c: '#5F9EA0' },
          ].map((b, i) => (
            <mesh key={i} position={[b.pos[0], b.pos[1], b.pos[2]]}>
              <boxGeometry args={[1, b.h, 0.8]} />
              <meshStandardMaterial color={b.c} />
            </mesh>
          ))}
          {/* Street lamp */}
          <mesh position={[1, -0.5, -1]}>
            <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
            <meshStandardMaterial color="#2F2F2F" />
          </mesh>
          <pointLight position={[1, 0.7, -1]} intensity={0.4} color="#FFFACD" distance={3} />
          {/* Road markings */}
          <mesh position={[0, -2.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 3]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      );
    
    case 'hotel':
      return (
        <group>
          {/* Reception desk */}
          <mesh position={[-2.5, -1.3, -1.5]}>
            <boxGeometry args={[1.5, 0.8, 0.4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Plant */}
          <mesh position={[2.5, -1.5, -1]}>
            <cylinderGeometry args={[0.2, 0.25, 0.5, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[2.5, -0.8, -1]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {/* Chandelier */}
          <pointLight position={[0, 2, 0]} intensity={0.6} color="#FFD700" distance={5} />
          {/* Bell on desk */}
          <mesh position={[-2.3, -0.85, -1.3]}>
            <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );
    
    case 'clinic':
      return (
        <group>
          {/* Medical cross */}
          <mesh position={[-3, 0.5, -2]}>
            <boxGeometry args={[0.6, 0.2, 0.05]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
          <mesh position={[-3, 0.5, -2]}>
            <boxGeometry args={[0.2, 0.6, 0.05]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
          {/* Chair */}
          <mesh position={[2.5, -1.5, -1]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#4169E1" />
          </mesh>
          <mesh position={[2.5, -1, -1.2]}>
            <boxGeometry args={[0.5, 0.5, 0.1]} />
            <meshStandardMaterial color="#4169E1" />
          </mesh>
          {/* Bright clinical lighting */}
          <pointLight position={[0, 2, 0]} intensity={1} color="#FFFFFF" distance={6} />
        </group>
      );
    
    case 'office':
      return (
        <group>
          {/* Desk */}
          <mesh position={[-2.5, -1.2, -1.5]}>
            <boxGeometry args={[1.8, 0.1, 0.8]} />
            <meshStandardMaterial color="#2F4F4F" />
          </mesh>
          {/* Desk legs */}
          {[[-3.2, -1.7, -1.2], [-1.8, -1.7, -1.2], [-3.2, -1.7, -1.8], [-1.8, -1.7, -1.8]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <boxGeometry args={[0.05, 0.9, 0.05]} />
              <meshStandardMaterial color="#1C1C1C" />
            </mesh>
          ))}
          {/* Computer monitor */}
          <mesh position={[-2.5, -0.8, -1.7]}>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#1C1C1C" />
          </mesh>
          {/* Window */}
          <mesh position={[3, 0, -3]}>
            <boxGeometry args={[0.1, 2, 1.5]} />
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} />
          </mesh>
        </group>
      );
    
    case 'cafe':
      return (
        <group>
          {/* Counter */}
          <mesh position={[-2.5, -1.3, -1.5]}>
            <boxGeometry args={[1.5, 0.8, 0.5]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* Coffee cup */}
          <mesh position={[-2.3, -0.85, -1.3]}>
            <cylinderGeometry args={[0.08, 0.06, 0.15, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {/* Coffee machine */}
          <mesh position={[-2.8, -0.7, -1.7]}>
            <boxGeometry args={[0.4, 0.5, 0.3]} />
            <meshStandardMaterial color="#2F2F2F" />
          </mesh>
          {/* Warm ambient lighting */}
          <pointLight position={[-2, 0, -1]} intensity={0.4} color="#FFA500" distance={3} />
          <pointLight position={[2, 0, -1]} intensity={0.3} color="#FFD700" distance={3} />
          {/* Menu board */}
          <mesh position={[2.5, 0.5, -2]}>
            <boxGeometry args={[1, 0.8, 0.05]} />
            <meshStandardMaterial color="#2F2F2F" />
          </mesh>
        </group>
      );
    
    case 'party':
      return (
        <group>
          {/* Disco lights */}
          <pointLight position={[-2, 1.5, -1]} intensity={0.5} color="#FF1493" distance={4} />
          <pointLight position={[2, 1.5, -1]} intensity={0.5} color="#00BFFF" distance={4} />
          <pointLight position={[0, 2, 0]} intensity={0.4} color="#FFD700" distance={4} />
          {/* Speaker */}
          <mesh position={[-3, -1, -2]}>
            <boxGeometry args={[0.5, 0.8, 0.4]} />
            <meshStandardMaterial color="#1C1C1C" />
          </mesh>
          {/* Balloons */}
          {[
            { pos: [2.5, 0.5, -1.5], c: '#FF6B6B' },
            { pos: [2.8, 0.3, -1.3], c: '#4ECDC4' },
            { pos: [2.3, 0.7, -1.7], c: '#FFE66D' },
          ].map((b, i) => (
            <mesh key={i} position={[b.pos[0], b.pos[1], b.pos[2]]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={b.c} />
            </mesh>
          ))}
          {/* Couch */}
          <mesh position={[0, -1.5, -2.5]}>
            <boxGeometry args={[2, 0.5, 0.6]} />
            <meshStandardMaterial color="#4B0082" />
          </mesh>
        </group>
      );
    
    case 'park':
    default:
      return (
        <group>
          {/* Trees */}
          {[
            { pos: [-3, -1, -2] },
            { pos: [3, -1.2, -2.5] },
            { pos: [-1.5, -1.3, -3] },
          ].map((t, i) => (
            <group key={i} position={[t.pos[0], t.pos[1], t.pos[2]]}>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 1.2, 0]}>
                <coneGeometry args={[0.6, 1.2, 8]} />
                <meshStandardMaterial color="#228B22" />
              </mesh>
            </group>
          ))}
          {/* Bench */}
          <mesh position={[1.5, -1.7, -1]}>
            <boxGeometry args={[0.8, 0.1, 0.3]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Sun */}
          <mesh position={[4, 3, -5]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
  }
}

function Background({ scenario }: { scenario: string }) {
  const config = scenarioBackgrounds[scenario] || scenarioBackgrounds.free;
  
  return (
    <>
      {/* Sky background */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial color={config.skyColor} />
      </mesh>
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={config.groundColor} />
      </mesh>
      
      {/* Scenario elements */}
      <ScenarioElements type={config.elements} />
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
  const currentStoryMode = useLearningStore(state => state.currentStoryMode);
  const scenario = currentStoryMode || 'free';
  const config = scenarioBackgrounds[scenario] || scenarioBackgrounds.free;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={config.ambientIntensity} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 5, 5]} intensity={0.4} />
        <Background scenario={scenario} />
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
