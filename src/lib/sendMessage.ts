import { Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import { airstackLookup } from "./airstackLookup";

export async function sendMessage(to: string, body: string) {
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY!);
  console.log("Wallet address: " + wallet.address);

  const xmtp = await Client.create(wallet, { env: "production" });
  console.log("Client created", xmtp.address);

  const toWalletAddress = (await airstackLookup(to)) || to;
  const isOnProdNetwork = await xmtp.canMessage(toWalletAddress);
  console.log("Can message: " + isOnProdNetwork);
  if (isOnProdNetwork) {
    const conversation = await xmtp.conversations.newConversation(
      toWalletAddress
    );
    console.log("Conversation created", conversation);
    const message = await conversation.send(body);
    console.log("Message sent", message);
  }
}
