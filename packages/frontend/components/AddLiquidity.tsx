import React, { useState } from "react";
import Link from "next/link";

function AddLiquidity() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Add Liquidity</button>

      {isOpen && (
        <div>
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
      )}
    </div>
  );
}

export default AddLiquidity;
