import { NextResponse } from "next/server";
import { encrypt } from "../../../lib/numberEncrypter";
import prisma from "../../../lib/prisma";
import { intToFloat, floatToInt } from "../../../lib/utils";
import { Web3Storage, File } from "web3.storage";
import { WEB3_STORAGE_TOKEN } from "@/lib/consts";

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
  }

  return NextResponse.json({ status: "success" });
}
