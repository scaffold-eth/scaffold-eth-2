import { useState } from "react";
import { Box, Button, Heading, Input, Textarea } from "@chakra-ui/react";

const EthCrypto = require("eth-crypto");

const fileToArrayBuffer = require("file-to-array-buffer");

export default function NFTUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = event => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    // Handle your file submission logic here
    console.log(`Submitting file: ${file.name}`);
    console.log(`Title: ${title}`);
    console.log(`Description: ${description}`);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const contentEncryptionKey = await crypto.subtle.generateKey(
      // generate key
      { name: "AES-CBC", length: 256 }, // algorithm
      true, // extractable
      ["encrypt", "decrypt"], // can encrypt and decrypt
    );
    const blobFile = await fileToArrayBuffer(file);
    const encryptedContent = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, contentEncryptionKey, blobFile);
    console.log(encryptedContent);

    // TODO: publish to IPFS

    // Get public keys of the subs of the content creator
    const subs = [
      {
        addr: "0xF00B47",
        pubKey:
          "044a801e476131320ae8a85946ec3a9175ace3280d4586f0e183c64494f825a4faf7191d6f3d7a3c7c76f3e502c4e4a56824e9a3304f9f321212acc14af6c69d0f",
      },
    ];
    // Encrypt contentEncryptionKey with the pubKeys of the subs
    const encryptedContentEncryptionKeys = [];
    const exported = await window.crypto.subtle.exportKey("raw", contentEncryptionKey);
    console.log({ exported });
    const strcontentEncryptionKey = arrayBufferToBase64(exported); //JSON.stringify(exported, null, " ");
    for (let i = 0; i < subs.length; i++) {
      const publicKeyBytes = EthCrypto.publicKey.compress(subs[i].pubKey.replace("0x", ""));
      console.log({
        publicKeyBytes,
        strcontentEncryptionKey,
      });
      console.log(strcontentEncryptionKey);
      const encryptedObject = await EthCrypto.encryptWithPublicKey(publicKeyBytes, strcontentEncryptionKey);
      const encryptedKey = await EthCrypto.cipher.stringify(encryptedObject);
      encryptedContentEncryptionKeys.push({
        encryptedKey: encryptedKey,
        address: subs[i].addr,
      });
    }
    console.log(encryptedContentEncryptionKeys);

    // Send it to Ethereum, get money, enjoy

    // decrypt ===> test the PoC
    const snapId = "local:http://localhost:8080";
    const response = await window.ethereum.request({
      method: "wallet_invokeSnap",
      params: {
        snapId,
        request: { method: "decrypt", params: { encryptedString: encryptedContentEncryptionKeys[0].encryptedKey } },
      },
    });
    console.log(response);
    const imported = await window.crypto.subtle.importKey(
      "raw",
      base64ToArrayBuffer(response),
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
    const decryptedContent = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, imported, encryptedContent);
    console.log({ decryptedContent, blobFile });
    // const fr = new FileReader
    // const decryptedFile = fr.readAsArrayBuffer(decryptedContent)
    // console.log(decryptedFile)
    const uint8Array = new Uint8Array(decryptedContent);

    // Create a Blob from the Uint8Array
    const blob = new Blob([uint8Array]);

    // Create a File from the Blob
    const decryptedFile = new File([blob], "filename.txt", { type: "application/octet-stream" });
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(decryptedFile);

    // Create a link element
    const link = document.createElement("a");

    // Set the href attribute of the link to the temporary URL
    link.href = url;

    // Set the download attribute to specify the filename
    link.download = "filename.txt";

    // Append the link to the document
    document.body.appendChild(link);

    // Trigger a click event on the link to start the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);

    // Revoke the temporary URL to free up resources
    URL.revokeObjectURL(url);
  };

  // Helper functions to convert between ArrayBuffer and Base64
  function arrayBufferToBase64(buffer) {
    const binary = new Uint8Array(buffer);
    return btoa(String.fromCharCode.apply(null, binary));
  }

  function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  return (
    // <Box style={{backgroundColor: "white"}}>
    //   <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
    //   <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
    //   <Input type="file" onChange={handleFileChange} />
    //   <Button onClick={handleSubmit}>Submit</Button>
    // </Box>
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
        bg="white"
        border="2px gray solid"
        style={{ borderRadius: "3px", height: "385px" }}
        pt={2}
      >
        <Heading style={{ borderRadius: 0 }} textAlign="center" mb={4}>
          Content Upload
        </Heading>
        <Input
          style={{ borderRadius: 0, borderColor: "#EEEEEE" }}
          bg="white"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Textarea
          style={{ borderRadius: 0, borderColor: "#EEEEEE" }}
          bg="white"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <Input style={{ borderRadius: 0, borderColor: "#EEEEEE" }} bg="white" type="file" onChange={handleFileChange} />
        <Button style={{ borderRadius: 0, borderColor: "#EEEEEE" }} onClick={handleSubmit} w="100%">
          Submit
        </Button>
      </Box>
    </>
  );
}
