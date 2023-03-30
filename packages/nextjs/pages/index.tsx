import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
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
  return (
    <>
      <div className="font-sans">
        <Head>
          <title>EquipMeUp</title>
          <meta name="description" content="Created with 🏗 scaffold-eth" />
        </Head>

        <div className="flex items-center flex-col flex-grow pt-10">
          <div className="px-5">
            <h1 className="text-center mb-8">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-4xl font-bold">EquipMeUp</span>
            </h1>
            <p className="text-center text-lg">A decentralized platform for sharing and renting equipment.</p>
            <p className="text-center text-lg mt-4">
              Save money and resources by borrowing equipment from your community, or lend your own to make some extra
              income.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/browse">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white font-medium rounded-md bg-gradient-to-r from-blue-500 to-purple-800"
                >
                  Browse Equipment
                </button>
              </Link>
            </div>
          </div>

          <div className="flex-grow bg-gradient-to-r from-blue-200 to-purple-800 h-screen w-full mt-16 px-8 py-12">
            <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
              <div className="flex flex-col bg-base-200 px-10 py-10 text-center items-center max-w-m rounded-3xl">
                <h2 className="text-3xl font-bold text-center mb-8">Why lend and borrow?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                    <picture>
                      <img
                        src="https://img.icons8.com/3d-fluency/94/null/card-wallet.png"
                        alt="Lend Icon"
                        className="mx-auto mb-4"
                      />
                    </picture>
                    <h3 className="text-2xl font-bold mb-4">Lend</h3>
                    <p>
                      Lending your equipment to neighbors can help you earn extra income and make the most of your
                      investments. Plus, its an excellent way to contribute to your community by helping others save
                      money and resources.
                    </p>
                  </div>
                  <div className="text-center bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                    <picture>
                      <img
                        src="https://img.icons8.com/3d-fluency/94/null/discount.png"
                        alt="Borrow Icon"
                        className="mx-auto mb-4"
                      />
                    </picture>
                    <h3 className="text-2xl font-bold mb-4">Borrow</h3>
                    <p>
                      Borrowing equipment from neighbors allows you to save money on expensive purchases and access
                      tools for short-term needs. It also fosters connections with your community, promoting trust and
                      cooperation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
              {mockData.map(equipment => (
                <div key={equipment.id} className="bg-white rounded-lg shadow-md p-4">
                  <picture>
                    <img
                      className="w-full h-48 object-cover mb-4 rounded"
                      src={equipment.imageUrl}
                      alt={equipment.name}
                    />
                  </picture>
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
      </div>
    </>
  );
};

export default Home;
