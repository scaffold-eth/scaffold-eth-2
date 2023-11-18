import { useState } from "react";
import { Box, Button, HStack, Input, Link, Text, VStack } from "@chakra-ui/react";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState([]);

  const data = ["Apple", "Banana", "Cherry", "Date", "Elderberry"]; // Your data

  const handleSearch = () => {
    console.log(`Searching for ${searchTerm}`);
  };

  const handleChange = e => {
    setSearchTerm(e.target.value);
    if (e.target.value !== "") {
      let filteredData = data.filter(item => item.toLowerCase().includes(e.target.value.toLowerCase()));
      if (filteredData.length > 5) {
        filteredData = filteredData.slice(0, 5);
      }
      setMatches(filteredData);
    } else {
      setMatches([]);
    }
  };

  return (
    <Box position="relative">
      <HStack spacing={2}>
        <Input placeholder="Search..." style={{ width: "230px" }} value={searchTerm} onChange={handleChange} />
        <Button onClick={handleSearch}>Search</Button>
      </HStack>
      {matches.length > 0 && (
        <VStack
          style={{ width: "230px" }}
          align="start"
          mt={2}
          position="absolute"
          bg="white"
          p={2}
          boxShadow="md"
          zIndex="dropdown"
        >
          {matches.map((match, index) => (
            <Link key={index} passhref href={`/publisher_view?id=${match}`}>
              <Text className="w-full">{match}</Text>
            </Link>
          ))}
        </VStack>
      )}
    </Box>
  );
}
