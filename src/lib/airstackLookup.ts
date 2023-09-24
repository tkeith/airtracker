import axios from "axios";

export async function airstackLookup(toLookup: string): Promise<string | null> {
  const airstackRes = await axios({
    method: "post",
    url: "https://api.airstack.xyz/gql",
    headers: {
      Accept: "application/json, multipart/mixed",
      "Accept-Language": "en-US,en;q=0.9",
      Authorization: process.env.AIRSTACK_API_KEY!,
      "Content-Type": "application/json",
    },
    data: {
      query: `query Q1 {
      Wallet(input: { identity: "${toLookup}", blockchain: ethereum }) {
        addresses
      }
    }`,
      operationName: "Q1",
    },
    withCredentials: true,
  });

  console.log("airstackRes.data", JSON.stringify(airstackRes.data, null, 2));
  try {
    return airstackRes.data.data.Wallet.addresses[0] || null;
  } catch (e) {
    return null;
  }
}
