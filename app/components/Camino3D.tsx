// app/components/Camino3D.tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const TOTAL_PIEDRAS = 30;
const DISTANCIA = 2;

const MIN_Z = 0;
const MAX_Z = (TOTAL_PIEDRAS - 1) * DISTANCIA;

function Camino() {
  const group = useRef<THREE.Group>(null);
  const velocity = useRef(0);
  const positionZ = useRef(0);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocity.current += e.deltaY * 0.01;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useFrame(() => {
    positionZ.current += velocity.current;
    velocity.current *= 0.85;

    // 🔒 Clamp de límites
    if (positionZ.current < MIN_Z) {
      positionZ.current = MIN_Z;
      velocity.current = 0; // cortas la inercia
    }

    if (positionZ.current > MAX_Z) {
      positionZ.current = MAX_Z;
      velocity.current = 0;
    }

    if (group.current) {
      group.current.position.z = positionZ.current;
    }
  });

  return (
    <group ref={group}>
      {[...Array(TOTAL_PIEDRAS)].map((_, i) => (
        <mesh key={i} position={[0, -1, -i * DISTANCIA]}>
          <boxGeometry args={[1.2, 0.25, 1.2]} />
          <meshStandardMaterial
            color={
              i === 0
                ? "#ff4444"
                : i === TOTAL_PIEDRAS - 1
                ? "#44aaff"
                : "#777"
            }
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Camino3D() {
  return (
    <Canvas camera={{ position: [0, 2, 4], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1} />
      <fog attach="fog" args={["#000", 5, 20]} />
      <Camino />
    </Canvas>
  );
}