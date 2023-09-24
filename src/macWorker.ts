import fs from "fs";
import path from "path";
import { floatToInt } from "./lib/utils";
import { API_PREFIX, MAC_USERNAME } from "./lib/consts";

async function main() {
  while (true) {
    try {
      // Read the Items.data file
      const items = JSON.parse(
        fs.readFileSync(
          path.resolve(
            "/Users/" +
              MAC_USERNAME +
              "/Library/Caches/com.apple.findmy.fmipcore/Items.data"
          ),
          "utf-8"
        )
      );

      // For each item, make a POST request to the /setTagLocation endpoint
      for (const item of items) {
        // console.log("parsing item: " + JSON.stringify(item));

        // skip if location is null
        if (!item.location) {
          continue;
        }

        const {
          location: { latitude, longitude },
          name,
        } = item;

        // Convert the latitude and longitude to integers using floatToInt function
        const lat = floatToInt(latitude);
        const lon = floatToInt(longitude);

        const dataToPost = { name, lat, lon };

        console.log(`Posting ${JSON.stringify(dataToPost)}`);

        // Make the POST request using fetch instead of axios
        const setTagLocationRes = await fetch(
          API_PREFIX + "/api/setTagLocation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToPost),
          }
        );

        // log the result of making the api call
        console.log(
          `setTagLocationRes: status code ${
            setTagLocationRes.status
          }, text response ${await setTagLocationRes.text()}`
        );
      }

      // Wait for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (e) {
      console.log("error", e);
      // wait 30 seconds
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }
}

main().then(() => {
  process.exit(0);
});
