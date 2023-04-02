import { Ships, Oceans } from "~~/canvas";
// import MyScene from "~~/canvas/React-Spring";
import { Sun } from "~~/canvas/Sun";
import { Worm } from "~~/canvas/Worm";

export default function Three() {
  return (
    <group>
      <Ships count={10} range={400} />;
      <Oceans sideLength={10} />
      {/* <MyScene /> */}
      <Sun />
      <Worm />
    </group>
  );
}
