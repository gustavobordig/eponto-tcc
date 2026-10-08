import React from "react";
import { Pencil } from "lucide-react";
// import { MapPin, Pencil } from "lucide-react";
export interface TimeEntry {
  time: string;
  location: string;
}

interface TimeEntryInputProps {
  label: string;
  value: TimeEntry;
  onChange: (value: TimeEntry) => void;
}

export const TimeEntryInput: React.FC<TimeEntryInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const [isTimeEditable, setIsTimeEditable] = React.useState(!!value.time);
  // const [isLocationEditable, setIsLocationEditable] = React.useState(!!value.location);


  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        <div className="relative">
          <input
            type="time"
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
            disabled={!isTimeEditable}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002085] placeholder-gray-800
            text-gray-800 ${!isTimeEditable ? 'bg-gray-50' : 'bg-white'}`}
            placeholder="00:00"
          />
          <button
            onClick={() => setIsTimeEditable(true)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 ${isTimeEditable ? 'hidden' : ''}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        {/* <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            disabled={!isLocationEditable}
            placeholder="Localização"
            className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002085] placeholder-gray-800
            text-gray-800 ${!isLocationEditable ? 'bg-gray-50' : 'bg-white'}`}
          />
          <button
            onClick={() => setIsLocationEditable(true)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 ${isLocationEditable ? 'hidden' : ''}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div> */}
      </div>
    </div>
  );
}; 