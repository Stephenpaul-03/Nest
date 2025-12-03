import React from "react";
import { AppSidebar } from "@/components/nav-sideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ToolName } from "@/components/nav-sideBar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { loadRemoteApp } from "@/lib/loadRemoteApp";

export default function HomePage() {
  const [activeTool, setActiveTool] = React.useState<ToolName>("Accounts");
  const RemoteApp = React.useMemo(
    () => loadRemoteApp(activeTool),
    [activeTool]
  );

  return (
    <SidebarProvider>
      <AppSidebar activeTool={activeTool} onToolChange={setActiveTool} />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Tool</BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator className="hidden md:block" />

                <BreadcrumbItem>
                  <BreadcrumbPage>{activeTool}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <React.Suspense fallback={<div>Loading {activeTool}...</div>}>
            {RemoteApp && <RemoteApp />}
          </React.Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
