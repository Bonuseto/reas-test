import React from "react";
import { CZECH_REGIONS_DATA } from "../data/czechRegionsData";

interface CzechMapProps {
  selectedRegion: string;
  selectedDistrict: string;
  onSelectionChange: (region: string, district: string) => void;
}

const CzechMap: React.FC<CzechMapProps> = ({
  selectedRegion,
  selectedDistrict,
  onSelectionChange,
}) => {
  const handleRegionSelect = (region: string) => {
    if (region === "Praha") {
      onSelectionChange(region, "Praha");
    } else {
      onSelectionChange(region, "");
    }
  };

  const handleDistrictSelect = (district: string) => {
    onSelectionChange(selectedRegion, district);
  };

  const getAvailableDistricts = () => {
    const region = CZECH_REGIONS_DATA.find((r) => r.name === selectedRegion);
    return region?.districts || [];
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-1 text-gray-900 text-left">
        Kde se nachází vaše nemovitost?
      </h2>
      <p className="text-sm text-blue-600 mb-6 text-left">
        Klikněte na kraj na mapě
      </p>

      <div className="flex justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1412 809"
          className="p-2 w-full max-w-6xl"
          style={{ maxHeight: "600px" }}
        >
          {CZECH_REGIONS_DATA.map((region) => (
            <g key={region.name} className="group">
              <path
                d={region.path}
                className={`cursor-pointer transition-colors duration-200 stroke-slate-500 stroke-[2.5] stroke-linejoin-bevel hover:fill-blue-400 ${
                  selectedRegion === region.name
                    ? "fill-blue-600"
                    : "fill-slate-200"
                }`}
                onClick={() => handleRegionSelect(region.name)}
              />
              {region.position && (
                <text
                  x={region.position.x}
                  y={region.position.y}
                  textAnchor="middle"
                  fill={selectedRegion === region.name ? "#ffffff" : "#1f2937"}
                  fontSize="22"
                  fontWeight="bold"
                  fontFamily="Inter"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                  className={
                    selectedRegion !== region.name
                      ? "group-hover:fill-white"
                      : ""
                  }
                >
                  {region.name}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Districts Selection */}
      {selectedRegion && selectedRegion !== "Praha" && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4 text-left">Vyberte okres</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {getAvailableDistricts().map((district: string) => (
              <label
                key={district}
                className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  value={district}
                  checked={selectedDistrict === district}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:outline-none focus:ring-0"
                />
                <span className="text-sm text-gray-700 leading-5">
                  {district}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CzechMap;
