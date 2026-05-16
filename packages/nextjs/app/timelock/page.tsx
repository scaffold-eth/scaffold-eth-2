import { TimelockAdminPage } from "./_components/TimelockAdminPage";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Timelock Admin",
  description: "Schedule, cancel, and execute timelocked admin actions with Scaffold-ETH 2.",
});

const TimelockPage: NextPage = () => {
  return <TimelockAdminPage />;
};

export default TimelockPage;
