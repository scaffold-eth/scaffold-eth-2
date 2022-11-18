import type { NextPage } from "next";
import Head from "next/head";
import { useTempTestContract } from "~~/components/useTempTestContract";
import { useAppStore } from "~~/services/store/store";
import { Address, AddressInput, Balance } from "../components/scaffold-eth";
import { useEffect } from "react";
import { BigNumber } from "ethers";
import { getFarming } from "../logic/farming";

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
              //write a shadow box for this div
              <div style={{ 
                borderRadius:'25px', 
                display:'inline-grid', 
                boxShadow:'0 16px 32px 0 rgba(0, 0, 0, 0.4)',
                margin:'2vw', 
                color:'white',
                background: "radial-gradient(#F24236, #4C0905)",
                }}>
              
              <div key={index} style=
              {{display:'inline-block', 
                padding: '2vw', 
                margin: '8px',
                borderRadius: '8px',  
                }}>
                <div>Setup {index}</div>
                
                <div style={{ 
                  padding: '10px', 
                  boxShadow:'0 16px 32px 0 rgba(0, 0, 0, 0.7)',
                  borderRadius: '10px', 
                  marginBottom: '15px', 
                  backgroundColor:'#2E86AB', 
                  }}>RewardsPerBlock: {setup.rewardPerBlock?.toString()}</div>
                
                <div style={{
                  boxShadow:'0 16px 32px 0 rgba(0, 0, 0, 0.7)', 
                  padding: '20px 20px', 
                  display:'inline-block', 
                  backgroundColor:'#2E86AB', 
                  borderRadius: '10px', 
                  marginRight: '15px',
                  }}>Endblock: {setup.endBlock?.toNumber()}</div>
                
                <div style={{ 
                  boxShadow:'0 16px 32px 0 rgba(0, 0, 0, 0.7)',
                  padding: '35px', 
                  display:'inline-block', 
                  backgroundColor:'#2E86AB', 
                  borderRadius: '10px',
                  }}>Supply: {setup.totalSupply?.toString()}
                  </div>

                <br></br>

                <button style={{
                  borderRadius: '25px', 
                  boxShadow:'0 16px 32px 0 rgba(0, 0, 0, 0.5)',
                  padding: '5px', 
                  backgroundColor: '#F02419', 
                  marginTop:'4vh',
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
