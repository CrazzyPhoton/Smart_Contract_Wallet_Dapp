import Head from "next/head";
import Web3 from "web3";
import scwContract from "../blockchain/smartContractWallet";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";

export default function smartContractWallet() {
  const [web3, setWeb3] = useState(null); // Store web3 instance in state
  const [error, setError] = useState(""); // For storing error

  // WALLET CONNECTION MANAGEMENT //

  const [isWalletConnected, setWalletConnected] = useState(false); // For checking whether wallet is connected
  const [userAccount, setUserAccount] = useState(""); // For saving connected wallet

  const checkIfWalletIsConnected = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setUserAccount(accounts[0]);
          setWeb3(new Web3(window.ethereum)); // Initialize web3 here
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const connectWalletHandler = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletConnected(true);
        setUserAccount(accounts[0]);
        setWeb3(new Web3(window.ethereum)); // Initialize web3 here
      } catch (err) {
        setError(err.message);
      }
    } else {
      setError("Please install MetaMask.");
    }
  };

  const disconnectWalletHandler = () => {
    setWalletConnected(false);
    setUserAccount("");
    setError("");
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // SMART CONTRACT OWNER MANAGEMENT //

  const [ownerOfContract, setOwner] = useState(""); // For storing contract owner

  useEffect(() => {
    getOwner();
    checkIfWalletIsConnected();
  }, []);

  const getOwner = async () => {
    try {
      const owner = await scwContract.methods.owner().call();
      setOwner(owner);
    } catch (err) {
      setError("Error fetching owner: " + err.message);
    }
  };

  // SMART CONTRACT TRANSFER OWNERSHIP MANAGEMENT //

  const [newOwner, setNewOwner] = useState(""); // For transferring ownership of contract

  const transferOwnershipHandler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      // Estimate gas limit dynamically
      const gasLimit = await scwContract.methods
        .transferOwnership(newOwner)
        .estimateGas({ from: userAccount });

      await scwContract.methods.transferOwnership(newOwner).send({
        from: userAccount,
        gas: gasLimit, // Use the estimated gas limit
        maxPriorityFeePerGas: gasPrice,
      });

      setError("Transfer ownership successful!");
    } catch (err) {
      setError("Error transferring ownership: " + err.message);
    }
  };

  // NATIVE TOKEN DEPOSIT MANAGEMENT //

  const [depositAmount, setDepositAmount] = useState(""); // For deposit

  const depositHandler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      // Estimate gas limit dynamically
      const gasLimit = await scwContract.methods.deposit().estimateGas({
        from: userAccount,
        value: web3.utils.toWei(depositAmount, "ether"),
      });

      await scwContract.methods.deposit().send({
        from: userAccount,
        value: web3.utils.toWei(depositAmount, "ether"),
        gas: gasLimit, // Use the estimated gas limit
        maxPriorityFeePerGas: gasPrice,
      });

      setError("Deposit successful!");
    } catch (err) {
      setError("Error depositing: " + err.message);
    }
  };

  // NATIVE TOKEN WITHDRAWAL MANAGEMENT //

  const [recipientAddress, setRecipientAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const withdrawHandler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      // Estimate gas limit dynamically
      const gasLimit = await scwContract.methods
        .withdraw(recipientAddress, web3.utils.toWei(withdrawAmount, "ether"))
        .estimateGas({
          from: userAccount,
        });

      await scwContract.methods
        .withdraw(recipientAddress, web3.utils.toWei(withdrawAmount, "ether"))
        .send({
          from: userAccount,
          gas: gasLimit, // You can adjust the gas limit as needed
          maxPriorityFeePerGas: gasPrice,
        });
      setError("Withdrawal successful!");
    } catch (err) {
      setError("Error withdrawing: " + err.message);
    }
  };

  // ERC20 TOKEN DEPOSIT MANAGEMENT //

  const [depositErc20Token, setDepositErc20Token] = useState(""); // For erc20 tokens
  const [depositErc20TokenAmount, setDepositErc20TokenAmount] = useState(""); // For erc20 token amount

  const depositErc20Handler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      // Estimate gas limit dynamically
      const gasLimit = await scwContract.methods
        .depositErc20(
          depositErc20Token,
          web3.utils.toWei(depositErc20TokenAmount, "ether")
        )
        .estimateGas({
          from: userAccount,
        });

      await scwContract.methods
        .depositErc20(
          depositErc20Token,
          web3.utils.toWei(depositErc20TokenAmount, "ether")
        )
        .send({
          from: userAccount,
          gas: gasLimit, // You can adjust the gas limit as needed
          maxPriorityFeePerGas: gasPrice,
        });
      setError("Erc20 deposit successful!");
    } catch (err) {
      setError("Error depositing: " + err.message);
    }
  };

  // ERC20 TOKEN WITHDRAWAL MANAGEMENT //

  const [erc20WithdrawRecipientAddress, setErc20WithdrawRecipientAddress] =
    useState("");
  const [withdrawErc20Token, setWithdrawErc20Token] = useState(""); // For erc20 tokens
  const [withdrawErc20TokenAmount, setWithdrawErc20TokenAmount] = useState(""); // For erc20 token amount

  const withdrawErc20Handler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      // Estimate gas limit dynamically
      const gasLimit = await scwContract.methods
        .withdrawErc20(
          erc20WithdrawRecipientAddress,
          withdrawErc20Token,
          web3.utils.toWei(withdrawErc20TokenAmount, "ether")
        )
        .estimateGas({
          from: userAccount,
        });

      await scwContract.methods
        .withdrawErc20(
          erc20WithdrawRecipientAddress,
          withdrawErc20Token,
          web3.utils.toWei(withdrawErc20TokenAmount, "ether")
        )
        .send({
          from: userAccount,
          gas: gasLimit, // You can adjust the gas limit as needed
          maxPriorityFeePerGas: gasPrice,
        });
      setError("Erc20 withdraw successful!");
    } catch (err) {
      setError("Error withdrawing: " + err.message);
    }
  };

  // ERC721 TOKEN DEPOSIT MANAGEMENT //

  const [erc721DepositToken, setErc721DepositToken] = useState(""); // For erc721 tokens
  const [depositErc721TokenId, setDepositErc721TokenId] = useState(""); // For erc721 tokenIds

  const depositErc721Handler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      const gasLimit = await scwContract.methods
        .depositErc721(erc721DepositToken, depositErc721TokenId)
        .estimateGas({ from: userAccount });

      await scwContract.methods
        .depositErc721(erc721DepositToken, depositErc721TokenId)
        .send({
          from: userAccount,
          gas: gasLimit, // You can adjust the gas limit as needed
          maxPriorityFeePerGas: gasPrice,
        });
      setError("Erc721 deposit successful!");
    } catch (err) {
      setError("Error depositing: " + err.message);
    }
  };

  // ERC721 TOKEN WITHDRAW MANAGEMENT //

  const [erc721WithdrawRecipientAddress, setErc721WithdrawRecipientAddress] =
    useState("");
  const [erc721WithdrawToken, setErc721WithdrawToken] = useState(""); // For erc721 tokens
  const [withdrawErc721TokenId, setWithdrawErc721TokenId] = useState(""); // For erc721 tokenIds

  const withdrawErc721Handler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      const gasLimit = await scwContract.methods
        .withdrawErc721(
          erc721WithdrawRecipientAddress,
          erc721WithdrawToken,
          withdrawErc721TokenId
        )
        .estimateGas({ from: userAccount });

      await scwContract.methods
        .withdrawErc721(
          erc721WithdrawRecipientAddress,
          erc721WithdrawToken,
          withdrawErc721TokenId
        )
        .send({
          from: userAccount,
          gas: gasLimit, // You can adjust the gas limit as needed
          maxPriorityFeePerGas: gasPrice,
        });
      setError("Erc721 withdraw successful!");
    } catch (err) {
      setError("Error withdrawing: " + err.message);
    }
  };

  // ERC1155 TOKEN DEPOSIT MANAGEMENT //

  const [erc1155DepositToken, setErc1155DepositToken] = useState(""); // For erc1155 tokens
  const [depositErc1155TokenId, setDepositErc1155TokenId] = useState(""); // For erc721 tokenIds
  const [erc1155DepositTokenAmount, setErc1155DepositTokenAmount] =
    useState("");

  const depositErc1155Handler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      const gasLimit = await scwContract.methods
        .depositErc1155(
          erc1155DepositToken,
          depositErc1155TokenId,
          erc1155DepositTokenAmount
        )
        .estimateGas({ from: userAccount });

      await scwContract.methods
        .depositErc1155(
          erc1155DepositToken,
          depositErc1155TokenId,
          erc1155DepositTokenAmount
        )
        .send({
          from: userAccount,
          gas: gasLimit, // You can adjust the gas limit as needed
          maxPriorityFeePerGas: gasPrice,
        });
      setError("Erc1155 deposit successful!");
    } catch (err) {
      setError("Error depositing: " + err.message);
    }
  };

  // ERC1155 TOKEN WITHDRAW MANAGEMENT //

  const [erc1155WithdrawRecipientAddress, setErc1155WithdrawRecipientAddress] =
    useState("");
  const [erc1155WithdrawToken, setErc1155WithdrawToken] = useState(""); // For erc1155 tokens
  const [withdrawErc1155TokenId, setWithdrawErc1155TokenId] = useState(""); // For erc721 tokenIds
  const [erc1155WithdrawTokenAmount, setErc1155WithdrawTokenAmount] =
    useState("");

  const withdrawErc1155Handler = async () => {
    if (!web3) {
      setError("Web3 is not initialized.");
      return;
    }

    try {
      const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

      const gasLimit = await scwContract.methods
        .withdrawErc1155(
          erc1155WithdrawRecipientAddress,
          erc1155WithdrawToken,
          withdrawErc1155TokenId,
          erc1155WithdrawTokenAmount
        )
        .estimateGas({ from: userAccount });

      await scwContract.methods
        .withdrawErc1155(
          erc1155WithdrawRecipientAddress,
          erc1155WithdrawToken,
          withdrawErc1155TokenId,
          erc1155WithdrawTokenAmount
        )
        .send({
          from: userAccount,
          gas: gasLimit, // You can adjust the gas limit as needed
          maxPriorityFeePerGas: gasPrice,
        });
      setError("Erc1155 withdraw successful!");
    } catch (err) {
      setError("Error withdrawing: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Smart Contract Wallet App</title>
        <meta name="description" content="A smart contract wallet app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <nav className={styles.navbar}>
        <div className={styles.navbarWrapper}>
          <h1 className={styles.title}>Smart Contract Wallet</h1>
          {isWalletConnected ? (
            <button
              onClick={disconnectWalletHandler}
              className={styles.disconnectButton}
            >
              Disconnect Wallet
            </button>
          ) : (
            <button
              onClick={connectWalletHandler}
              className={styles.connectButton}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      <section className={styles.statusSection}>
        <p>
          {isWalletConnected ? (
            <p>Wallet connected: {userAccount}</p>
          ) : (
            "Wallet is not connected."
          )}
        </p>
        <p className={styles.errorSection}>{error}</p>
      </section>

      <section className={styles.section}>
        <div className={styles.ownerInfo}>
          <h3>Owner of Smart Contract Wallet:</h3>
          <p>{ownerOfContract || "Loading..."}</p>
        </div>
      </section>

      <section className={styles.transferOwnershipSection}>
        <h3>Transfer Ownership</h3>
        <input
          type="text"
          placeholder="Enter new owner address"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          className={styles.inputField}
        />
        <button
          onClick={transferOwnershipHandler}
          className={styles.actionButton}
        >
          Click To Transfer Ownership
        </button>
      </section>

      <section className={styles.depositSection}>
        <h3>Deposit</h3>
        <input
          type="number"
          placeholder="Enter amount"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={depositHandler} className={styles.actionButton}>
          Click To Deposit
        </button>
      </section>

      <section className={styles.withdrawSection}>
        <h3>Withdraw</h3>
        <input
          type="text"
          placeholder="Enter recipient address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter amount"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={withdrawHandler} className={styles.actionButton}>
          Click To Withdraw
        </button>
      </section>

      <section className={styles.depositErc20Section}>
        <h3>Deposit Erc20</h3>
        <input
          type="text"
          placeholder="Enter erc20 token contract address"
          value={depositErc20Token}
          onChange={(e) => setDepositErc20Token(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter erc20 amount"
          value={depositErc20TokenAmount}
          onChange={(e) => setDepositErc20TokenAmount(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={depositErc20Handler} className={styles.actionButton}>
          Click To Deposit Erc20
        </button>
      </section>

      <section className={styles.withdrawErc20Section}>
        <h3>Withdraw Erc20</h3>
        <input
          type="text"
          placeholder="Enter recipient address"
          value={erc20WithdrawRecipientAddress}
          onChange={(e) => setErc20WithdrawRecipientAddress(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Enter erc20 token contract address"
          value={withdrawErc20Token}
          onChange={(e) => setWithdrawErc20Token(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter erc20 amount"
          value={withdrawErc20TokenAmount}
          onChange={(e) => setWithdrawErc20TokenAmount(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={withdrawErc20Handler} className={styles.actionButton}>
          Click To Withdraw Erc20
        </button>
      </section>

      <section className={styles.depositErc721Section}>
        <h3>Deposit Erc721</h3>
        <input
          type="text"
          placeholder="Enter erc721 token contract address"
          value={erc721DepositToken}
          onChange={(e) => setErc721DepositToken(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter tokenId"
          value={depositErc721TokenId}
          onChange={(e) => setDepositErc721TokenId(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={depositErc721Handler} className={styles.actionButton}>
          Click To Deposit Erc721
        </button>
      </section>

      <section className={styles.withdrawErc721Section}>
        <h3>Withdraw Erc721</h3>
        <input
          type="text"
          placeholder="Enter recipient address"
          value={erc721WithdrawRecipientAddress}
          onChange={(e) => setErc721WithdrawRecipientAddress(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Enter erc721 token contract address"
          value={erc721WithdrawToken}
          onChange={(e) => setErc721WithdrawToken(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter tokenId"
          value={withdrawErc721TokenId}
          onChange={(e) => setWithdrawErc721TokenId(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={withdrawErc721Handler} className={styles.actionButton}>
          Click To Withdraw Erc721
        </button>
      </section>

      <section className={styles.depositErc1155Section}>
        <h3>Deposit Erc1155</h3>
        <input
          type="text"
          placeholder="Enter erc1155 token contract address"
          value={erc1155DepositToken}
          onChange={(e) => setErc1155DepositToken(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter tokenId"
          value={depositErc1155TokenId}
          onChange={(e) => setDepositErc1155TokenId(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter amount"
          value={erc1155DepositTokenAmount}
          onChange={(e) => setErc1155DepositTokenAmount(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={depositErc1155Handler} className={styles.actionButton}>
          Click To Deposit Erc1155
        </button>
      </section>

      <section className={styles.depositErc1155Section}>
        <h3>Withdraw Erc1155</h3>
        <input
          type="text"
          placeholder="Enter recipient address"
          value={erc1155WithdrawRecipientAddress}
          onChange={(e) => setErc1155WithdrawRecipientAddress(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Enter erc1155 token contract address"
          value={erc1155WithdrawToken}
          onChange={(e) => setErc1155WithdrawToken(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter tokenId"
          value={withdrawErc1155TokenId}
          onChange={(e) => setWithdrawErc1155TokenId(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="number"
          placeholder="Enter amount"
          value={erc1155WithdrawTokenAmount}
          onChange={(e) => setErc1155WithdrawTokenAmount(e.target.value)}
          className={styles.inputField}
        />
        <button
          onClick={withdrawErc1155Handler}
          className={styles.actionButton}
        >
          Click To Withdraw Erc1155
        </button>
      </section>
    </div>
  );
}
