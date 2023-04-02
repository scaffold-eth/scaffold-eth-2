import { useRef } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import { Object3D } from "three";
import { Object3DProps, useFrame } from "@react-three/fiber";

/* const Oceans: React.FC<props> = ({ count }) => {
 *   const model = useGLTF("/ocean.glb");
 *   const [oceans, setOceans] = useState([]);
 *
 *   useEffect(() => {
 *     const newOceans = [];
 *     for (let i = 0; i < count; i++) {
 *       newOceans.push({
 *         position: {
 *           x: i * 100,
 *           z: i * 100,
 *         },
 *       });
 *     }
 *     setOceans(newOceans);
 *   }, [count]);
 *
 *   return (
 *     <Instances limit={100} range={100}>
 *       <mesh>
 *         <primitive object={model.scene} />
 *       </mesh>
 *       <Instance position={[1, 2, 3]} />
 *     </Instances>
 *   );
 * }; */

interface ShipProps extends Object3DProps {
  count?: number;
  range?: number;
}

interface MakeShipProps {
  x: number;
  y: number;
  z: number;
  rotation: number;
  rate: number;
}

function Ship({ x, y, z, rotation, rate }: MakeShipProps) {
  const model = useGLTF("/ship.glb");
  const ref = useRef<Object3D>(null!);

  useFrame(() => {
    if (ref.current.rotation.x > 0.2 || ref.current.rotation.x < -0.2) {
      rate = -rate;
    }
    ref.current.rotation.x += rate;
  });

  return (
    <object3D ref={ref} position={[x, y, z]} scale={[10, 10, 10]} rotation={[0, rotation, 0]}>
      <Clone object={model.scene} />
    </object3D>
  );
}

function Ships({ count = 10, range = 10 }: ShipProps) {
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
  return <Ships count={10} range={200} />;
}
