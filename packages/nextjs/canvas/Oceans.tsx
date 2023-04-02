import { useGLTF } from "@react-three/drei";
import { Object3DProps } from "@react-three/fiber";

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

export const Oceans = ({ sideLength }: OceansProps) => {
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
