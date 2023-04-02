import { useMemo, useRef, useState } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import { Object3D } from "three";
import { Object3DProps, useFrame } from "@react-three/fiber";

interface ShipProps {
  x: number;
  y: number;
  z: number;
  rotation: number;
  rate: number;
}

function Ship({ x, y, z, rotation, rate }: ShipProps) {
  const model = useGLTF("/ship.glb");
  const ref = useRef<Object3D>(null);
  const [clicked, setClicked] = useState(false);

  useFrame(() => {
    if (!ref.current) return;
    if (ref.current.rotation.x > 0.2 || ref.current.rotation.x < -0.2) {
      rate = -rate;
    }
    ref.current.rotation.x += rate;

    if (clicked) {
      ref.current.position.set(ref.current.position.x, ref.current.position.y - 0.1, ref.current.position.z);
    }
  });

  const onClick = () => {
    console.log("clicked a super epic ship");
    if (!ref.current) return;
    setClicked(true);
  };

  const onPointerOver = () => {
    if (!ref.current) return;

    ref.current.scale.set(20, 20, 20);
  };

  const onPointerLeave = () => {
    if (!ref.current) return;

    ref.current.scale.set(10, 10, 10);
  };

  return (
    <object3D
      ref={ref}
      position={[x, y, z]}
      scale={[10, 10, 10]}
      rotation={[0, rotation, 0]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerLeave={onPointerLeave}
    >
      <Clone object={model.scene} deep />
    </object3D>
  );
}

interface ShipsProps extends Object3DProps {
  count?: number;
  range?: number;
}

export function Ships({ count = 10, range = 10 }: ShipsProps) {
  const ships = useMemo(() => {
    return Array.from({ length: count }, () => {
      const x = Math.random() * range;
      const y = 0;
      const z = Math.random() * range;
      const rotation = Math.random() * Math.PI * 2;
      const rate = Math.random() * 0.001;
      return { x, y, z, rotation, rate };
    });
  }, [count, range]);

  return <group>{ships.map(Ship)}</group>;
}
