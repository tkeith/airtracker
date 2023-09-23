import { NextResponse } from "next/server";
import { encrypt } from "../../../lib/numberEncrypter";
import prisma from "../../../lib/prisma";
import { intToFloat, floatToInt } from "../../../lib/utils";

export async function POST(request: Request) {
  const { name, lat, lon } = await request.json();

  const encryptedLat = encrypt(lat, name);
  const encryptedLon = encrypt(lon, name);

  const tag = await prisma.tag.upsert({
    where: { name: name },
    update: { lastUpdated: new Date() },
    create: { name: name, lastUpdated: new Date() },
  });

  await prisma.tagLocationSnapshot.create({
    data: {
      lat: lat,
      lon: lon,
      encryptedLat: encryptedLat,
      encryptedLon: encryptedLon,
      tagId: tag.id,
    },
  });

  return NextResponse.json({ status: "success" });
}
