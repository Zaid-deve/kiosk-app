"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateGuestId } from "@/lib/functions"
import useAuth from "@/lib/useAuth"
import Link from "next/link"

export default function MembershipCheck() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { logout, isLogedIn } = useAuth();

  const handleMembershipSelection = (isMember: boolean) => {
    setLoading(true)
    if (isMember) {
      localStorage.removeItem('guest-id');
      router.push("/membership/login")
    } else {
      logout();
      localStorage.setItem('guest-id', generateGuestId());
      router.push("/menu")
    }
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Membership Check</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Are you a membership user or a regular user?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="outline"
              className="h-20 text-lg border-primary hover:bg-primary/20"
              onClick={() => handleMembershipSelection(true)}
              disabled={loading}
            >
              I am a Membership User
            </Button>
            <Button
              variant="outline"
              className="h-20 text-lg border-gray-600 hover:bg-gray-700"
              onClick={() => handleMembershipSelection(false)}
              disabled={loading}
            >
              I am a Regular User
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center text-sm text-gray-400">
            <p>Membership users get 20% off on all orders</p>
          </div>
        </CardFooter>
        <p className="px-3 pb-5">
          <div className="text-center text-2xl">
            or
          </div>
          <div className="flex mt-4 flex-wrap bg-gray-700">
            <Link href='/admin' className="w-1/2">
              <Button className="bg-transparent border  w-full text-white rounded-none">I Am Admin</Button>
            </Link>
            <Link href='/cook' className="w-1/2">
              <Button className="bg-transparent border   w-full text-white rounded-none">I Am Cook</Button>
            </Link>
            <Link href='/waiter' className="w-full flex-shrink-0">
              <Button className="bg-transparent border  w-full text-white rounded-none">I Am Waiter</Button>
            </Link>
          </div>
        </p>
      </Card>
    </div>
  )
}

