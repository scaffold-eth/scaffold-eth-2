import dynamic from "next/dynamic";
import { NextPage } from "next";

const AACard = dynamic(async () => await import("~~/components/AACard"), { ssr: false });
const Demo: NextPage = () => {
  return (
    <div>
      <AACard />
    </div>
  );
};

export default Demo;
