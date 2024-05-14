import {base} from "viem/chains";
import {privateKeyToAccount} from "viem/accounts";
import {erc20Abi, parseEther} from "viem";
export const getTokenPrice = async (token) => {
  const response = await fetch(
    `https://base.api.0x.org/swap/v1/price?sellToken=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&buyToken=${token}&sellAmount=10000000`,
    {
      headers: {
        "Content-Type": "application/json",
        "0x-api-key": process.env.ZERO_X_API_KEY || "",
      },
    }
  );
  const data = await response.json();

  const price = 1 / data.price;
  return price.toFixed(4);
};
export const tokensForDollar = async (dollarAmount) => {
  const tokenPrice = await getTokenPrice(
    "0x4ed4e862860bed51a9570b96d89af5e1b0efefed"
  );
  const tokens = dollarAmount / tokenPrice;
  return tokens;
};
export const sendPrizeAmount = async (winners, prizePerWinner) => {
  for (const winner of winners) {
    const {request} = await publicClient.simulateContract({
      account: privateKeyToAccount(process.env.MASTER_WALLET_PK),
      address: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
      abi: erc20Abi,
      functionName: "transfer",
      args: [winner, parseEther(prizePerWinner)],
    });
    await walletClient.writeContract(request);
  }
};
