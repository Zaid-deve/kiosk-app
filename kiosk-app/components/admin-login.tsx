"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_URL } from "@/lib/base"
import useAuth from "@/lib/useAuth"

interface AdminLoginProps {
  onLogin: () => void
  title?: string,
  route?: string
}

export function AdminLogin({ onLogin, title = "Admin Dashboard Login", route = 'admin' }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { isLogedIn, userType } = useAuth();

  useEffect(() => {
    if (isLogedIn) {
      if (userType == 'admin' && route == 'admin') {
        onLogin();
      }
      if (userType == 'cook' && route == 'cook') {
        onLogin();
      }
      if (userType == 'waiter' && route == 'waiter') {
        onLogin();
      }
    }
  }, [isLogedIn])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = { username, password, route };

    try {
      setLoading(true)
      const resp = await fetch(API_URL + '/admin/login.php', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await resp.json();

      if (resp.ok) {
        const { token } = data;
        localStorage.setItem('kiosk-token', token)
        localStorage.setItem('kiosk-user-type', route);
        onLogin();
        return;
      }

      alert(data.error || 'something went wrong !');

    } catch (error: any) {
      alert(error.error || error.message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{title}</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-md text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

