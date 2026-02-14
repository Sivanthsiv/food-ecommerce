"use client"

import { useEffect } from "react"

export function DbAutoConnect() {
  useEffect(() => {
    // Warm up the backend/database connection when the site is opened.
    fetch("/api/health", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => {
      // Ignore warm-up failures; normal API calls will still retry connection.
    })
  }, [])

  return null
}
