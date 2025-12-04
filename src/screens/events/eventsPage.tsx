type PageProps = {
  navPath: string[];
  setNavPath: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function Events({ navPath, setNavPath }: PageProps) {
  const sections = ["overview", "manage", "calendar", "analytics"];

  const go = (to: string) => setNavPath([navPath[0], to]);
  const goDeep = (to: string) => setNavPath([...navPath, to]);

  return (
    <div className="p-4">
      {/* Level 2 Navigation */}
      <div className="flex gap-3 border-b pb-2">
        {sections.map(s => (
          <button
            key={s}
            onClick={() => go(s)}
            className={navPath[1] === s ? "font-bold" : "opacity-60"}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Nested views */}
      {navPath[1] === "overview" && (
        <div className="mt-4">
          Overview of Events
          <button onClick={() => goDeep("stats")} className="underline ml-3">
            View Stats
          </button>
        </div>
      )}

      {navPath[1] === "manage" && (
        <div className="mt-4">
          Manage Events
          <button onClick={() => goDeep("create")} className="underline ml-3">
            Create Event
          </button>
        </div>
      )}

      {/* Level 3 */}
      {navPath[2] === "stats" && <div className="mt-4">Event Stats Dashboard</div>}
      {navPath[2] === "create" && (
        <div className="mt-4">
          New Event Form
          <button onClick={() => goDeep("details")} className="underline ml-3">
            Fill Details
          </button>
        </div>
      )}

      {/* Level 4 */}
      {navPath[3] === "details" && (
        <div className="mt-4">Event Detailed Submission Page</div>
      )}
    </div>
  );
}
