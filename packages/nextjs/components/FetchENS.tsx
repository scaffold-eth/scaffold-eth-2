import { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Input, VStack } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';

async function getSubname(owner, label, domain) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const ens = new ethers.Contract(ENS_REGISTRY_ADDRESS, [
        "function owner(bytes32 node) external view returns (address)",
        "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external"
    ], provider);
    const node = ethers.utils.namehash(domain);
    const labelHash = ethers.utils.id(label);
    return await ens.owner(ethers.utils.hexConcat([node, labelHash]));
}

function App() {
    const [domain, setDomain] = useState('');
    const [subname, setSubname] = useState('');
    const [owner, setOwner] = useState('');

    const handleFetch = async () => {
        const owner = await getSubname(subname, domain);
        setOwner(owner);
    };

    return (
        <ChakraProvider>
            <VStack spacing={4}>
                <Input placeholder="Enter domain" onChange={(e) => setDomain(e.target.value)} />
                <Input placeholder="Enter subname" onChange={(e) => setSubname(e.target.value)} />
                <Button onClick={handleFetch}>Fetch ENS Subname</Button>
                {owner && <p>Owner: {owner}</p>}
            </VStack>
        </ChakraProvider>
    );
}

export default App;