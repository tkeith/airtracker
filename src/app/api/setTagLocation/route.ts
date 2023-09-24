import { NextResponse } from "next/server";
import { encrypt } from "@/lib/numberEncrypter";
import prisma from "../../../lib/prisma";
import { intToFloat, floatToInt } from "../../../lib/utils";
import { Web3Storage, File } from "web3.storage";
import { WEB3_STORAGE_TOKEN, CHAINS } from "@/lib/consts";
import Web3 from "web3";
import { hashKey } from "../../../lib/hashKey";
import AirTracker from "../../../AirTracker.json";
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { sendMessage } from "@/lib/sendMessage";

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
    Math.abs(lat - latestSnapshot.lat) > 1200 ||
    Math.abs(lon - latestSnapshot.lon) > 1200
  ) {
    console.log(`\n\n${name} has moved to new location ${lat}, ${lon}\n`);
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

    try {
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

      const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
      console.log(ipfsUrl);

      // split tag name into beforeFirstSpace and afterFirstSpace (but afterFirstSpace may include more spaces)
      const beforeFirstSpace = name.split(" ")[0];
      const afterFirstSpace = name.split(" ").slice(1).join(" ").trim();

      // await sendMessage(
      //   beforeFirstSpace,
      //   `Your tag${
      //     afterFirstSpace ? " " + afterFirstSpace : ""
      //   } has moved to ${intToFloat(lat)}, ${intToFloat(
      //     lon
      //   )} - details: ${ipfsUrl}`
      // );

      await sendMessage(
        beforeFirstSpace,
        `Your tag ${name} has moved to ${intToFloat(lat)}, ${intToFloat(
          lon
        )} - details: ${ipfsUrl}`
      );

      const tokenId = hashKey(name);

      console.log("Publishing on-chain update...");

      for (const chainKey of Object.keys(CHAINS)) {
        // console.log(`Pushing to chain ${chainKey}`);

        const chain = CHAINS[chainKey]!;

        try {
          const provider = new JsonRpcProvider(chain.rpc);
          // Load the wallet to deploy the contract with
          const privateKey = process.env.WALLET_PRIVATE_KEY!;
          const wallet = new Wallet(privateKey, provider);

          var contract = new Contract(chain.contract, AirTracker.abi, wallet);

          // @ts-ignore
          const mintOrUpdateTx = await contract.mintOrUpdate(
            encryptedLat,
            encryptedLon,
            cid,
            tokenId
          );
          // console.log("mintOrUpdateTx ", mintOrUpdateTx);
          // console.log(`Transaction hash: ${mintOrUpdateTx.hash}`);
        } catch (error) {
          console.log(`Chain: ${chainKey}`);
          console.log("error ", error);
        }
      }
      console.log("Done publishing on-chain update");
    } catch (e) {
      console.log("error", e);
      return NextResponse.json({ status: "error" });
    }
  }

  return NextResponse.json({ status: "success" });
}
