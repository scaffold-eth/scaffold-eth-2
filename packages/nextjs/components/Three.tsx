import { useRef, useState } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import { Object3D } from "three";
import { Object3DProps, useFrame } from "@react-three/fiber";

interface OceanProps extends Object3DProps {
  x: number;
  z: number;
}
const Ocean = ({ x, z }: OceanProps) => {
  const model = useGLTF("/ocean.glb");
  return (
    <object3D position={[x, 0, z]} scale={[0.05, 0.05, 0.05]}>
      <primitive object={model.scene.clone()} />
    </object3D>
  );
};

interface OceansProps extends Object3DProps {
  sideLength: number;
}
const Oceans = ({ sideLength }: OceansProps) => {
  const oceans = Array.from({ length: sideLength * sideLength }).map((_, index) => {
    const x = (index % sideLength) * 90 - (sideLength * 90) / 2;
    const z = Math.floor(index / sideLength) * 90 - (sideLength * 90) / 2;
    return { x, z };
  });

  return (
    <group>
      {oceans.map((ocean, index) => (
        <Ocean key={index} {...ocean} />
      ))}
    </group>
  );
};

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

    /* if (clicked) {
     *     ref.current.position.set(ref.current.position.x, ref.current.position.y - 0.1, ref.current.position.z);
     * } */
  });

  const onClick = () => {
    console.log("clicked a super epic ship");
    if (!ref.current) return;
    ref.current.position.set(ref.current.position.x, ref.current.position.y - 10, ref.current.position.z);
    setClicked(!clicked);
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

function Ships({ count = 10, range = 10 }: ShipsProps) {
  const ships = Array.from({ length: count }, () => {
    const x = Math.random() * range;
    const y = 0;
    const z = Math.random() * range;
    const rotation = Math.random() * Math.PI * 2;
    const rate = Math.random() * 0.001;
    return { x, y, z, rotation, rate };
  });

  return <group>{ships.map(Ship)}</group>;
}

export default function Three() {
  return (
    <group>
      <Ships count={10} range={400} />;
      <Oceans sideLength={10} />
    </group>
  );
}
