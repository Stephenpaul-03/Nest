import React from "react"
import type { ToolName } from "@/components/nav-sideBar"

export function loadRemoteApp(tool: ToolName) {
  switch (tool) {
    case "Events":
      return React.lazy(() => import("events/App"))
    case "Accounts":
      return React.lazy(() => import("accounts/App"))
    case "Vault":
      return React.lazy(() => import("vault/App"))
    default:
      return null
  }
}
