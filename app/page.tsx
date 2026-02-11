"use client";
import Image from "next/image";
import dynamic from "next/dynamic";

const Camino3D = dynamic(() => import("@/app/components/Camino3D"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Overlay fijo */}
      <div className="pointer-events-none absolute -top-20 left-0 right-0 z-10 flex flex-col items-center fade-in-down">
        <div className="relative">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/marco.webp`}
            alt="Marco decorativo"
            width={400}
            height={200}
            priority
          />
          <h1 className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-lime-600/50 italic">
            Glosario UX
          </h1>
        </div>

      </div>

      {/* Escena 3D ocupa toda la pantalla */}
      <Camino3D />
    </div>
  );
}