"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function ToolSwitcher({
  tools,
  activeTool,
  onSelect,
}: {
  tools: { name: string; logo: React.ElementType; plan: string }[]
  activeTool: string
  onSelect?: (tool: { name: string; logo: React.ElementType; plan: string }) => void
}) {
  const { isMobile } = useSidebar()

  const activetool = tools.find(t => t.name === activeTool) ?? tools[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activetool.logo className="size-4" />
              </div>

              <div className="grid flex-1 text-left text-sm">
                <span className="font-medium">{activetool.name}</span>
                <span className="text-xs opacity-60">{activetool.plan}</span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Tools
            </DropdownMenuLabel>

            {tools.map((tool, idx) => (
              <DropdownMenuItem
                key={tool.name}
                onClick={() => onSelect?.(tool)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <tool.logo className="size-3.5" />
                </div>
                {tool.name}
                <DropdownMenuShortcut>⌘{idx + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled className="p-2">
              Building more Tools for you!
            </DropdownMenuItem>
          </DropdownMenuContent>

        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
