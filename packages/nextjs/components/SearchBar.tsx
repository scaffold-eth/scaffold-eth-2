import { useState } from "react";
import { Box, Button, HStack, Input } from "@chakra-ui/react";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    // Handle your search logic here
    console.log(`Searching for ${searchTerm}`);
  };

  return (
    <Box>
      <HStack spacing={2}>
        <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <Button onClick={handleSearch}>Search</Button>
      </HStack>
    </Box>
  );
}
