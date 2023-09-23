import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Missing name" });
  }

  const tag = await prisma.tag.findUnique({
    where: { name: name },
  });

  if (!tag) {
    return NextResponse.json({ snapshots: [] });
  }

  const snapshots = await prisma.tagLocationSnapshot.findMany({
    where: { tagId: tag.id },
    orderBy: { time: "desc" },
    select: { time: true, lat: true, lon: true },
  });

  return NextResponse.json({ snapshots });
}