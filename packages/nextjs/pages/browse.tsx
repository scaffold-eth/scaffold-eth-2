import Head from "next/head";
import type { NextPage } from "next";

// Replace this with your actual data fetched from the smart contract
const mockData = [
  {
    id: 1,
    name: "Lawn Mower",
    pricePerDay: 10,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Snow Blower",
    pricePerDay: 15,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Kayak",
    pricePerDay: 20,
    imageUrl: "https://via.placeholder.com/150",
  },
];

const Browse: NextPage = () => {
  return (
    <>
      <div className="bg-gradient-to-r from-blue-200 to-purple-800 h-screen">
        <Head>
          <title>Browse Equipment - EquipMeUp</title>
        </Head>

        <div className="container mx-auto py-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold m-6">Browse Equipment</h2>
            <button className="bg-gradient-to-r from-blue-500 to-purple-400 text-white font-medium px-4 py-2 rounded-md m-6">
              Add Equipment
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 m-6">
            {mockData.map(equipment => (
              <div key={equipment.id} className="bg-white rounded-lg shadow-md p-4">
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="w-full h-48 object-cover mb-4 rounded"
                ></img>

                <h3 className="text-xl font-semibold mb-2">{equipment.name}</h3>
                <p className="text-gray-600 mb-4">Price per day: ${equipment.pricePerDay}</p>
                <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md">
                  Add Equipment
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Browse;
