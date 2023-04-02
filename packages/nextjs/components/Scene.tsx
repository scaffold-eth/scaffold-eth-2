import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";

export default function Scene({ children, ...props }: any) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas
      {...props}
      style={{
        height: "100vh",
        width: "100vw",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      camera={{ position: [0, 500, 0] }}
    >
      <directionalLight intensity={1} />
      <ambientLight intensity={0.75} />
      {children}
      <Preload all />
      <OrbitControls />
    </Canvas>
  );
}
