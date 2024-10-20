"use client";

import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import Prints from "./Prints"


const Available: NextPage = () => {
  return (
    <div>
      <h1>Prints</h1>
      <Prints />
    </div>
  );
};

export default Available;
