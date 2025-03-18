"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_URL } from "@/lib/base"
import useAuth from "@/lib/useAuth"

export default function MembershipRegister() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const { isLogedIn, userType } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (isLogedIn && userType == 'member') {
      router.push('/menu');
    }
  }, [isLogedIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const resp = await fetch(API_URL + '/user/register.php', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await resp.json();

      if (resp.ok) {
        const { token } = data;
        localStorage.setItem('kiosk-token', token)
        localStorage.setItem('kiosk-user-type', 'member')
        router.push('/payment/membership');
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
          <CardTitle className="text-2xl text-center">Register for Membership</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Join our membership program for 20% off on all orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Register & Pay ₹500 Membership Fee"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-gray-400 text-center">
          <p>Membership fee: ₹500 (one-time payment)</p>
        </CardFooter>
      </Card>
    </div>
  )
}

