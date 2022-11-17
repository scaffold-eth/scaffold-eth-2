import type { NextPage } from "next";
import Head from "next/head";
import { useTempTestContract } from "~~/components/useTempTestContract";
import { useAppStore } from "~~/services/store/store";
import { Address, AddressInput, Balance } from "../components/scaffold-eth";
import { useEffect } from "react";
import { BigNumber } from "ethers";

const Home: NextPage = () => {
  const tempTest = useTempTestContract();

  const tempState = useAppStore(state => state.tempSlice.tempState);

  useEffect(() => {
    console.log("test state, in index.tsx:  " + tempState?.tempStuff);
  }, [tempState?.tempStuff]);
  return (
    <div className="px-8" >
      <Head>
        <title>Wagmi</title>
        <meta name="description" content="Wagmi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{
        textAlign: 'center',
        display: 'block',
      }}>
        {" "}
        <AddressInput />
        <br></br>
        {tempState?.tempStuff?.map(
          (setup, index) => (
            console.log("setup", setup),
            (
              <div style={{backgroundColor:'rgba(100,100,100,0.2)', border: '10px solid white', borderRadius:'25px', display:'inline-grid', margin:'2vw', color:'white'}}>
              <div key={index} style=
              {{display:'inline-block', 
                padding: '2vw', 
                margin: '8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 255, 0, 0.1)'
                }}>
                <div>setup {index}</div>
                <div style={{border:'1px solid white', padding: '10px', backgroundColor:'lightgreen', borderRadius: '10px', marginBottom: '5px'}}>RewardsPerBlock: {setup.rewardPerBlock?.toString()}</div>
                <div style={{border:'1px solid white', padding: '20px 20px', display:'inline-block', backgroundColor:'orange', borderRadius: '10px', marginRight: '5px'}}>Endblock: {setup.endBlock?.toNumber()}</div>
                <div style={{border:'1px solid white', padding: '35px', display:'inline-block', backgroundColor:'lightblue', borderRadius: '10px'}}>Supply: {setup.totalSupply?.toString()}</div>
                <br></br>
                <button style={{
                  borderRadius: '25px', 
                  border:'1px solid white', 
                  padding: '5px', 
                  backgroundColor: 'rgba(155, 35, 0)', 
                  marginTop:'16px',
                  }}>Start Farming</button>
              </div>
              </div>
            )
          ),
        )}
      </div>
    </div>
  );
};

export default Home;
