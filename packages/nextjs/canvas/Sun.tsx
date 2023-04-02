import { useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useSpring, animated, config } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";

export function Sun() {
  const model = useGLTF("/Sun.glb");
  const [active, setActive] = useState(false);

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    //@ts-ignore
    myMesh.current.rotation.y = a;
  });

  const { scale } = useSpring({
    scale: active ? 25 : 10,
    config: config.wobbly,
  });

  return (
    <animated.mesh onClick={() => setActive(!active)} position={[100, 100, 100]} scale={scale}>
      <primitive object={model.scene} />
    </animated.mesh>
  );
}
