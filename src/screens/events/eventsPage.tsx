import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Dashboard from "./pages/dashboard";

type PageProps = {
  navPath: string[];
  setNavPath: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function Events({ navPath, setNavPath }: PageProps) {
  const sections = ["dashboard", "upcoming"];

  const go = (to: string) => setNavPath([navPath[0], to]);
  const goDeep = (to: string) => setNavPath([...navPath, to]);

  return (
    // <div className="p-4">
    //   {/* Tabs controlling the top-level view */}
    //   <Tabs
    //     value={navPath[1]}
    //     onValueChange={(v) => go(v)}
    //     className="w-full"
    //   >
    //     <TabsList className="">
    //       {sections.map((s) => (
    //         <TabsTrigger key={s} value={s}>
    //           {s.charAt(0).toUpperCase() + s.slice(1)}
    //         </TabsTrigger>
    //       ))}
    //     </TabsList>

    //     {/* DASHBOARD TAB CONTENT */}
    //     <TabsContent value="dashboard">
    //       <Dashboard/>

    //       {/* Level 3 */}
    //       {navPath[2] === "stats" && (
    //         <div className="mt-4">Event Stats Dashboard</div>
    //       )}
    //     </TabsContent>

    //     {/* UPCOMING TAB CONTENT */}
    //     <TabsContent value="upcoming">
    //       {/* Level 2 view */}
    //       <div className="mt-2">
    //         Upcoming Events
    //         <button
    //           onClick={() => goDeep("create")}
    //           className="underline ml-3"
    //         >
    //           Create Event
    //         </button>
    //       </div>

    //       {/* Level 3 */}
    //       {navPath[2] === "create" && (
    //         <div className="mt-4">
    //           New Event Form
    //           <button
    //             onClick={() => goDeep("details")}
    //             className="underline ml-3"
    //           >
    //             Fill Details
    //           </button>
    //         </div>
    //       )}

    //       {/* Level 4 */}
    //       {navPath[3] === "details" && (
    //         <div className="mt-4">Event Detailed Submission Page</div>
    //       )}
    //     </TabsContent>
    //   </Tabs>
    // </div>
    <Dashboard/>
  );
}
