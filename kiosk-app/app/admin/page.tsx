"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminMenuManagement } from "@/components/admin-menu-management"
import { AdminOrderManagement } from "@/components/admin-order-management"
import { AdminLogin } from "@/components/admin-login"
import { MenuProvider } from "@/hooks/useMenu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AdminStaff from "@/components/admin-staff-management"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto max-w-6xl">
        <Link href="/membership-check"><h1 className="text-2xl font-bold mb-6">B&M Restaurant Admin Dashboard</h1></Link>

        <Tabs defaultValue="menu" className="space-y-4">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
          </TabsList>

          <div className="flex gap-3 justify-end">
            <Link href='/add/cook'>
              <Button>+ Add Cook</Button>
            </Link>
            <Link href='/add/waiter'>
              <Button>+ Add Waiter</Button>
            </Link>
          </div>

          <TabsContent value="menu" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Add, edit, or remove items from your restaurant menu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MenuProvider>
                  <AdminMenuManagement />
                </MenuProvider>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription className="text-gray-400">View and manage incoming orders.</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminOrderManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Staff Management</CardTitle>
                <CardDescription className="text-gray-400">View and manage staff members.</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminStaff />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

