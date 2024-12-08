// ConnectWallet.tsx
import React from "react";
import { useRouter } from "next/navigation";
import { useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors";
import { CoinbaseWalletConnector } from "wagmi/connectors";

const ConnectWallet: React.FC = () => {
  const router = useRouter();
  const { connect } = useConnect();

  const connectMetaMask = async () => {
    try {
      await connect({
        connector: new InjectedConnector(),
      });

      // Navigate to the WalletDetails page after successful connection
      router.push(`/wallet-details`);
    } catch (err) {
      console.error("Error connecting MetaMask:", err);
    }
  };

  const connectCoinbase = async () => {
    try {
      await connect({
        connector: new CoinbaseWalletConnector({
          options: {
            appName: "P2P Crypto App",
            // Replace with your RPC URL or use public RPC providers
            jsonRpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
          },
        }),
      });

      router.push(`/wallet-details`);
    } catch (err) {
      console.error("Error connecting Coinbase Wallet:", err);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage:
          "url('bg.png'), linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5))",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1
        className="text-center text-3xl lg:text-5xl max-w-md lg:max-w-2xl px-3 m-0 flex items-center justify-center"
        style={{
          color: "#000000",
          position: "absolute",
          top: "15px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <img
          src="/mu.png"
          alt="Crypto Icon"
          className="w-8 h-8 mr-2"
          style={{ borderRadius: "10%" }}
        />
        P2P
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "20px",
          gap: "30px",
        }}
      >
        <p
          style={{
            fontSize: "1.6rem",
            color: "#05060a",
            margin: "0",
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            maxWidth: "600px",
            wordWrap: "break-word",
            lineHeight: "1.2",
          }}
        >
          An implementation of micropayments using μP2P
        </p>
      </div>

      <p
        style={{
          fontSize: "0.7rem",
          color: "#05060a",
          marginTop: "10px",
          marginBottom: "0px",
          padding: "5px",
          borderRadius: "10px",
          border: "1px solid #05060a",
        }}
      >
        Connect Using
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "100px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={connectMetaMask}
          style={{
            margin: "10px",
            padding: "10px 30px",
            backgroundColor: "#FEF8E8",
            color: "#1a1a1a",
            fontWeight: 500,
            border: "none",
            borderRadius: "30px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            paddingLeft: "20px",
          }}
        >
          <img
            src="metamask.png"
            alt="MetaMask"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "75%",
              marginRight: "8px",
            }}
          />
          Connect MetaMask
        </button>
        <button
          onClick={connectCoinbase}
          style={{
            margin: "10px",
            padding: "10px 30px",
            backgroundColor: "#FEF8E8",
            color: "#1a1a1a",
            fontWeight: 500,
            border: "none",
            borderRadius: "30px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            paddingLeft: "20px",
          }}
        >
          <img
            src="coinbase.png"
            alt="Coinbase"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "75%",
              marginRight: "8px",
            }}
          />
          Connect Coinbase
        </button>
      </div>
    </div>
  );
};

export default ConnectWallet;
