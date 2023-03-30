import { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";

const AddEquip: NextPage = () => {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Add your logic here to handle the form submission, such as saving data or interacting with the smart contract
    console.log("Equipment:", { name, details, pricePerDay, image });

    // Clear form fields
    setName("");
    setDetails("");
    setPricePerDay("");
    setImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  return (
    <>
      <Head>
        <title>Add Equipment - EquipMeUp</title>
      </Head>

      <div className="flex-grow bg-gradient-to-r from-blue-200 to-purple-800 h-screen w-full px-8 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold m-6">Browse Equipment</h2>
        </div>
        <div className="w-full max-w-lg mx-auto mt-6 mb-6">
          <div className="flex justify-center mt-6 min-h-screen">
            <div className="bg-base-100 rounded-3xl p-8 w-full max-w-xl">
              <div className="container mx-md py-10 px-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold mb-6 mr-4 items-center">Add Equipment</h2>
                </div>
                <div className="w-full max-w-lg mx-auto">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium">
                        Equipment Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full mt-1 px-4 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="details" className="block text-sm font-medium">
                        Equipment Details
                      </label>
                      <textarea
                        id="details"
                        value={details}
                        onChange={e => setDetails(e.target.value)}
                        className="w-full mt-1 px-4 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pricePerDay" className="block text-sm font-medium">
                        Price Per Day (in ETH)
                      </label>
                      <input
                        id="pricePerDay"
                        type="number"
                        step="0.01"
                        value={pricePerDay}
                        onChange={e => setPricePerDay(e.target.value)}
                        className="w-full mt-1 px-4 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="image" className="block text-sm font-medium">
                        Equipment Image
                      </label>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full mt-1 px-4 py-2 border rounded-md"
                        //   required -- for now
                      />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md">
                      Add Equipment
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEquip;
