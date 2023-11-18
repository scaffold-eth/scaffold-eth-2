import { useState } from "react";
import { Box, Button, Input, Textarea } from "@chakra-ui/react";

export default function NFTUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = event => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    // Handle your file submission logic here
    console.log(`Submitting file: ${file.name}`);
    console.log(`Title: ${title}`);
    console.log(`Description: ${description}`);
  };

  return (
    <Box>
      <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleSubmit}>Submit</Button>
    </Box>
  );
}
