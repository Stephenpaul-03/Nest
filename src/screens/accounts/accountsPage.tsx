import { type PageProps } from "../../types/pageProps";

export default function Accounts({ navPath, setNavPath }: PageProps) {
  const sections = ["dashboard", "reports", "expenses", "transactions"];

  function go(to: string) {
    setNavPath([navPath[0], to]);
  }

  function goDeep(to: string) {
    setNavPath([...navPath, to]);
  }

  return (
    <div className="p-4">
      <div className="flex gap-4 border-b pb-2">
        {sections.map(s => (
          <button
            key={s}
            onClick={() => go(s)}
            className={navPath[1] === s ? "font-bold" : "opacity-50"}
          >
            {s}
          </button>
        ))}
      </div>

      {navPath[1] === "reports" && (
        <button onClick={() => goDeep("quarterly")} className="underline mt-4">
          Quarterly
        </button>
      )}

      {navPath.includes("quarterly") && <div>Quarterly Report Page</div>}
    </div>
  );
}
