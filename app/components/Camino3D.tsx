// app/components/Camino3D.tsx
"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Text } from "@react-three/drei"; // IMPORTANTE: Necesitas instalar esto
import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import * as THREE from "three";

// --- DATA: UX Terms ---
const UX_TERMS = [
  { term: "Doble Diamante", def: "Modelo de proceso de diseño con fases de divergencia y convergencia." },
  { term: "Design Thinking", def: "Metodología centrada en el usuario para resolver problemas complejos." },
  { term: "Scrum", def: "Marco de trabajo ágil para desarrollar productos complejos." },
  { term: "Metodologías Ágiles", def: "Conjunto de prácticas para el desarrollo de software iterativo." },
  { term: "Design Sprint", def: "Proceso de 5 días para validar ideas mediante prototipos." },
  { term: "Diseño centrado en el usuario", def: "Enfoque que pone las necesidades del usuario al centro del proceso." },
  { term: "Metodología VS Artefacto", def: "Diferencia entre el proceso (cómo lo hacemos) y el entregable (qué hacemos)." },
  { term: "MVP", def: "Producto Mínimo Viable: la versión más simple para validar una hipótesis." },
  { term: "Growth Hacking", def: "Estrategias de crecimiento rápido basadas en datos y experimentación." },
  { term: "Lean UX", def: "Diseño enfocado en ciclos rápidos de aprendizaje y menos documentación." },
  { term: "Dual Track", def: "Trabajo paralelo de Discovery (qué construir) y Delivery (construirlo)." },
  { term: "Prototipo", def: "Representación visual o interactiva de una idea para probarla." },
  { term: "Pivotar", def: "Cambiar fundamentalmente la dirección del producto basado en aprendizaje." },
  { term: "Kanban", def: "Sistema visual para gestionar el flujo de trabajo." },
  { term: "PBI de diseño", def: "Product Backlog Item relacionado con tareas de diseño." },
  { term: "UAT", def: "User Acceptance Testing: Pruebas finales antes del lanzamiento." },
  { term: "Sistemas de diseño", def: "Colección de reglas y componentes para mantener consistencia." },
  { term: "Diseño interfaz", def: "Diseño de la parte visual y funcional con la que interactúa el usuario." },
  { term: "Cross functional teams", def: "Equipos con miembros de diferentes disciplinas (UX, Dev, QA, etc)." },
  { term: "B2B / B2C", def: "Business to Business vs Business to Consumer." },
  { term: "Features", def: "Características o funcionalidades específicas de un producto." },
  { term: "Wireframe", def: "Esquema de baja fidelidad que muestra la estructura de la interfaz." },
  { term: "Tribus - Spotify", def: "Modelo de organización ágil escalada famoso por Spotify." },
  { term: "Calidad UX - ISO", def: "Estándares internacionales de usabilidad y ergonomía." },
  { term: "Product Designer", def: "Diseñador responsable de la experiencia completa del producto." },
  { term: "Miro y entiendo", def: "Fase de observación y empatía en el proceso de diseño." },
];

const DISTANCIA = 2.5;
const TOTAL_ITEMS = UX_TERMS.length;
const MIN_Z = 0;
const MAX_Z = (TOTAL_ITEMS - 1) * DISTANCIA;
const ZIG_ZAG_AMPLITUDE = 3;

const GROUND_TILE_SIZE = 10;

// Texture paths (Asegúrate de que estas rutas sean correctas en tu proyecto)
const STONE_TEXTURES = [
  `${process.env.NEXT_PUBLIC_BASE_PATH}/stone1.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/stone2.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/stone3.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/stone4.webp`
];

const FLOWER_TEXTURES = [
  `${process.env.NEXT_PUBLIC_BASE_PATH}/anemone.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/begonia.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/calla_lily.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/camellia.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/carnation.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/cherry_blossom.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/chrysanthemum.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/daffodil.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/dahlia.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/daisy.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/fleur-de-lis.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/freesia.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/gardenia.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/geranium.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/hydrangea.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/iris.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/jasmine.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/lavender.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/lily.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/lotus.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/magnolia.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/mallow.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/marigold.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/orchid.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/pansy.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/peony.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/petunia.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/poppy.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/rose.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/sunflower.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/tulip.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/violet.webp`,
  `${process.env.NEXT_PUBLIC_BASE_PATH}/wallflower.webp`
];

// --- UTILS ---
function getZigZagX(index: number): number {
  return Math.sin(index * 0.5) * ZIG_ZAG_AMPLITUDE;
}

function getRandomStoneTexture(index: number): string {
  const randomIndex = Math.floor(Math.abs(Math.sin(index * 12.9898) * 43758.5453) % STONE_TEXTURES.length);
  return STONE_TEXTURES[randomIndex];
}

function getFlowerTexturePath(index: number): string {
  const flowerIndex = index % FLOWER_TEXTURES.length;
  return FLOWER_TEXTURES[flowerIndex];
}

// --- COMPONENTS ---

function Piedra({ position, index }: { position: [number, number, number], index: number }) {
  const texturePath = useMemo(() => getRandomStoneTexture(index), [index]);
  const texture = useLoader(THREE.TextureLoader, texturePath);
  
  useMemo(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.needsUpdate = true;
    }
    return texture;
  }, [texture]);

  return (
    <mesh position={position} receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.8, 1.8]} />
      <meshStandardMaterial 
        map={texture} 
        transparent={true}
        roughness={0.9}
      />
    </mesh>
  );
}

// Componente para el Label estilo Glass
function GlassLabel({ text, visible }: { text: string, visible: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (groupRef.current) {
            // Billboard: que el texto siempre mire a la cámara
            groupRef.current.lookAt(camera.position);
        }
    });

    return (
        <group ref={groupRef} position={[0, 2.3, 0]}>
            {/* Fondo de vidrio */}
            <mesh position={[0, 0, -0.01]}>
                {/* Ajustamos el ancho dinámicamente o usamos un fijo generoso */}
                <planeGeometry args={[3.5, 0.8]} />
                <meshPhysicalMaterial 
                    color="#ffffff"
                    transmission={0.6}  // Transparencia tipo vidrio
                    opacity={1}
                    metalness={0.1}
                    roughness={0.15}    // Un poco borroso (frosted glass)
                    thickness={0.1}     // Grosor para refracción
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>
            
            {/* Borde sutil (opcional) */}
            <mesh position={[0, 0, -0.015]}>
                 <planeGeometry args={[3.55, 0.85]} />
                 <meshBasicMaterial color="white" opacity={0.3} transparent />
            </mesh>

            {/* Texto */}
            <Text
                fontSize={0.25}
                color="#000000" // Texto negro para contraste
                anchorX="center"
                anchorY="middle"
                maxWidth={3.2}
                lineHeight={1.2}
                font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff" // Fuente estándar
            >
                {text}
            </Text>
        </group>
    );
}

function FlowerImage({ texturePath, hovered }: { texturePath: string, hovered: boolean }) {
  const texture = useLoader(THREE.TextureLoader, texturePath);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1.2, 0]} rotation={[0, Math.PI, 0]} castShadow>
      <planeGeometry args={[1, 1.5]} />
      <meshStandardMaterial 
        map={texture} 
        transparent={true} 
        alphaTest={0.5} 
        emissive={hovered ? new THREE.Color("#ff69b4") : new THREE.Color("#000000")}
        emissiveIntensity={hovered ? 0.7 : 0}
      />
    </mesh>
  );
}

function Flower({ 
  position, 
  data, 
  onSelect,
  flowerIndex
}: { 
  position: [number, number, number], 
  data: { term: string, def: string },
  onSelect: (data: any) => void,
  flowerIndex: number 
}) {
  const [hovered, setHover] = useState(false);
  const texturePath = useMemo(() => getFlowerTexturePath(flowerIndex), [flowerIndex]);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  return (
    <group 
      position={position} 
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Label de Vidrio (Nuevo) */}
      <GlassLabel text={data.term} visible={true} />

      {/* Stem */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial color="green" />
      </mesh>
      
      {/* Flower Head */}
      <FlowerImage texturePath={texturePath} hovered={hovered} />
    </group>
  );
}

function Camino({ onSelectTerm }: { onSelectTerm: (t: any) => void }) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const velocity = useRef(0);
  const positionZ = useRef(0);
  
  // Refs para control táctil
  const touchStartY = useRef(0);
  const isTouching = useRef(false);

  useEffect(() => {
    // 1. Desktop Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocity.current += e.deltaY * 0.01;
    };

    // 2. Mobile Touch Logic
    const onTouchStart = (e: TouchEvent) => {
        isTouching.current = true;
        touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
        if (!isTouching.current) return;
        const currentY = e.touches[0].clientY;
        const deltaY = touchStartY.current - currentY; // Invertido: deslizar arriba = avanzar
        
        // Multiplicador de sensibilidad para touch (ajustar según gusto)
        velocity.current += deltaY * 0.03; 
        
        touchStartY.current = currentY; // Reset para el siguiente frame del movimiento
    };

    const onTouchEnd = () => {
        isTouching.current = false;
    };

    // Agregar Listeners
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useFrame(() => {
    positionZ.current += velocity.current;
    velocity.current *= 0.85; // Fricción

    // Límites
    if (positionZ.current < MIN_Z) {
      positionZ.current = MIN_Z;
      velocity.current = 0;
    }
    if (positionZ.current > MAX_Z + 10) {
      positionZ.current = MAX_Z + 10;
      velocity.current = 0;
    }

    if (group.current) {
      group.current.position.z = positionZ.current;
    }

    const currentIndex = positionZ.current / DISTANCIA;
    const targetX = getZigZagX(currentIndex);
    
    // Movimiento de cámara suave
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y = 4;
    camera.position.z = 6;

    const lookAtX = getZigZagX(currentIndex + 3);
    camera.lookAt(lookAtX, 0, -10);
  });

  return (
    <group ref={group}>
      {UX_TERMS.map((item, i) => {
        const x = getZigZagX(i);
        const z = -i * DISTANCIA;
        
        const isLeft = i % 2 === 0;
        const flowerOffset = isLeft ? -3.5 : 3.5;
        const flowerX = x + flowerOffset;

        return (
          <group key={i}>
            <Piedra position={[x, 0.01, z]} index={i} />
            
            <Flower 
              position={[flowerX, 0, z]} 
              data={item} 
              onSelect={onSelectTerm}
              flowerIndex={i} 
            />
          </group>
        );
      })}
      
      <Ground />
    </group>
  );
}

function Ground() {
  const groundTexture = useLoader(THREE.TextureLoader, `${process.env.NEXT_PUBLIC_BASE_PATH}/tile.webp`);
  
  useMemo(() => {
    if (groundTexture) {
      groundTexture.wrapS = THREE.RepeatWrapping;
      groundTexture.wrapT = THREE.RepeatWrapping;
      groundTexture.repeat.set(GROUND_TILE_SIZE, GROUND_TILE_SIZE * 2);
      groundTexture.needsUpdate = true;
    }
    return groundTexture;
  }, [groundTexture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[100, 200]} />
      <meshStandardMaterial map={groundTexture} />
    </mesh>
  );
}

// --- MAIN COMPONENT ---

export default function Camino3D() {
  const [selectedTerm, setSelectedTerm] = useState<{ term: string, def: string } | null>(null);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", touchAction: 'none' }}> {/* touchAction none es importante para evitar scroll nativo del navegador */}
      
      <Canvas
        shadows
        camera={{ position: [0, 5, 6], fov: 60 }}
        style={{ background: "#87CEEB" }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1} 
            castShadow 
          />
          <fog attach="fog" args={["#87CEEB", 5, 30]} />

          <Camino onSelectTerm={setSelectedTerm} />
        </Suspense>
      </Canvas>

      {selectedTerm && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
          zIndex: 10,
          backdropFilter: "blur(5px)"
        }}>
          <h2 style={{ color: "#ff1493", margin: "0 0 1rem 0", fontSize: "1.5rem" }}>
            {selectedTerm.term}
          </h2>
          <p style={{ color: "#333", lineHeight: "1.6", fontSize: "1rem" }}>
            {selectedTerm.def}
          </p>
          <button 
            onClick={() => setSelectedTerm(null)}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1.5rem",
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            Cerrar
          </button>
        </div>
      )}

      {!selectedTerm && (
        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          pointerEvents: "none",
          textAlign: "center",
          width: "100%"
        }}>
          <p>Desliza para caminar • Toca las flores</p>
        </div>
      )}
    </div>
  );
}