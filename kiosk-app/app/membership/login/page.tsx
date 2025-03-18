"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_URL } from "@/lib/base"
import useAuth from "@/lib/useAuth"

export default function MembershipLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { isLogedIn, userType } = useAuth();

  useEffect(() => {
    if (isLogedIn && userType == 'member') {
      router.push('/menu');
    }
  }, [isLogedIn])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = { email, password };

    try {
      setLoading(true)
      const resp = await fetch(API_URL + '/user/login.php', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await resp.json();

      if (resp.ok) {
        const { token } = data;
        localStorage.setItem('kiosk-token', token)
        localStorage.setItem('kiosk-user-type', 'member')
        router.push('/menu');
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
          <CardTitle className="text-2xl text-center">Membership Login</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access membership benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
        <CardFooter className="flex justify-between">
          <Link href="/membership/register" className="text-sm text-primary hover:underline">
            Register New Membership
          </Link>
          <Link href="/menu" className="text-sm text-gray-400 hover:underline">
            Continue as Guest
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

