import { useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useSpring, animated, config } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";

export function Worm() {
  const model = useGLTF("/Worm.glb");
  const [active, setActive] = useState(false);

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    //@ts-ignore
    myMesh.current.rotation.y = a;
  });

  const { scale } = useSpring({
    scale: active ? 1000 : 500,
    config: config.wobbly,
  });

  return (
    <animated.mesh onClick={() => setActive(!active)} position={[-100, 100, -100]} scale={scale}>
      <primitive object={model.scene} />
    </animated.mesh>
  );
}
