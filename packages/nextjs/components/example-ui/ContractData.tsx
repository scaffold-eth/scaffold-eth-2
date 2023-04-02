import FFont from "./threejs/fonts/Roboto.typeface.json";
import { Center, OrbitControls, Sparkles, Text3D } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { useScaffoldContractRead, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

const myFont: string = JSON.stringify(FFont);

export const ContractData = () => {
  const { data: currentGreeting } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "greeting",
  });

  useScaffoldEventSubscriber({
    contractName: "YourContract",
    eventName: "GreetingChange",
    listener: (greetingSetter, newGreeting, premium, value) => {
      console.log(greetingSetter, newGreeting, premium, value);
    },
  });

  return (
    <div className="flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        <Center>
          <Text3D font={JSON.parse(myFont)} bevelEnabled bevelSize={0.05}>
            {currentGreeting}
            <meshNormalMaterial />
          </Text3D>
        </Center>

        <Sparkles size={10} color="white" count={75} />
        <OrbitControls />
        <Perf position="bottom-right" />
      </Canvas>
    </div>
  );
};
