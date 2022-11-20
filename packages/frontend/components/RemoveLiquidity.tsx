import React, { useState } from "react";
import Link from "next/link";
import InputUI from "../components/scaffold-eth/Contract/InputUI";
function AddLiquidity() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        <div
          style={{
            // format as button
            boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.7)",
            padding: "20px 20px",
            display: "inline-block",
            backgroundColor: "#2E86AB",
            borderRadius: "10px",
            marginRight: "15px",
          }}
        >
          Remove Liquidity
        </div>
      </button>

      {
        //cover the pop-up with a div that covers the whole screen
        isOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div>{/*<InputUI paramType="uint256" functionFragment={displayedContractFunctions[0]} />*/}</div>
            <button
              style={{
                boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.7)",
                padding: "20px 20px",
                display: "inline-block",
                backgroundColor: "#2E86AB",
                borderRadius: "10px",
                marginRight: "15px",
              }}
            >
              <Link href={`/debug`}>
                <a>View Fuctions</a>
              </Link>
            </button>
            <button onClick={() => setIsOpen(false)}>Close Pop-up</button>
          </div>
        )
      }
    </div>
  );
}

export default AddLiquidity;
