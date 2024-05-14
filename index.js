import mongoose from "mongoose";
import dotenv from "dotenv";
import Bet from "./bet.js";
import {getTokenPrice, sendPrizeAmount, tokensForDollar} from "./utils.js";
import cron from "node-cron";

dotenv.config();

async function main() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI || "");
  }

  try {
    const bets = await Bet.find({});

    for (const bet of bets) {
      if (bet.deadline < Date.now()) {
        let winners = [];
        let prizePerWinner = 0;
        const currentPrice = await getTokenPrice(bet.token);
        const targetPrice = bet.priceTarget / 10 ** 4;
        const totalBetAmount = bet.totalBetAmount;
        if (currentPrice >= targetPrice) {
          winners = bet.buyers;
          prizePerWinner = totalBetAmount / winners.length;
        } else {
          winners = bet.sellers;
          prizePerWinner = totalBetAmount / winners.length;
        }
        if (winners.length > 0 && prizePerWinner > 0)
          await sendPrizeAmount(winners, tokensForDollar(prizePerWinner));

        await Bet.deleteOne({_id: bet._id});
      }
    }
  } catch (error) {
    console.error(error);
  }
}
cron.schedule("0 0 * * *", () => {
  console.log("job started");
  main();
});
