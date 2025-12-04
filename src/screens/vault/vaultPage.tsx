type PageProps = {
  navPath: string[];
  setNavPath: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function Vault({ navPath, setNavPath }: PageProps) {
  const sections = ["files", "archives", "security", "settings"];

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

      {/* Level 2 content */}
      {navPath[1] === "files" && (
        <div className="mt-4">
          Stored Files
          <button onClick={() => goDeep("preview")} className="underline ml-3">
            Preview File
          </button>
        </div>
      )}

      {navPath[1] === "archives" && (
        <div className="mt-4">
          File Archives
          <button onClick={() => goDeep("2023")} className="underline ml-3">
            2023 Archive
          </button>
        </div>
      )}

      {navPath[1] === "security" && (
        <div className="mt-4">
          Security & Access
          <button onClick={() => goDeep("keys")} className="underline ml-3">
            Access Keys
          </button>
        </div>
      )}

      {navPath[1] === "settings" && <div className="mt-4">Vault Settings</div>}

      {/* Level 3 */}
      {navPath[2] === "preview" && (
        <div className="mt-4">File Preview Placeholder</div>
      )}
      {navPath[2] === "2023" && (
        <div className="mt-4">
          2023 Archived Files
          <button onClick={() => goDeep("jan")} className="underline ml-3">
            Jan
          </button>
        </div>
      )}
      {navPath[2] === "keys" && (
        <div className="mt-4">Manage Access Keys</div>
      )}

      {/* Level 4 */}
      {navPath[3] === "jan" && <div className="mt-4">January Files</div>}
    </div>
  );
}
