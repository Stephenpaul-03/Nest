"use client"

import * as React from "react"
import {
  Calendar,
  CreditCardIcon,
  Lock,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { ToolSwitcher } from "@/components/nav-toolSwitcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


const data = {
  user: {
    name: "Stephen Paul",
    email: "StephenPaul@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  tools: [
    {
      name: "Accounts",
      logo: CreditCardIcon,
      plan: "Finance",
    },
    {
      name: "Events",
      logo: Calendar,
      plan: "Calender",
    },
    {
      name: "Vault",
      logo: Lock,
      plan: "Documents",
    },
  ],
}

const navByTool = {
  Accounts: [
    {
      title: "Finance Dashboard",
      url: "#",
      icon: SquareTerminal,
      items: [
        { title: "Overview", url: "#" },
        { title: "Transactions", url: "#" },
        { title: "Reports", url: "#" },
      ],
    },
  ],
  Events: [
    {
      title: "Events",
      url: "#",
      icon: Calendar,
      items: [
        { title: "Upcoming", url: "#" },
        { title: "Past Events", url: "#" },
        { title: "Create Event", url: "#" },
      ],
    },
  ],
  Vault: [
    {
      title: "Documents",
      url: "#",
      icon: Lock,
      items: [
        { title: "All Files", url: "#" },
        { title: "Shared", url: "#" },
        { title: "Recycle Bin", url: "#" },
      ],
    },
  ],
} as const

type ToolName = keyof typeof navByTool

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const [activeTool, setActiveTool] = React.useState<ToolName>("Accounts")

  const navItems = navByTool[activeTool]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ToolSwitcher
          teams={data.tools}
          onSelect={(team) => setActiveTool(team.name as ToolName)}
        />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
