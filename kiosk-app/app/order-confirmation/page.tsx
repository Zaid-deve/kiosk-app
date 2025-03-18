"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle, Printer, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import useAuth from "@/lib/useAuth"
import { API_URL } from "@/lib/base"

export default function OrderConfirmation() {
  const [orderNumber, setOrderNumber] = useState("")
  const [orderTotal, setOrderTotal] = useState("")
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [isSending, setIsSending] = useState(false)
  const { isLogedIn, userType, token } = useAuth();
  const [isSent, setSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Retrieve order details from localStorage
    const storedOrderNumber = localStorage.getItem("lastOrderNumber") || "Unknown"
    const storedOrderTotal = localStorage.getItem("lastOrderTotal") || "0"
    const storedOrderItems = JSON.parse(localStorage.getItem("lastOrderItems") || "[]")

    setOrderNumber(storedOrderNumber)
    setOrderTotal(storedOrderTotal)
    setOrderItems(storedOrderItems)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleEmailReceipt = async () => {
    try {
      setIsSending(true)
      const req = await fetch(API_URL + '/mail/send.php', {
        method: "POST",
        headers: { "content-type": 'application/json' },
        body: JSON.stringify({ token, orderId: orderNumber.split('-').pop() })
      })
      const res = await req.json();
      if(req.ok && !res.error){
        alert("Receipt has been sent to you mail !");
        setSent(true);
        return;
      }
      throw new Error(res.error);
    } catch (error: any) {
      alert(error.message);
    }
    finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription className="text-gray-400">
            Your order has been received and is being prepared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-700 rounded-md p-4 text-center">
            <p className="text-sm text-gray-400">Order Number</p>
            <p className="text-xl font-bold">{orderNumber}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Order Details</h3>
            <div className="bg-gray-700 rounded-md p-3 space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator className="my-2 bg-gray-600" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{Number.parseFloat(orderTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-center text-sm text-gray-400">
              A copy of this receipt has been sent to your email
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              {isLogedIn && userType == 'member' && !isSent && <Button variant="outline" size="sm" onClick={handleEmailReceipt} disabled={isSending}>
                <Mail className="mr-2 h-4 w-4" />
                Email Receipt
              </Button>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/menu">
            <Button>Continue Shopping</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

