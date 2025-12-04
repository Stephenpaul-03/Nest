import React, { useEffect } from "react";

import { AppSidebar } from "@/components/navigation/nav-sideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import Accounts from "../accounts/accountsPage";
import Events from "../events/eventsPage";
import Vault from "../vault/vaultPage";

import Breadcrumbs from "@/components/breadcrumbs/breadcrumb";

export type ToolName = "Accounts" | "Events" | "Vault";

export default function HomePage() {
  const initial = window.location.pathname
    .replace("/", "")
    .split("/")
    .filter(Boolean);

  const [navPath, setNavPath] = React.useState<string[]>(
    initial.length ? initial.map(x => x.charAt(0).toUpperCase() + x.slice(1)) : ["Accounts", "Dashboard"]
  );

  useEffect(() => {
    const url = navPath.map(v => v.toLowerCase()).join("/");
    window.history.pushState(null, "", "/" + url);
  }, [navPath]);

  const activeTool = navPath[0] as ToolName;

  const screens: Record<ToolName, React.ReactNode> = {
    Accounts: <Accounts navPath={navPath} setNavPath={setNavPath} />,
    Events: <Events navPath={navPath} setNavPath={setNavPath} />,
    Vault: <Vault navPath={navPath} setNavPath={setNavPath} />,
  };

  function switchTool(tool: ToolName) {
    setNavPath([tool, "Dashboard"]); // resets only second level
  }

  return (
    <SidebarProvider>
      <AppSidebar activeTool={activeTool} onToolChange={switchTool} />

      <SidebarInset>

        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />

          <Breadcrumbs navPath={navPath} setNavPath={setNavPath} />
        </header>

        <main className="flex flex-1 flex-col p-4 pt-2">
          {screens[activeTool]}
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}
