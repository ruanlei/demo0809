'use client';

import { Component, type ReactNode, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGame } from '../../lib/game/store';

function Fallback() {
  return <p className="scene-note">3D rendering is unavailable. You can finish the puzzle with the game controls.</p>;
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

function Block({ position, size, color }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return <mesh position={position}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} />
  </mesh>;
}

function Room() {
  const { inventory, door, dispatch } = useGame();

  return (
    <>
      <Block position={[0, -.12, 0]} size={[8.2, .24, 6.2]} color="#4b6d65" />
      <Block position={[0, 1.35, -3]} size={[8.2, 2.7, .2]} color="#577871" />
      <Block position={[-4, 1.35, 0]} size={[.2, 2.7, 6]} color="#45635d" />
      <Block position={[4, .25, 0]} size={[.2, .5, 6]} color="#69857a" />
      <Block position={[0, .18, 3]} size={[8.2, .36, .2]} color="#69857a" />
      <Block position={[1.9, 1.13, -2.86]} size={[1.65, 2.26, .15]} color="#b88b5c" />
      <Block position={[1.9, 1.07, -2.76]} size={[1.39, 2.13, .15]} color="#15211d" />
      <group position={[1.22, .03, -2.65]} rotation={[0, door === 'open' ? -1.18 : 0, 0]}
        onClick={(event) => { event.stopPropagation(); dispatch('tryOpenDoor'); }}>
        <Block position={[.67, 1.04, 0]} size={[1.34, 2.08, .13]} color="#80452f" />
        <Block position={[.67, 1.48, .08]} size={[1.05, .64, .05]} color="#9e6043" />
        <mesh position={[1.13, .9, .13]}>
          <sphereGeometry args={[.09, 16, 12]} />
          <meshStandardMaterial color="#ffd078" />
        </mesh>
      </group>
      <group position={[-2.4, 0, -.65]}
        onClick={(event) => { event.stopPropagation(); dispatch('interactWithNpc'); }}>
        <Block position={[0, .71, 0]} size={[.62, .95, .46]} color="#a6c3a1" />
        <Block position={[-.17, .16, 0]} size={[.22, .32, .38]} color="#283e37" />
        <Block position={[.17, .16, 0]} size={[.22, .32, .38]} color="#283e37" />
        <mesh position={[0, 1.45, 0]}>
          <sphereGeometry args={[.29, 24, 16]} />
          <meshStandardMaterial color="#d6a87d" />
        </mesh>
        <Block position={[0, 1.48, .263]} size={[.26, .07, .04]} color="#283e37" />
      </group>
      <Block position={[.65, .26, .85]} size={[.8, .52, .8]} color="#31514c" />
      {inventory === 'empty' && (
        <group position={[.65, .75, .85]}
          onClick={(event) => { event.stopPropagation(); dispatch('collectKey'); }}>
          <mesh position={[-.24, 0, 0]}>
            <torusGeometry args={[.136, .041, 12, 28]} />
            <meshStandardMaterial color="#ffd064" emissive="#aa6417" emissiveIntensity={.35} />
          </mesh>
          <Block position={[.065, 0, 0]} size={[.39, .09, .09]} color="#ffc758" />
          <Block position={[.195, -.09, 0]} size={[.09, .15, .09]} color="#ffc758" />
        </group>
      )}
    </>
  );
}

export default function GameScene() {
  const [supportsWebGL, setSupportsWebGL] = useState<boolean | null>(null);
  useEffect(() => {
    const context = document.createElement('canvas').getContext('webgl2');
    setSupportsWebGL(Boolean(context));
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }, []);

  if (supportsWebGL === null) return <p className="scene-note">Loading the room…</p>;
  if (!supportsWebGL) return <Fallback />;

  return (
    <div className="viewport">
      <SceneBoundary>
        <Canvas camera={{ position: [8, 7, 10], fov: 46 }} fallback={<Fallback />}>
          <color attach="background" args={['#141f20']} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[4, 7, 5]} intensity={2.2} color="#ffe1af" />
          <Room />
          <OrbitControls target={[0, .65, 0]} enablePan={false}
            minDistance={7} maxDistance={19} minPolarAngle={.28} maxPolarAngle={1.17}
            minAzimuthAngle={-.35} maxAzimuthAngle={1.15} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
