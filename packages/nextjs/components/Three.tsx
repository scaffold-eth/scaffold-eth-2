import { Ships } from "../canvas/Ships";
import { Oceans } from "../canvas/Oceans";

export default function Three() {
  return (
    <group>
      <Ships count={10} range={400} />;
      <Oceans sideLength={10} />
    </group>
  );
}
