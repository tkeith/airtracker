"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [tagName, setTagName] = useState("");
  const [locationHistory, setLocationHistory] = useState<
    { time: string; lat: number; lon: number }[]
  >([]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const response = await axios.get(
      `/api/getTagLocationHistory?name=${tagName}`
    );
    setLocationHistory(response.data.snapshots);
  };

  return (
    <div className="container mx-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-center mt-12"
      >
        <input
          type="text"
          placeholder="Enter tag name"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          className="mr-4 p-2 border border-gray-400 rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Submit
        </button>
      </form>
      {locationHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Location History:</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-gray-400">Timestamp</th>
                <th className="p-2 border border-gray-400">Location</th>
              </tr>
            </thead>
            <tbody>
              {locationHistory.map((snapshot, index) => (
                <tr key={index}>
                  <td className="p-2 border border-gray-400">
                    {snapshot.time}
                  </td>
                  <td className="p-2 border border-gray-400">
                    {snapshot.lat} {snapshot.lon}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
