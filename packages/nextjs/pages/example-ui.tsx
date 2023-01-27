import type { NextPage } from "next";

const ExampleUI: NextPage = () => {
  return (
    <div className="grid grid-cols-2 flex-grow" data-theme="exampleUi">
      <div className="flex bg-base-300">Left block</div>
      <div className="">Right block</div>
    </div>
  );
};

export default ExampleUI;
