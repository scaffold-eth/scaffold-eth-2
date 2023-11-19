import { Button, Text } from '@chakra-ui/react';
import React, { useState } from 'react'
import { Address } from '../scaffold-eth';
interface InstallSnapButtonProps {
    setPublicKey: (response: string) => void;
  }
  
  const InstallSnapButton: React.FC<InstallSnapButtonProps> = ({ setPublicKey }) => {

    const [pubHere, setPubHere] = useState("");
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
        setPubHere(response);   
    };

    return (
        
        
        <div>
            {!pubHere && <Button
                className="mb-1 w-56 text-white font-bold active:bg-slate-700 uppercase text-xs px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                colorScheme='blue'
                type="button"
                onClick={install}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 0,
                }}
            >
                Fetch public key
            </Button>}
        </div>
    )
}

export default InstallSnapButton;
