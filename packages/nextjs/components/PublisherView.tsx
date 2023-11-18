import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

interface DataTableProps {
  subscribers: number;
  totalValueLocked: number;
  totalShares: number;
  pricePerShare: number;
  minPriceToSubscribe: number;
  nfts: string[];
}

export default function DataTable({
  subscribers,
  totalValueLocked,
  totalShares,
  pricePerShare,
  minPriceToSubscribe,
  nfts,
}: DataTableProps) {
  return (
    <Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Property</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Number of Subscribers</Td>
            <Td>{subscribers}</Td>
          </Tr>
          <Tr>
            <Td>Total Value Locked ($)</Td>
            <Td>{totalValueLocked}</Td>
          </Tr>
          <Tr>
            <Td>Total Number of Shares</Td>
            <Td>{totalShares}</Td>
          </Tr>
          <Tr>
            <Td>Price per Share ($)</Td>
            <Td>{pricePerShare}</Td>
          </Tr>
          <Tr>
            <Td>Minimum Price to Subscribe ($)</Td>
            <Td>{minPriceToSubscribe}</Td>
          </Tr>
          <Tr>
            <Td>List of NFTs</Td>
            <Td>
              {nfts.map((nft, index) => (
                <Box key={index}>{nft}</Box>
              ))}
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}
