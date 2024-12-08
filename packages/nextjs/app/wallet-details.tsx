// pages/wallet-details.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";

const WalletDetails: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: balanceData, isLoading, isError } = useBalance({ address });
  const [gradient, setGradient] = useState<string>("");

  // Simulate beautiful gradient animation
  useEffect(() => {
    const gradients = [
      "linear-gradient(45deg, #ff6ec7, #ff8a00)",
      "linear-gradient(45deg, #00c6ff, #0072ff)",
      "linear-gradient(45deg, #ff7e5f, #feb47b)",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setGradient(gradients[idx]);
      idx = (idx + 1) % gradients.length;
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isConnected) return <div>Please connect your wallet.</div>;
  if (isLoading) return <div>Loading balance...</div>;
  if (isError) return <div>Error fetching balance.</div>;

  return (
    <div
      style={{ background: gradient, transition: "background 1s ease" }}
      className="wallet-details-card"
    >
      <div className="card-header">
        <img
          src={
            address
              ? `https://www.gravatar.com/avatar/${address}`
              : "/default-avatar.png"
          }
          alt="User Avatar"
          className="user-avatar"
        />
      </div>
      <div className="card-body">
        <h2>Account Details</h2>
        <p>Address: {address}</p>
        <p>
          Balance: {balanceData?.formatted} {balanceData?.symbol}
        </p>
        {/* Add any additional account details */}
      </div>
    </div>
  );
};

export default WalletDetails;
