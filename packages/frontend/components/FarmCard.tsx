import { useTempTestContract } from "./useTempTestContract";
import { useAppStore } from "~~/services/store/store";
import { useEffect } from "react";

//write a ui container component to display useTempTestContract

export const FarmCard = () => {
    const tempState = useAppStore(state => state.tempSlice.tempState);
    useEffect(() => {
      console.log("test state, in FarmCard: " + tempState.tempStuff);
    }, [tempState?.tempStuff]);
    return (
      //write css for this div box inline
    
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        border: "1px solid black",
        width: "50%",
        margin: "auto",
        padding: "10px",
        marginTop: "20px",
      }}
    >
        <p>display data from cRead, in FarmCard: {tempState.state}</p>
        </div>
    );
    };
