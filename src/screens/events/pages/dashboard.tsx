import CalendarBox from "@/components/calendarBox";
import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-full p-4 bg-white grid grid-cols-[1.5fr_2fr] gap-4">
      <div className="flex flex-col gap-4 p-2">
        <div className="flex-1">
          <CalendarBox/>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col gap-4 border-4 border-red-900 p-2">
        
        {/* yellow triple boxes */}
        <div className="grid grid-cols-3 gap-4 border-4 border-purple-700 p-4 bg-purple-300">
          <div className="h-24 border-4 border-purple-900 bg-yellow-300" />
          <div className="h-24 border-4 border-purple-900 bg-yellow-300" />
          <div className="h-24 border-4 border-purple-900 bg-yellow-300" />
        </div>

        {/* navy triple big boxes */}
        <div className="grid grid-cols-3 gap-4 border-4 border-green-700 p-4 bg-green-300 flex-1">
          <div className="border-4 border-green-900 bg-indigo-900" />
          <div className="border-4 border-green-900 bg-indigo-900" />
          <div className="border-4 border-green-900 bg-indigo-900" />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
