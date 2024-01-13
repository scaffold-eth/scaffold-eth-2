import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { CashInteraction } from "~~/components/example-ui/CashInteraction";

const CashPage: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="NotaPay | Pay on Your Terms"
        description="Interact with Denota Protocol to send customized payments"
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      {/* className="grid lg:grid-cols-1 flex-grow" */}
      <div data-theme="exampleUi"> 
        <CashInteraction />
      </div>
    </>
  );
};

export default CashPage;
