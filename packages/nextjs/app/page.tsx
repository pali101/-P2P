"use client"
import React, { useEffect } from "react";
import ConnectWallet from "./ConnectWallet";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/wallet-details");
    }
  }, [isConnected, router]);

  return (
    <div>
      <ConnectWallet />
      {/* You can display additional info here if needed */}
    </div>
  );
};

export default Page;
