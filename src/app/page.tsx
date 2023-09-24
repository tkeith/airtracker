"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import MapComponent from "./MapComponent";
import LocationHistoryTable from "./LocationHistoryTable";
import { intToFloat } from "../lib/utils";

export default function Home() {
  const [tagName, setTagName] = useState("");
  const [selectedTagName, setSelectedTagName] = useState("");
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [locationHistory, setLocationHistory] = useState<
    { time: string; lat: number; lng: number }[]
  >([]);
  const [isTableVisible, setTableVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedTagNames = localStorage.getItem("tagNames");
    if (storedTagNames) {
      setTagNames(JSON.parse(storedTagNames));
    }
  }, []);

  const handleSubmit = async (name: string) => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    handleSubmit(tagName);
    setTagName("");
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <div className="text-2xl font-bold mb-4">AirTracker</div>
      <div className="flex flex-row items-center justify-center mb-2">
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
      <hr className="w-full mb-4 border-t-2 border-gray-200" />

      {!isLoading && !selectedTagName ? (
        <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Select a tag above</strong>
        </div>
      ) : null}

      {isLoading ? (
        <div className="text-lg font-bold">Loading...</div>
      ) : selectedTagName && locationHistory.length > 0 ? (
        <>
          <MapComponent points={locationHistory} />
          {isTableVisible && (
            <LocationHistoryTable locationHistory={locationHistory} />
          )}
        </>
      ) : selectedTagName ? (
        <div
          className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">No location data for this tag.</strong>
        </div>
      ) : null}
      {selectedTagName && (
        <button
          onClick={() => setTableVisible(!isTableVisible)}
          className="mt-4 p-2 bg-gray-500 text-white rounded"
        >
          {isTableVisible ? "Hide" : "Show"} Location History
        </button>
      )}
    </div>
  );
}
