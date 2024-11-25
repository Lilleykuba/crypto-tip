import { useState } from "react";
import { ethers } from "ethers";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const formatAddress = (address) =>
    address.slice(0, 6) + "..." + address.slice(-4);

  const checkNetwork = async (provider) => {
    const network = await provider.getNetwork();
    if (network.chainId !== 1) {
      alert("Please connect to Ethereum Mainnet.");
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert(
        "MetaMask is not installed. Please install it to connect your wallet."
      );
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      await checkNetwork(provider); // Check network after connection
      console.log("Connected Wallet:", address);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      if (err.code === 4001) {
        alert("You rejected the connection request.");
      } else {
        alert("Failed to connect wallet. Check console for details.");
      }
    }
  };

  return (
    <div>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: walletAddress ? "#4caf50" : "#1e88e5",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={connectWallet}
      >
        {walletAddress
          ? `Connected: ${formatAddress(walletAddress)}`
          : "Connect Wallet"}
      </button>
    </div>
  );
};

export default WalletConnect;
