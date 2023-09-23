import React from 'react';

type LocationHistoryTableProps = {
  locationHistory: { time: string; lat: number; lng: number }[];
};

const LocationHistoryTable: React.FC<LocationHistoryTableProps> = ({ locationHistory }) => {
  return (
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
    </div>
  );
};

export default LocationHistoryTable;
