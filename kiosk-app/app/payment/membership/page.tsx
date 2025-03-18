"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QrCode, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function MembershipPayment() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<string>("qr")
  const [loading, setLoading] = useState(false)

  const handlePayment = () => {
    setLoading(true)

    // In a real app, you would process the payment
    // For now, we'll just simulate a successful payment
    setTimeout(() => {
      router.push("/menu")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Membership Payment</CardTitle>
          <CardDescription className="text-center text-gray-400">Pay ₹500 to activate your membership</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 bg-gray-700 rounded-md">
            <p className="text-xl font-bold">Amount: ₹500</p>
            <p className="text-sm text-gray-400">One-time membership fee</p>
          </div>

          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="qr" id="qr" className="peer sr-only" />
              <Label
                htmlFor="qr"
                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800 p-4 hover:bg-gray-700 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <QrCode className="mb-3 h-6 w-6" />
                QR Payment
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online" className="peer sr-only" />
              <Label
                htmlFor="online"
                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800 p-4 hover:bg-gray-700 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <CreditCard className="mb-3 h-6 w-6" />
                Online Payment
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "qr" && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-md">
                <img src="/placeholder.svg?height=200&width=200" alt="QR Code for payment" className="w-48 h-48" />
              </div>
            </div>
          )}

          {paymentMethod === "online" && (
            <div className="space-y-4 p-4 bg-gray-700 rounded-md">
              <p className="text-center">You will be redirected to our payment gateway</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handlePayment} className="w-full" disabled={loading}>
            {loading ? "Processing Payment..." : "Complete Payment"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

