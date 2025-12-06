import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, Sky, Cloud, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useLearningStore } from '@/stores/learningStore';

// Enhanced background configurations for each scenario
const scenarioBackgrounds: Record<string, {
  skyColor: string;
  groundColor: string;
  ambientIntensity: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  elements: string;
  timeOfDay: 'day' | 'night' | 'evening' | 'indoor';
}> = {
  restaurant: { 
    skyColor: '#1a0f0a', groundColor: '#2d1f17', ambientIntensity: 0.3, 
    fogColor: '#1a0f0a', fogNear: 5, fogFar: 15, elements: 'restaurant', timeOfDay: 'indoor' 
  },
  shopping: { 
    skyColor: '#e8e4d9', groundColor: '#d4cfc0', ambientIntensity: 0.9, 
    fogColor: '#f5f5f0', fogNear: 8, fogFar: 20, elements: 'shopping', timeOfDay: 'day' 
  },
  directions: { 
    skyColor: '#5a9fd4', groundColor: '#555555', ambientIntensity: 0.8, 
    fogColor: '#87ceeb', fogNear: 10, fogFar: 25, elements: 'city', timeOfDay: 'day' 
  },
  hotel: { 
    skyColor: '#2d2520', groundColor: '#4a3c32', ambientIntensity: 0.5, 
    fogColor: '#3d3530', fogNear: 6, fogFar: 18, elements: 'hotel', timeOfDay: 'indoor' 
  },
  doctor: { 
    skyColor: '#f0f5f8', groundColor: '#e0e5e8', ambientIntensity: 1.0, 
    fogColor: '#ffffff', fogNear: 10, fogFar: 25, elements: 'clinic', timeOfDay: 'indoor' 
  },
  'job-interview': { 
    skyColor: '#3a4a5a', groundColor: '#2a3a4a', ambientIntensity: 0.6, 
    fogColor: '#4a5a6a', fogNear: 8, fogFar: 20, elements: 'office', timeOfDay: 'day' 
  },
  cafe: { 
    skyColor: '#3d2817', groundColor: '#2a1c12', ambientIntensity: 0.4, 
    fogColor: '#4d3827', fogNear: 5, fogFar: 15, elements: 'cafe', timeOfDay: 'indoor' 
  },
  party: { 
    skyColor: '#0a0515', groundColor: '#150a20', ambientIntensity: 0.2, 
    fogColor: '#1a0f25', fogNear: 4, fogFar: 12, elements: 'party', timeOfDay: 'night' 
  },
  airport: { 
    skyColor: '#8fa8c0', groundColor: '#5a5a5a', ambientIntensity: 0.85, 
    fogColor: '#a0b8d0', fogNear: 10, fogFar: 30, elements: 'airport', timeOfDay: 'day' 
  },
  beach: { 
    skyColor: '#00b4d8', groundColor: '#e6c79c', ambientIntensity: 1.0, 
    fogColor: '#87d4eb', fogNear: 15, fogFar: 35, elements: 'beach', timeOfDay: 'day' 
  },
  museum: { 
    skyColor: '#1a1a1a', groundColor: '#121212', ambientIntensity: 0.35, 
    fogColor: '#222222', fogNear: 6, fogFar: 18, elements: 'museum', timeOfDay: 'indoor' 
  },
  gym: { 
    skyColor: '#404550', groundColor: '#303540', ambientIntensity: 0.75, 
    fogColor: '#505560', fogNear: 8, fogFar: 20, elements: 'gym', timeOfDay: 'indoor' 
  },
  bank: { 
    skyColor: '#2a3040', groundColor: '#1a2030', ambientIntensity: 0.55, 
    fogColor: '#3a4050', fogNear: 7, fogFar: 18, elements: 'bank', timeOfDay: 'indoor' 
  },
  library: { 
    skyColor: '#3d3025', groundColor: '#2a2218', ambientIntensity: 0.4, 
    fogColor: '#4d4035', fogNear: 5, fogFar: 15, elements: 'library', timeOfDay: 'indoor' 
  },
  market: { 
    skyColor: '#6ab0d4', groundColor: '#a58060', ambientIntensity: 0.9, 
    fogColor: '#8ac0e4', fogNear: 12, fogFar: 28, elements: 'market', timeOfDay: 'day' 
  },
  cinema: { 
    skyColor: '#050510', groundColor: '#0a0a15', ambientIntensity: 0.15, 
    fogColor: '#101020', fogNear: 4, fogFar: 12, elements: 'cinema', timeOfDay: 'night' 
  },
  free: { 
    skyColor: '#70b8e0', groundColor: '#4a8c4a', ambientIntensity: 0.85, 
    fogColor: '#a8d4f0', fogNear: 15, fogFar: 35, elements: 'park', timeOfDay: 'day' 
  },
};

// Realistic grass blades component
function GrassField({ count = 500, area = 15 }: { count?: number; area?: number }) {
  const grassData = useMemo(() => {
    const positions: [number, number, number][] = [];
    const rotations: [number, number, number][] = [];
    const scales: number[] = [];
    
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * area,
        -2.15,
        (Math.random() - 0.5) * area + 2
      ]);
      rotations.push([0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3]);
      scales.push(0.3 + Math.random() * 0.4);
    }
    return { positions, rotations, scales };
  }, [count, area]);

  return (
    <group>
      {grassData.positions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={grassData.rotations[i]} scale={grassData.scales[i]}>
          <planeGeometry args={[0.05, 0.2]} />
          <meshStandardMaterial color="#3a7a3a" side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Realistic tree component
function RealisticTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk with bark texture */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.22, 1.5, 12]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      {/* Tree crown - multiple layers for depth */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.8} />
      </mesh>
      <mesh position={[-0.3, 1.9, 0.2]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial color="#3a6a3a" roughness={0.8} />
      </mesh>
      <mesh position={[0.35, 1.7, -0.15]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#2a5030" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#4a7a4a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function ScenarioElements({ type }: { type: string }) {
  switch (type) {
    case 'restaurant':
      return (
        <group>
          {/* Elegant wooden floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#3d2817" roughness={0.7} />
          </mesh>
          {/* Table with tablecloth */}
          <group position={[-2.5, -1.2, -1]}>
            <mesh>
              <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
              <meshStandardMaterial color="#8b0000" roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.9, 16]} />
              <meshStandardMaterial color="#2a1a10" roughness={0.5} metalness={0.1} />
            </mesh>
          </group>
          {/* Wine glass */}
          <mesh position={[-2.3, -0.85, -0.9]}>
            <cylinderGeometry args={[0.05, 0.03, 0.15, 16]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.4} roughness={0.1} />
          </mesh>
          {/* Candle with glow */}
          <group position={[-2.5, -0.9, -1]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
              <meshStandardMaterial color="#f5e6d3" />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#ffa500" emissive="#ff6600" emissiveIntensity={2} />
            </mesh>
            <pointLight position={[0, 0.15, 0]} intensity={0.8} color="#ff9933" distance={3} decay={2} />
          </group>
          {/* Brick wall accent */}
          <mesh position={[0, 0, -4]}>
            <boxGeometry args={[8, 4, 0.2]} />
            <meshStandardMaterial color="#5a3020" roughness={0.9} />
          </mesh>
          {/* Wall sconces */}
          {[-2, 2].map((x, i) => (
            <group key={i} position={[x, 0.5, -3.8]}>
              <mesh>
                <boxGeometry args={[0.2, 0.3, 0.1]} />
                <meshStandardMaterial color="#c9a050" metalness={0.7} roughness={0.3} />
              </mesh>
              <pointLight intensity={0.4} color="#ffcc66" distance={4} decay={2} />
            </group>
          ))}
        </group>
      );
    
    case 'shopping':
      return (
        <group>
          {/* Polished floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#e8e0d0" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Clothing racks with realistic clothes */}
          <group position={[-3, 0, -2]}>
            {/* Rack structure */}
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.04, 1.8, 0.04]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[1, -0.5, 0]}>
              <boxGeometry args={[0.04, 1.8, 0.04]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.5, 0.4, 0]}>
              <boxGeometry args={[1.2, 0.03, 0.03]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Hanging clothes */}
            {[0.2, 0.5, 0.8].map((x, i) => (
              <group key={i} position={[x, 0, 0]}>
                <mesh position={[0, 0.1, 0]}>
                  <boxGeometry args={[0.3, 0.55, 0.08]} />
                  <meshStandardMaterial color={['#e63946', '#457b9d', '#2a9d8f'][i]} roughness={0.7} />
                </mesh>
              </group>
            ))}
          </group>
          {/* Mannequin */}
          <group position={[2.5, -1, -1.5]}>
            <mesh position={[0, 0.3, 0]}>
              <capsuleGeometry args={[0.15, 0.6, 8, 16]} />
              <meshStandardMaterial color="#e8e0d0" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#e8e0d0" roughness={0.3} />
            </mesh>
          </group>
          {/* Ceiling lights */}
          {[-2, 0, 2].map((x, i) => (
            <pointLight key={i} position={[x, 2, -1]} intensity={0.6} color="#fff8f0" distance={6} />
          ))}
        </group>
      );
    
    case 'city':
      return (
        <group>
          {/* Asphalt road */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 1]}>
            <planeGeometry args={[4, 10]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
          </mesh>
          {/* Sidewalk */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, -2.18, 0]}>
            <planeGeometry args={[3, 10]} />
            <meshStandardMaterial color="#8a8a8a" roughness={0.8} />
          </mesh>
          {/* Buildings with windows */}
          {[
            { pos: [-4, 1, -5], h: 5, w: 2, c: '#505a65' },
            { pos: [-1.5, 1.5, -6], h: 6, w: 2.5, c: '#606a75' },
            { pos: [3, 0.5, -5], h: 4, w: 2, c: '#556070' },
            { pos: [5, 1, -6], h: 5, w: 2, c: '#455565' },
          ].map((b, i) => (
            <group key={i} position={[b.pos[0], b.pos[1], b.pos[2]]}>
              <mesh>
                <boxGeometry args={[b.w, b.h, 1.2]} />
                <meshStandardMaterial color={b.c} roughness={0.6} />
              </mesh>
              {/* Windows */}
              {Array.from({ length: Math.floor(b.h / 1.2) }).map((_, wi) => (
                <mesh key={wi} position={[0, wi * 1.1 - b.h / 2 + 0.8, 0.61]}>
                  <planeGeometry args={[b.w * 0.7, 0.5]} />
                  <meshStandardMaterial 
                    color="#87ceeb" 
                    emissive="#4a90a4" 
                    emissiveIntensity={0.3} 
                    transparent 
                    opacity={0.8} 
                  />
                </mesh>
              ))}
            </group>
          ))}
          {/* Street lamp */}
          <group position={[1.5, -1, 1]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 2.5, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.9, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#fffae0" emissive="#ffd700" emissiveIntensity={1} />
            </mesh>
            <pointLight position={[0, 1.9, 0]} intensity={0.8} color="#ffd480" distance={5} />
          </group>
          {/* Road markings */}
          <mesh position={[0, -2.17, 1]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 1.5]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    
    case 'hotel':
      return (
        <group>
          {/* Marble floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#d4c8b8" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Grand reception desk */}
          <group position={[-2.5, -1.2, -2]}>
            <mesh>
              <boxGeometry args={[2, 1, 0.6]} />
              <meshStandardMaterial color="#3a2a1a" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <boxGeometry args={[2.1, 0.05, 0.65]} />
              <meshStandardMaterial color="#c9b896" roughness={0.3} />
            </mesh>
          </group>
          {/* Potted plant */}
          <group position={[2.5, -1.5, -1]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.2, 0.5, 8]} />
              <meshStandardMaterial color="#5a4030" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.5, 16, 12]} />
              <meshStandardMaterial color="#2a6030" roughness={0.7} />
            </mesh>
          </group>
          {/* Chandelier */}
          <group position={[0, 2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.4, 0.3, 0.15, 16]} />
              <meshStandardMaterial color="#c9a050" metalness={0.8} roughness={0.2} />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <group key={i} rotation={[0, (i / 6) * Math.PI * 2, 0]}>
                <mesh position={[0.35, -0.2, 0]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshStandardMaterial color="#fff8e0" emissive="#ffd700" emissiveIntensity={1.5} />
                </mesh>
              </group>
            ))}
            <pointLight intensity={1.2} color="#ffd480" distance={8} />
          </group>
          {/* Bell on desk */}
          <mesh position={[-2.2, -0.65, -1.8]}>
            <sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#c9a050" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    
    case 'clinic':
      return (
        <group>
          {/* Clean white floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#f0f2f4" roughness={0.3} />
          </mesh>
          {/* Medical equipment area */}
          <mesh position={[-3, 0.5, -2.5]}>
            <boxGeometry args={[0.8, 0.6, 0.08]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Red cross */}
          <group position={[-3, 0.5, -2.45]}>
            <mesh>
              <boxGeometry args={[0.5, 0.15, 0.02]} />
              <meshStandardMaterial color="#cc0000" />
            </mesh>
            <mesh>
              <boxGeometry args={[0.15, 0.5, 0.02]} />
              <meshStandardMaterial color="#cc0000" />
            </mesh>
          </group>
          {/* Examination chair */}
          <group position={[2, -1.2, -1]}>
            <mesh>
              <boxGeometry args={[0.7, 0.5, 1.2]} />
              <meshStandardMaterial color="#2563eb" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.5, -0.4]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.7, 0.1, 0.6]} />
              <meshStandardMaterial color="#2563eb" roughness={0.6} />
            </mesh>
          </group>
          {/* Bright clinical lights */}
          <pointLight position={[0, 2.5, 0]} intensity={1.5} color="#ffffff" distance={10} />
          <pointLight position={[-2, 2, -1]} intensity={0.8} color="#ffffff" distance={6} />
        </group>
      );
    
    case 'office':
      return (
        <group>
          {/* Corporate carpet */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#3a4550" roughness={0.9} />
          </mesh>
          {/* Executive desk */}
          <group position={[-2.5, -1.2, -2]}>
            <mesh>
              <boxGeometry args={[2, 0.08, 1]} />
              <meshStandardMaterial color="#2a2520" roughness={0.4} />
            </mesh>
            {/* Desk legs */}
            {[[-0.9, -0.55, -0.4], [0.9, -0.55, -0.4], [-0.9, -0.55, 0.4], [0.9, -0.55, 0.4]].map((pos, i) => (
              <mesh key={i} position={pos as [number, number, number]}>
                <boxGeometry args={[0.06, 0.95, 0.06]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
              </mesh>
            ))}
          </group>
          {/* Monitor */}
          <group position={[-2.5, -0.7, -2.3]}>
            <mesh>
              <boxGeometry args={[0.7, 0.45, 0.04]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0, 0.025]}>
              <boxGeometry args={[0.65, 0.4, 0.01]} />
              <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.3} />
            </mesh>
          </group>
          {/* Window with city view */}
          <group position={[3.5, 0.5, -3]}>
            <mesh>
              <boxGeometry args={[0.1, 2.5, 2]} />
              <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.05, 0, 0]}>
              <boxGeometry args={[0.02, 2.6, 0.1]} />
              <meshStandardMaterial color="#404040" />
            </mesh>
          </group>
          {/* Office chair */}
          <mesh position={[-2.5, -1.5, -1]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </mesh>
        </group>
      );
    
    case 'cafe':
      return (
        <group>
          {/* Wooden floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#4a3525" roughness={0.7} />
          </mesh>
          {/* Coffee counter */}
          <group position={[-2.5, -1.2, -2]}>
            <mesh>
              <boxGeometry args={[2, 1.1, 0.6]} />
              <meshStandardMaterial color="#3a2515" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.58, 0]}>
              <boxGeometry args={[2.1, 0.06, 0.65]} />
              <meshStandardMaterial color="#2a1a10" roughness={0.4} />
            </mesh>
          </group>
          {/* Espresso machine */}
          <group position={[-2.8, -0.5, -2.2]}>
            <mesh>
              <boxGeometry args={[0.5, 0.6, 0.4]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.35, 0.1]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
          {/* Coffee cups */}
          {[-2.2, -2.0].map((x, i) => (
            <group key={i} position={[x, -0.6, -1.8]}>
              <mesh>
                <cylinderGeometry args={[0.06, 0.05, 0.12, 16]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
          {/* Warm lighting */}
          <pointLight position={[-2, 0.5, -1]} intensity={0.6} color="#ff9933" distance={4} />
          <pointLight position={[2, 0.5, -1]} intensity={0.5} color="#ffaa44" distance={4} />
          {/* Menu board */}
          <mesh position={[2.5, 0.8, -2.8]}>
            <boxGeometry args={[1.2, 0.9, 0.08]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      );
    
    case 'party':
      return (
        <group>
          {/* Dance floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#1a0a20" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Disco lights */}
          <pointLight position={[-3, 2, 0]} intensity={1} color="#ff1493" distance={6} />
          <pointLight position={[3, 2, 0]} intensity={1} color="#00bfff" distance={6} />
          <pointLight position={[0, 2.5, -1]} intensity={0.8} color="#ffd700" distance={5} />
          {/* Disco ball */}
          <group position={[0, 2.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
            </mesh>
          </group>
          {/* Speakers */}
          {[-3.5, 3.5].map((x, i) => (
            <group key={i} position={[x, -0.8, -2.5]}>
              <mesh>
                <boxGeometry args={[0.6, 1.2, 0.5]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
              <mesh position={[0, 0.2, 0.26]}>
                <circleGeometry args={[0.2, 16]} />
                <meshStandardMaterial color="#2a2a2a" />
              </mesh>
            </group>
          ))}
          {/* Balloons */}
          {[
            { pos: [2.5, 0.8, -1.5], c: '#ff6b6b' },
            { pos: [2.8, 0.5, -1.3], c: '#4ecdc4' },
            { pos: [2.3, 1.0, -1.7], c: '#ffe66d' },
            { pos: [-2.5, 0.7, -1], c: '#ff69b4' },
          ].map((b, i) => (
            <mesh key={i} position={[b.pos[0], b.pos[1], b.pos[2]]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color={b.c} roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    
    case 'airport':
      return (
        <group>
          {/* Terminal floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#808080" roughness={0.4} metalness={0.1} />
          </mesh>
          {/* Departure board */}
          <group position={[-2.5, 0.8, -3]}>
            <mesh>
              <boxGeometry args={[1.8, 1.2, 0.15]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
              <boxGeometry args={[1.6, 1, 0.02]} />
              <meshStandardMaterial color="#0066cc" emissive="#003366" emissiveIntensity={0.5} />
            </mesh>
          </group>
          {/* Luggage */}
          <group position={[2.5, -1.6, -1]}>
            <mesh>
              <boxGeometry args={[0.6, 0.8, 0.35]} />
              <meshStandardMaterial color="#2f4f4f" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
          <mesh position={[2.9, -1.7, -0.8]}>
            <boxGeometry args={[0.45, 0.5, 0.3]} />
            <meshStandardMaterial color="#8b0000" roughness={0.5} />
          </mesh>
          {/* Window with sky view */}
          <mesh position={[0, 1, -4.5]}>
            <boxGeometry args={[8, 3, 0.1]} />
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.5} />
          </mesh>
          {/* Seating area */}
          {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
            <mesh key={i} position={[x, -1.5, 0]}>
              <boxGeometry args={[0.5, 0.6, 0.5]} />
              <meshStandardMaterial color="#2563eb" roughness={0.6} />
            </mesh>
          ))}
        </group>
      );

    case 'beach':
      return (
        <group>
          {/* Sandy beach */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[20, 10]} />
            <meshStandardMaterial color="#e6c79c" roughness={0.9} />
          </mesh>
          {/* Ocean */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.15, 6]}>
            <planeGeometry args={[20, 8]} />
            <meshStandardMaterial color="#0077be" transparent opacity={0.85} roughness={0.3} />
          </mesh>
          {/* Sun */}
          <group position={[4, 3, -6]}>
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color="#ffd700" emissive="#ff8c00" emissiveIntensity={1.5} />
            </mesh>
            <pointLight intensity={2} color="#ffd480" distance={15} />
          </group>
          {/* Palm tree */}
          <group position={[-3.5, -1, -2]}>
            <mesh position={[0, 0.8, 0]} rotation={[0.05, 0, 0.08]}>
              <cylinderGeometry args={[0.12, 0.18, 2.5, 8]} />
              <meshStandardMaterial color="#5a4030" roughness={0.9} />
            </mesh>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh 
                key={i} 
                position={[Math.cos(i * 1.25) * 0.6, 2.2, Math.sin(i * 1.25) * 0.6]} 
                rotation={[0.6, i * 1.25, 0]}
              >
                <boxGeometry args={[0.15, 1.2, 0.03]} />
                <meshStandardMaterial color="#228b22" />
              </mesh>
            ))}
          </group>
          {/* Beach umbrella */}
          <group position={[2, -1.2, -1]}>
            <mesh position={[0, 0.8, 0]} rotation={[0.15, 0, 0]}>
              <coneGeometry args={[1.2, 0.6, 12]} />
              <meshStandardMaterial color="#ff6347" />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1.8, 8]} />
              <meshStandardMaterial color="#f5deb3" />
            </mesh>
          </group>
          {/* Beach ball */}
          <mesh position={[-1, -1.9, -0.5]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#ff69b4" />
          </mesh>
        </group>
      );

    case 'museum':
      return (
        <group>
          {/* Polished museum floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Framed paintings */}
          {[
            { pos: [-3.5, 0.5, -3], c: '#8b0000', s: [1, 0.8] },
            { pos: [3.5, 0.6, -3], c: '#00008b', s: [0.9, 1.1] },
            { pos: [0, 0.8, -3.5], c: '#ffd700', s: [1.2, 0.9] },
          ].map((p, i) => (
            <group key={i} position={[p.pos[0], p.pos[1], p.pos[2]]}>
              {/* Frame */}
              <mesh>
                <boxGeometry args={[p.s[0] + 0.15, p.s[1] + 0.15, 0.08]} />
                <meshStandardMaterial color="#c9a050" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Canvas */}
              <mesh position={[0, 0, 0.04]}>
                <boxGeometry args={[p.s[0], p.s[1], 0.02]} />
                <meshStandardMaterial color={p.c} />
              </mesh>
              {/* Spotlight */}
              <pointLight position={[0, 0.8, 0.5]} intensity={0.4} color="#fffacd" distance={3} />
            </group>
          ))}
          {/* Sculpture pedestal */}
          <group position={[0, -1.3, -1]}>
            <mesh>
              <boxGeometry args={[0.7, 0.9, 0.7]} />
              <meshStandardMaterial color="#e0e0e0" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial color="#f5f5f5" metalness={0.2} roughness={0.5} />
            </mesh>
          </group>
        </group>
      );

    case 'gym':
      return (
        <group>
          {/* Rubber floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.8} />
          </mesh>
          {/* Dumbbell rack */}
          <group position={[-3, -1.5, -2]}>
            <mesh>
              <boxGeometry args={[1.5, 0.8, 0.4]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
            </mesh>
            {[-0.4, 0, 0.4].map((x, i) => (
              <group key={i} position={[x, 0.2, 0.25]} rotation={[0, 0, Math.PI / 2]}>
                <mesh>
                  <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
                  <meshStandardMaterial color="#404040" metalness={0.7} />
                </mesh>
              </group>
            ))}
          </group>
          {/* Treadmill */}
          <group position={[2.5, -1.4, -1.5]}>
            <mesh>
              <boxGeometry args={[0.9, 0.25, 1.8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0.8, -0.7]}>
              <boxGeometry args={[0.7, 1.4, 0.1]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
          </group>
          {/* Exercise ball */}
          <mesh position={[-1, -1.6, -0.5]}>
            <sphereGeometry args={[0.45, 32, 32]} />
            <meshStandardMaterial color="#4169e1" roughness={0.6} />
          </mesh>
          {/* Wall mirror */}
          <mesh position={[0, 0.2, -3.5]}>
            <planeGeometry args={[4, 2.5]} />
            <meshStandardMaterial color="#e8e8e8" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Bright gym lights */}
          {[-2, 0, 2].map((x, i) => (
            <pointLight key={i} position={[x, 2.5, 0]} intensity={0.7} color="#ffffff" distance={6} />
          ))}
        </group>
      );

    case 'bank':
      return (
        <group>
          {/* Marble floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#d4d8dc" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Teller counter */}
          <group position={[-2.5, -1.1, -2]}>
            <mesh>
              <boxGeometry args={[2.5, 1.2, 0.6]} />
              <meshStandardMaterial color="#2a3a4a" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.62, 0]}>
              <boxGeometry args={[2.55, 0.06, 0.65]} />
              <meshStandardMaterial color="#1a2a3a" roughness={0.4} />
            </mesh>
          </group>
          {/* Glass partition */}
          <mesh position={[-2.5, -0.1, -2]}>
            <boxGeometry args={[2.5, 1, 0.05]} />
            <meshStandardMaterial color="#a0c4e8" transparent opacity={0.3} />
          </mesh>
          {/* ATM */}
          <group position={[2.8, -0.9, -2.5]}>
            <mesh>
              <boxGeometry args={[0.7, 1.4, 0.5]} />
              <meshStandardMaterial color="#2a3a4a" />
            </mesh>
            <mesh position={[0, 0.2, 0.26]}>
              <boxGeometry args={[0.5, 0.35, 0.02]} />
              <meshStandardMaterial color="#00cc66" emissive="#00aa55" emissiveIntensity={0.4} />
            </mesh>
          </group>
          {/* Vault door */}
          <group position={[0, -0.3, -3.5]}>
            <mesh>
              <circleGeometry args={[1.2, 32]} />
              <meshStandardMaterial color="#4a5568" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <torusGeometry args={[0.8, 0.08, 8, 32]} />
              <meshStandardMaterial color="#2a3548" metalness={0.9} roughness={0.3} />
            </mesh>
          </group>
          {/* Rope barriers */}
          {[-1, 0, 1].map((x, i) => (
            <group key={i} position={[x, -1.5, 0.5]}>
              <mesh>
                <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
                <meshStandardMaterial color="#c9a050" metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      );

    case 'library':
      return (
        <group>
          {/* Wooden floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#5a4535" roughness={0.7} />
          </mesh>
          {/* Bookshelves */}
          {[-4, 4].map((x, i) => (
            <group key={i} position={[x, 0.2, -3]}>
              <mesh>
                <boxGeometry args={[1.4, 3, 0.5]} />
                <meshStandardMaterial color="#4a3525" roughness={0.6} />
              </mesh>
              {/* Books on shelves */}
              {[-0.8, 0, 0.8].map((y, j) => (
                <group key={j} position={[0, y, 0.2]}>
                  {[-0.4, -0.2, 0, 0.2, 0.4].map((bx, k) => (
                    <mesh key={k} position={[bx, 0, 0]}>
                      <boxGeometry args={[0.15, 0.35, 0.25]} />
                      <meshStandardMaterial color={['#8b0000', '#006400', '#00008b', '#8b4513', '#4a0080'][k]} />
                    </mesh>
                  ))}
                </group>
              ))}
            </group>
          ))}
          {/* Reading desk with lamp */}
          <group position={[0, -1.2, -1]}>
            <mesh>
              <boxGeometry args={[1.8, 0.08, 1]} />
              <meshStandardMaterial color="#5a4030" roughness={0.5} />
            </mesh>
            {/* Desk lamp */}
            <group position={[0.6, 0.25, -0.3]}>
              <mesh>
                <cylinderGeometry args={[0.1, 0.15, 0.08, 16]} />
                <meshStandardMaterial color="#c9a050" metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.2, 0]} rotation={[0.3, 0, 0]}>
                <coneGeometry args={[0.12, 0.2, 16, 1, true]} />
                <meshStandardMaterial color="#c9a050" metalness={0.7} side={THREE.DoubleSide} />
              </mesh>
              <pointLight position={[0, 0.1, 0.1]} intensity={0.5} color="#fffacd" distance={2} />
            </group>
            {/* Open book */}
            <mesh position={[-0.2, 0.06, 0]} rotation={[-0.15, 0.1, 0]}>
              <boxGeometry args={[0.4, 0.02, 0.3]} />
              <meshStandardMaterial color="#fffff0" />
            </mesh>
          </group>
          {/* Warm ambient lighting */}
          <pointLight position={[0, 2, 0]} intensity={0.4} color="#ffd480" distance={8} />
        </group>
      );

    case 'market':
      return (
        <group>
          {/* Cobblestone ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#8a7a6a" roughness={0.9} />
          </mesh>
          {/* Fruit stand */}
          <group position={[-3, -1.2, -1.5]}>
            <mesh>
              <boxGeometry args={[1.8, 0.9, 0.7]} />
              <meshStandardMaterial color="#6a4a30" roughness={0.7} />
            </mesh>
            {/* Awning */}
            <mesh position={[0, 0.7, 0.2]} rotation={[0.25, 0, 0]}>
              <boxGeometry args={[2, 0.05, 1.2]} />
              <meshStandardMaterial color="#d9534f" />
            </mesh>
            {/* Fruits */}
            {[
              { pos: [-0.5, 0.15, 0], c: '#ff6347' },
              { pos: [-0.2, 0.15, 0.1], c: '#ffd700' },
              { pos: [0.1, 0.15, -0.05], c: '#32cd32' },
              { pos: [0.4, 0.15, 0.08], c: '#ff4500' },
            ].map((f, i) => (
              <mesh key={i} position={[f.pos[0], f.pos[1], f.pos[2]]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial color={f.c} roughness={0.6} />
              </mesh>
            ))}
          </group>
          {/* Vegetable crates */}
          <group position={[2.5, -1.6, -1]}>
            <mesh>
              <boxGeometry args={[0.7, 0.45, 0.55]} />
              <meshStandardMaterial color="#8b7355" roughness={0.8} />
            </mesh>
          </group>
          {/* Hanging scale */}
          <group position={[0, -0.3, -1.5]}>
            <mesh>
              <cylinderGeometry args={[0.35, 0.35, 0.12, 16]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
          {/* Bright outdoor lighting */}
          <pointLight position={[0, 3, 0]} intensity={1} color="#fff8e0" distance={10} />
        </group>
      );

    case 'cinema':
      return (
        <group>
          {/* Dark carpet */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#0a0a12" roughness={0.9} />
          </mesh>
          {/* Movie screen */}
          <group position={[0, 0.8, -5]}>
            <mesh>
              <boxGeometry args={[6, 3, 0.15]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
              <boxGeometry args={[5.5, 2.7, 0.02]} />
              <meshStandardMaterial color="#2a2a40" emissive="#1a1a30" emissiveIntensity={0.3} />
            </mesh>
          </group>
          {/* Theater seats - multiple rows */}
          {[-2, -1, 0, 1, 2].map((x) => (
            [-0.5, 0.5, 1.5].map((z, i) => (
              <mesh key={`${x}-${i}`} position={[x * 0.9, -1.4 - i * 0.15, z]}>
                <boxGeometry args={[0.55, 0.5, 0.5]} />
                <meshStandardMaterial color="#8b0000" roughness={0.7} />
              </mesh>
            ))
          ))}
          {/* Popcorn bucket */}
          <group position={[3, -1.2, 0.5]}>
            <mesh>
              <cylinderGeometry args={[0.18, 0.12, 0.35, 8]} />
              <meshStandardMaterial color="#cc0000" />
            </mesh>
          </group>
          {/* Exit sign */}
          <mesh position={[3.5, 1.8, -2]}>
            <boxGeometry args={[0.6, 0.25, 0.06]} />
            <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.8} />
          </mesh>
          {/* Very dim ambient lighting */}
          <pointLight position={[-3.5, 1.5, -1]} intensity={0.08} color="#4169e1" distance={5} />
          <pointLight position={[3.5, 1.5, -1]} intensity={0.08} color="#4169e1" distance={5} />
        </group>
      );

    case 'park':
    default:
      return (
        <group>
          {/* Grass field */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
            <planeGeometry args={[25, 25]} />
            <meshStandardMaterial color="#3a7a3a" roughness={0.9} />
          </mesh>
          {/* Grass blades */}
          <GrassField count={300} area={12} />
          {/* Realistic trees */}
          <RealisticTree position={[-4, -1, -3]} />
          <RealisticTree position={[4, -1, -4]} />
          <RealisticTree position={[-2, -1, -5]} />
          {/* Park bench */}
          <group position={[2, -1.6, -1]}>
            <mesh>
              <boxGeometry args={[1.2, 0.08, 0.35]} />
              <meshStandardMaterial color="#5a4030" roughness={0.6} />
            </mesh>
            {/* Bench legs */}
            {[-0.5, 0.5].map((x, i) => (
              <mesh key={i} position={[x, -0.25, 0]}>
                <boxGeometry args={[0.08, 0.45, 0.35]} />
                <meshStandardMaterial color="#3a2a20" />
              </mesh>
            ))}
            {/* Bench back */}
            <mesh position={[0, 0.25, -0.12]}>
              <boxGeometry args={[1.2, 0.4, 0.06]} />
              <meshStandardMaterial color="#5a4030" roughness={0.6} />
            </mesh>
          </group>
          {/* Path */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.17, 2]}>
            <planeGeometry args={[1.5, 6]} />
            <meshStandardMaterial color="#a09080" roughness={0.8} />
          </mesh>
          {/* Sun */}
          <group position={[5, 4, -8]}>
            <mesh>
              <sphereGeometry args={[0.6, 32, 32]} />
              <meshStandardMaterial color="#ffd700" emissive="#ff8c00" emissiveIntensity={1} />
            </mesh>
            <pointLight intensity={1.5} color="#ffd480" distance={20} />
          </group>
        </group>
      );
  }
}

function Background({ scenario }: { scenario: string }) {
  const config = scenarioBackgrounds[scenario] || scenarioBackgrounds.free;
  
  return (
    <>
      {/* Sky gradient background */}
      <mesh position={[0, 5, -15]}>
        <planeGeometry args={[60, 40]} />
        <meshBasicMaterial color={config.skyColor} />
      </mesh>
      
      {/* Add clouds for outdoor day scenes */}
      {config.timeOfDay === 'day' && (
        <>
          <Cloud position={[-8, 5, -10]} opacity={0.4} speed={0.2} />
          <Cloud position={[6, 6, -12]} opacity={0.3} speed={0.15} />
          <Cloud position={[0, 7, -14]} opacity={0.35} speed={0.18} />
        </>
      )}
      
      {/* Add stars for night scenes */}
      {config.timeOfDay === 'night' && (
        <Stars radius={50} depth={30} count={200} factor={3} saturation={0} fade speed={0.5} />
      )}
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={config.groundColor} roughness={0.8} />
      </mesh>
      
      {/* Fog effect */}
      <fog attach="fog" args={[config.fogColor, config.fogNear, config.fogFar]} />
      
      {/* Scenario elements */}
      <ScenarioElements type={config.elements} />
    </>
  );
}

// Enhanced detailed owl with lip sync
function Owl({ isSpeaking = false }: { isSpeaking?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const beakTopRef = useRef<THREE.Mesh>(null);
  const beakBottomRef = useRef<THREE.Mesh>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Subtle body sway
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.4) * 0.08;
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.03;
    }
    
    // Head movement - looks around curiously
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.6) * 0.15;
      headRef.current.rotation.x = Math.sin(time * 0.8) * 0.05;
      headRef.current.rotation.z = Math.sin(time * 0.5) * 0.03;
    }
    
    // Eye blinking animation
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(time * 2.5);
      const blink = blinkCycle > 0.92 ? Math.max(0.1, 1 - (blinkCycle - 0.92) * 12) : 1;
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;
    }
    
    // Eyebrow expressions - raise when speaking
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      const baseY = 1.35;
      const raiseAmount = isSpeaking ? Math.sin(time * 4) * 0.03 + 0.05 : 0;
      leftEyebrowRef.current.position.y = baseY + raiseAmount;
      rightEyebrowRef.current.position.y = baseY + raiseAmount;
    }
    
    // Lip sync - beak movement when speaking
    if (beakTopRef.current && beakBottomRef.current) {
      if (isSpeaking) {
        // Create varied mouth movements for speech
        const mouthOpen = Math.abs(Math.sin(time * 12)) * 0.12 + 
                         Math.abs(Math.sin(time * 8)) * 0.06 +
                         Math.abs(Math.sin(time * 15)) * 0.04;
        beakTopRef.current.rotation.x = -0.1 - mouthOpen * 0.3;
        beakBottomRef.current.rotation.x = 0.1 + mouthOpen * 0.5;
        beakBottomRef.current.position.y = 0.42 - mouthOpen * 0.08;
      } else {
        // Subtle breathing movement when idle
        const breathe = Math.sin(time * 1.5) * 0.02;
        beakTopRef.current.rotation.x = -0.1 + breathe;
        beakBottomRef.current.rotation.x = 0.1 - breathe;
        beakBottomRef.current.position.y = 0.42;
      }
    }
    
    // Wing fluttering - more active when speaking
    if (leftWingRef.current && rightWingRef.current) {
      const wingBase = isSpeaking ? 0.15 : 0.05;
      const wingSpeed = isSpeaking ? 6 : 2;
      leftWingRef.current.rotation.z = 0.3 + Math.sin(time * wingSpeed) * wingBase;
      rightWingRef.current.rotation.z = -0.3 - Math.sin(time * wingSpeed) * wingBase;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Body - more detailed with layered feathers */}
        <group position={[0, -0.5, 0]}>
          {/* Main body */}
          <mesh>
            <sphereGeometry args={[1.25, 32, 32]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} />
          </mesh>
          {/* Feather texture layers */}
          {[0.3, 0.5, 0.7].map((y, i) => (
            <mesh key={i} position={[0, y - 0.3, 0.6]} scale={[1 - i * 0.15, 0.15, 0.8]}>
              <sphereGeometry args={[0.6, 16, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#1fa84d' : '#28d05a'} roughness={0.8} />
            </mesh>
          ))}
          {/* Belly with gradient effect */}
          <mesh position={[0, 0, 0.85]}>
            <sphereGeometry args={[0.85, 32, 32]} />
            <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
          </mesh>
          {/* Belly feather details */}
          {[-0.2, 0, 0.2].map((y, i) => (
            <mesh key={i} position={[0, y, 1.05]} scale={[0.6, 0.12, 0.3]}>
              <sphereGeometry args={[0.5, 12, 8]} />
              <meshStandardMaterial color="#e8e8cc" roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* Head group for independent movement */}
        <group ref={headRef} position={[0, 0.85, 0]}>
          {/* Main head */}
          <mesh>
            <sphereGeometry args={[0.95, 32, 32]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} />
          </mesh>
          
          {/* Face disc - characteristic owl feature */}
          <mesh position={[0, 0, 0.55]}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
          </mesh>
          
          {/* Face disc outline feathers */}
          <mesh position={[0, 0, 0.4]} scale={[1.1, 1.1, 0.3]}>
            <torusGeometry args={[0.55, 0.08, 8, 32]} />
            <meshStandardMaterial color="#1a9940" roughness={0.8} />
          </mesh>

          {/* Left ear tuft with detail */}
          <group position={[-0.55, 0.7, 0]} rotation={[0, 0, 0.35]}>
            <mesh>
              <coneGeometry args={[0.18, 0.55, 16]} />
              <meshStandardMaterial color="#16a34a" roughness={0.7} />
            </mesh>
            <mesh position={[0.08, 0.1, 0]} scale={[0.6, 0.8, 0.6]}>
              <coneGeometry args={[0.15, 0.4, 12]} />
              <meshStandardMaterial color="#1fa84d" roughness={0.7} />
            </mesh>
          </group>

          {/* Right ear tuft with detail */}
          <group position={[0.55, 0.7, 0]} rotation={[0, 0, -0.35]}>
            <mesh>
              <coneGeometry args={[0.18, 0.55, 16]} />
              <meshStandardMaterial color="#16a34a" roughness={0.7} />
            </mesh>
            <mesh position={[-0.08, 0.1, 0]} scale={[0.6, 0.8, 0.6]}>
              <coneGeometry args={[0.15, 0.4, 12]} />
              <meshStandardMaterial color="#1fa84d" roughness={0.7} />
            </mesh>
          </group>

          {/* Eyes with more detail */}
          {/* Left eye socket */}
          <mesh position={[-0.28, 0.1, 0.75]}>
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Left eye white */}
          <mesh position={[-0.28, 0.1, 0.82]}>
            <sphereGeometry args={[0.24, 32, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Left iris */}
          <mesh position={[-0.28, 0.1, 0.98]}>
            <sphereGeometry args={[0.16, 32, 32]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          {/* Left pupil */}
          <mesh ref={leftEyeRef} position={[-0.28, 0.1, 1.08]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          {/* Left eye shine */}
          <mesh position={[-0.22, 0.18, 1.12]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.32, 0.05, 1.1]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>

          {/* Right eye socket */}
          <mesh position={[0.28, 0.1, 0.75]}>
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Right eye white */}
          <mesh position={[0.28, 0.1, 0.82]}>
            <sphereGeometry args={[0.24, 32, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Right iris */}
          <mesh position={[0.28, 0.1, 0.98]}>
            <sphereGeometry args={[0.16, 32, 32]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          {/* Right pupil */}
          <mesh ref={rightEyeRef} position={[0.28, 0.1, 1.08]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          {/* Right eye shine */}
          <mesh position={[0.34, 0.18, 1.12]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.24, 0.05, 1.1]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>

          {/* Eyebrows - expressive feathers above eyes */}
          <mesh ref={leftEyebrowRef} position={[-0.28, 0.35, 0.9]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.25, 0.06, 0.08]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          <mesh ref={rightEyebrowRef} position={[0.28, 0.35, 0.9]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.25, 0.06, 0.08]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>

          {/* Beak - separated top and bottom for speech animation */}
          <group position={[0, -0.15, 1]}>
            {/* Top beak */}
            <mesh ref={beakTopRef} position={[0, 0.52, 0]} rotation={[-0.1, 0, 0]}>
              <coneGeometry args={[0.1, 0.22, 16]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.4} />
            </mesh>
            {/* Bottom beak */}
            <mesh ref={beakBottomRef} position={[0, 0.42, 0.02]} rotation={[0.1, 0, 0]} scale={[0.8, 0.6, 0.8]}>
              <coneGeometry args={[0.08, 0.15, 16]} />
              <meshStandardMaterial color="#e68a00" roughness={0.4} />
            </mesh>
          </group>
          
          {/* Cheek tufts */}
          <mesh position={[-0.5, -0.1, 0.5]} rotation={[0, -0.3, 0.2]}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#f5f0e0" roughness={0.7} />
          </mesh>
          <mesh position={[0.5, -0.1, 0.5]} rotation={[0, 0.3, -0.2]}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#f5f0e0" roughness={0.7} />
          </mesh>
        </group>

        {/* Left wing with feather detail */}
        <group ref={leftWingRef} position={[-1.15, -0.3, 0]} rotation={[0, 0, 0.3]}>
          <mesh>
            <sphereGeometry args={[0.55, 24, 24]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
          </mesh>
          {/* Wing feathers */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.2 - i * 0.15, -0.2 - i * 0.1, 0]} rotation={[0, 0, 0.2 + i * 0.1]} scale={[1, 1.3 + i * 0.2, 0.4]}>
              <sphereGeometry args={[0.2, 12, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#1a9940' : '#22c55e'} roughness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Right wing with feather detail */}
        <group ref={rightWingRef} position={[1.15, -0.3, 0]} rotation={[0, 0, -0.3]}>
          <mesh>
            <sphereGeometry args={[0.55, 24, 24]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
          </mesh>
          {/* Wing feathers */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0.2 + i * 0.15, -0.2 - i * 0.1, 0]} rotation={[0, 0, -0.2 - i * 0.1]} scale={[1, 1.3 + i * 0.2, 0.4]}>
              <sphereGeometry args={[0.2, 12, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#1a9940' : '#22c55e'} roughness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Tail feathers */}
        <group position={[0, -1.2, -0.6]}>
          {[-0.15, 0, 0.15].map((x, i) => (
            <mesh key={i} position={[x, 0, -0.1 * Math.abs(i - 1)]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.12, 0.4, 0.04]} />
              <meshStandardMaterial color={i === 1 ? '#16a34a' : '#1a9940'} roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* Feet with detailed talons */}
        {[-0.35, 0.35].map((x, footIndex) => (
          <group key={footIndex} position={[x, -1.65, 0.3]}>
            {/* Foot base */}
            <mesh>
              <boxGeometry args={[0.2, 0.08, 0.25]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.5} />
            </mesh>
            {/* Talons */}
            {[-0.06, 0, 0.06].map((tx, i) => (
              <mesh key={i} position={[tx, -0.02, 0.15]} rotation={[0.3, 0, 0]}>
                <coneGeometry args={[0.025, 0.1, 8]} />
                <meshStandardMaterial color="#e68a00" roughness={0.4} />
              </mesh>
            ))}
            {/* Back talon */}
            <mesh position={[0, -0.02, -0.1]} rotation={[-0.3, 0, 0]}>
              <coneGeometry args={[0.025, 0.08, 8]} />
              <meshStandardMaterial color="#e68a00" roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Speech indicator glow when speaking */}
        {isSpeaking && (
          <group position={[1.6, 1.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.2} />
            </mesh>
            <mesh position={[0.25, -0.15, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0.4, -0.25, 0]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
            </mesh>
          </group>
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
      <Canvas camera={{ position: [0, 0.5, 5.5], fov: 45 }} shadows>
        <ambientLight intensity={config.ambientIntensity * 0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.9} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 3, 5]} intensity={0.4} />
        <pointLight position={[0, 2, 3]} intensity={0.3} color="#ffffff" />
        <Background scenario={scenario} />
        <Owl isSpeaking={isSpeaking} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          minAzimuthAngle={-Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
