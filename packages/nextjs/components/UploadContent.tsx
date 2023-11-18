import { useState } from "react";
import { Box, Button, Input } from "@chakra-ui/react";

export default function NFTUpload() {
  const [file, setFile] = useState(null);

  const handleFileChange = event => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    // Handle your file submission logic here
    console.log(`Submitting file: ${file.name}`);
  };

  return (
    <Box>
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleSubmit}>Submit</Button>
    </Box>
  );
}
