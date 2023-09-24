import { NextResponse } from "next/server";
import { encrypt } from "@/lib/numberEncrypter";
import prisma from "../../../lib/prisma";
import { intToFloat, floatToInt } from "../../../lib/utils";
import { Web3Storage, File } from "web3.storage";
import { WEB3_STORAGE_TOKEN } from "@/lib/consts";
import Web3 from "web3";
import { hashKey } from "../../../lib/hashKey";
import AirTracker from "../../../AirTracker.json";
import { JsonRpcProvider, Wallet, Contract } from "ethers";

const RPC_URL = "https://1rpc.io/celo";
const CONTRACT_ADDRESS = "0xd684a2A53C832dbBEE4bbc6067A779d23090fbF2";

// const web3 = new Web3(RPC_URL);
// const contract = new web3.eth.Contract(AirTracker.abi, CONTRACT_ADDRESS);

export async function POST(request: Request) {
  const { name, lat, lon } = await request.json();

  const encryptedLat = encrypt(lat, name);
  const encryptedLon = encrypt(lon, name);

  const tag = await prisma.tag.upsert({
    where: { name: name },
    update: { lastUpdated: new Date() },
    create: { name: name, lastUpdated: new Date() },
  });

  const latestSnapshot = await prisma.tagLocationSnapshot.findFirst({
    where: { tagId: tag.id },
    orderBy: { time: "desc" },
  });

  if (
    !latestSnapshot ||
    Math.abs(lat - latestSnapshot.lat) > 600 ||
    Math.abs(lon - latestSnapshot.lon) > 600
  ) {
    console.log(`\n\nNew snapshot for ${name} at ${lat}, ${lon}\n`);
    await prisma.tagLocationSnapshot.create({
      data: {
        lat: lat,
        lon: lon,
        encryptedLat: encryptedLat,
        encryptedLon: encryptedLon,
        tagId: tag.id,
      },
    });

    const historicalLocations = await prisma.tagLocationSnapshot.findMany({
      where: { tagId: tag.id },
    });

    const storage = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
    const metadata = {
      name: `${tag.name}_location_history.json`,
      type: "application/json",
    };
    const file = new File(
      [
        JSON.stringify(
          historicalLocations.map((snapshot) => ({
            time: snapshot.time,
            encryptedLat: snapshot.encryptedLat,
            encryptedLon: snapshot.encryptedLon,
          }))
        ),
      ],
      metadata.name,
      metadata
    );
    const cid = await storage.put([file]);

    console.log(`Stored file with CID: ${cid}`);
    console.log(`https://dweb.link/ipfs/${cid}`);

    const tokenId = hashKey(name);

    const provider = new JsonRpcProvider(RPC_URL);
    // Load the wallet to deploy the contract with
    const privateKey = process.env.WALLET_PRIVATE_KEY!;
    const wallet = new Wallet(privateKey, provider);

    var contract = new Contract(CONTRACT_ADDRESS, AirTracker.abi, wallet);

    // const price = await contract.retrievePrice()
    // console.log("price " + price) //logs the price set in the constructor when the contract was made (WORKS)
    // const testAddress = await contract.isUser(
    //   "0x456"
    // )
    // console.log("testAddress ", testAddress) //checks if the given address is a user on the contract (WORKS)

    // const gasPrice = await provider.getGasPrice();
    // console.log("gas price: ", gasPrice.toString()); //returns the price of gas from the network (WORKS)
    // try {
    //   const addToUsers = await contract.requestAccess({ //call function to request access, from the current wallet (REVERTS)
    //     value: wei
    //   })
    //   console.log("result of sending transaction ", addToUsers)
    // } catch (error) {
    //   console.log("error.... ", error) //fires as the contract reverted the payment
    // }

    const mintOrUpdateTx = await contract.mintOrUpdate(
      encryptedLat,
      encryptedLon,
      cid,
      tokenId
    );
    // console.log("mintOrUpdateTx ", mintOrUpdateTx);
    console.log(`Transaction hash: ${mintOrUpdateTx.hash}`);
  }

  return NextResponse.json({ status: "success" });
}
