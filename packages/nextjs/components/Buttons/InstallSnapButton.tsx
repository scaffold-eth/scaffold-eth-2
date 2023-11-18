import React from 'react'
import { useEffect, useState } from "react";

export default function InstallSnapButton() {
    const [publicKey, setPublicKey] = useState(null);
    const install = async () => {
        console.log("Installing");
        const snapId = "local:http://localhost:8080"
        await window.ethereum.request({
            method: 'wallet_requestSnaps',
            params: {
                [snapId]: {},
            },
        });
        console.log("installed")
        let response = await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params: {
                snapId,
                request: { method: 'getPublicKey' }
            },
        });
        console.log("my publick key is: ", response);
        setPublicKey(response);      
    };

    return (
        
        
        <div>
            <button
                className="mb-1 w-56 bg-green-700 text-white active:bg-slate-700 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={install}
            >
                Install Snap
            </button>

        </div>
    )
}
