import { Box, Heading, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

export default function TopContentCreators() {
  const creators = [
    { username: "taylor-swift.eth", subscribers: 153487 },
    { username: "justin-bieber.eth", subscribers: 145678 },
    { username: "rihanna.eth", subscribers: 137890 },
    { username: "katy-perry.eth", subscribers: 130456 },
    { username: "brad-pitt.eth", subscribers: 125678 },
  ];

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        TOP 5 Content Creators
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Subscribers</Th>
          </Tr>
        </Thead>
        <Tbody>
          {creators.map((creator, index) => (
            <Tr key={index}>
              <Td>{creator.username}</Td>
              <Td isNumeric>{creator.subscribers.toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
