import { useState } from "react";
import { Box, Button, Heading, Input, Textarea } from "@chakra-ui/react";

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
        justifyContent="center"
        bg="white"
        border="2px gray solid"
        style={{ borderRadius: "3px" }}
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
