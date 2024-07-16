"use client";

import { Address } from "~~/components/scaffold-eth";
import useGraphClient from "~~/hooks/scaffold-eth/useGraphClient";

const GreetingsTable = () => {
  const myQuery = `
{
   greetings(first: 25, orderBy: createdAt, orderDirection: desc) {
     id
     greeting
     premium
     value
     createdAt
     sender {
       address
       greetingCount
     }
   }
 }
`;

  const { data: greetingsData, error } = useGraphClient(myQuery);

  if (error) {
    return <></>;
  }

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="overflow-x-auto shadow-2xl rounded-xl">
        <table className="table bg-base-100 table-zebra">
          <thead>
            <tr className="rounded-xl">
              <th className="bg-primary"></th>
              <th className="bg-primary">Sender</th>
              <th className="bg-primary">Greetings</th>
            </tr>
          </thead>
          <tbody>
            {(greetingsData as any)?.greetings?.map((greeting: any, index: number) => {
              return (
                <tr key={greeting.id}>
                  <th>{index + 1}</th>
                  <td>
                    <Address address={greeting?.sender?.address} />
                  </td>
                  <td>{greeting.greeting}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GreetingsTable;
