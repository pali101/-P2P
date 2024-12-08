import React, { useState } from 'react';
import { Address } from '~~/components/scaffold-eth'; // Assuming the path is correct
import { EtherInput } from "~~/components/scaffold-eth"; // Assuming the path is correct

const PersonCard: React.FC<{ address: string }> = ({ address }) => {
  const [hash, setHash] = useState(0x00000000000069);
  const [count, setCount] = useState(0);
  const [txValue, setTxValue] = useState("");
  const [payMode, setPayMode] = useState<"minute" | "second">("minute"); // Track pay mode

  const togglePayPerView = () => {
    setPayMode((prevMode) => (prevMode === "minute" ? "second" : "minute")); // Toggle between modes
  };


  const handleAuthorize = () => {
    if (txValue) {
      console.log(`Transaction authorized with value: ${txValue}`);
    } else {
      alert("Please enter a valid amount.");
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Background image */}
      <img
        src="bg.png"
        className="absolute top-0 left-0 w-full h-full object-cover"
        alt="Background"
      />

      {/* Card centered */}
      <div className="flex items-center justify-center h-full">
        <div className="card bg-base-100 image-full w-96">
          <figure>
            <img
              src="card.jpg"
              alt="Card"
              className="w-full h-full object-cover rounded-lg filter brightness-110"
            />
          </figure>
          <div className="card-body relative">
            <div className="absolute top-0 right-0 m-4">
              <img
                src="pink.png"
                alt="Person"
                className="w-16 h-16 rounded-full border border-gray-300"
              />
            </div>
            <h2 className="text-lg font-bold">Address:</h2>
            <Address address={address} />
            <p>Current Hash: {hash}</p>
            <p>Count: {count}</p>
          </div>
        </div>
      </div>

      {/* Input & buttons over the background */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-row items-center space-x-4 bg-[#d9cfb8] bg-opacity-50 hover:bg-opacity-70">
        {/* EtherInput */}
        <div className=" bro bg-[#d9cfb8] bg-opacity-50 hover:bg-opacity-70">
          <EtherInput
            value={txValue}
            onChange={(updatedTxValue) => setTxValue(updatedTxValue)}
            placeholder="Enter amount"
          />
        </div>

        {/* Buttons */}
        <button
          className="btn btn-sm text-black bg-[#d9cfb8] bg-opacity-50 hover:bg-opacity-70"
          onClick={togglePayPerView}
        >
          Pay per {payMode === "minute" ? "second" : "minute"}
        </button>
        <button
          className="btn btn-sm text-black bg-[#d9cfb8] bg-opacity-50 hover:bg-opacity-70"
          onClick={handleAuthorize}
        >
          Authorize
        </button>
      </div>
    </div>
  );
};

export default PersonCard;
