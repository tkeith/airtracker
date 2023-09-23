"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import MapComponent from "./MapComponent";
import { intToFloat } from "../lib/utils";

export default function Home() {
  const [tagName, setTagName] = useState("");
  const [selectedTagName, setSelectedTagName] = useState("");
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [locationHistory, setLocationHistory] = useState<
    { time: string; lat: number; lng: number }[]
  >([]);

  useEffect(() => {
    const storedTagNames = localStorage.getItem("tagNames");
    if (storedTagNames) {
      setTagNames(JSON.parse(storedTagNames));
    }
  }, []);

  const handleSubmit = async (name: string) => {
    setSelectedTagName(name);
    if (!tagNames.includes(name)) {
      const updatedTagNames = [...tagNames, name];
      localStorage.setItem("tagNames", JSON.stringify(updatedTagNames));
      setTagNames(updatedTagNames);
    }
    const response = await axios.get(`/api/getTagLocationHistory?name=${name}`);
    const convertedSnapshots = response.data.snapshots.map((snapshot: any) => ({
      ...snapshot,
      lat: intToFloat(snapshot.lat),
      lng: intToFloat(snapshot.lon),
    }));
    setLocationHistory(convertedSnapshots);
  };

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    handleSubmit(tagName);
    setTagName("");
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <div className="flex flex-row items-center justify-center mt-12">
        {tagNames.map((name, index) => (
          <button
            key={index}
            onClick={() => handleSubmit(name)}
            className={`p-2 rounded m-2 ${
              name === selectedTagName ? "bg-blue-500" : "bg-blue-300"
            } text-white`}
          >
            {name}
          </button>
        ))}
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center justify-center ml-2"
        >
          <input
            type="text"
            placeholder="Enter new tag name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            className="mr-4 p-2 border border-gray-400 rounded"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Add tag
          </button>
        </form>
      </div>
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
                    {snapshot.lat} {snapshot.lng}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <MapComponent points={locationHistory} />
        </div>
      )}
    </div>
  );
}
