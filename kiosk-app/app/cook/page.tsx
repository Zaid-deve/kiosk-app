"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CookOrderManagement } from "@/components/cook-order-management"
import { AdminLogin } from "@/components/admin-login"
import Link from "next/link"

export default function CookDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} title="Cook Dashboard Login" route="cook" />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto max-w-6xl">
      <Link href="/membership-check"><h1 className="text-2xl font-bold mb-6">B&M Restaurant Admin Dashboard</h1></Link>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription className="text-gray-400">
              View and manage incoming orders. Notify waiters when orders are ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CookOrderManagement />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

