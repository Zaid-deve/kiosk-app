"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QrCode, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/use-cart"
import { generateOrderNumber } from "@/lib/utils"
import useAuth from "@/lib/useAuth"
import { API_URL } from "@/lib/base"

export default function OrderPayment() {
  const router = useRouter()
  const { cartItems, clearCart, clearUserCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<string>("qr")
  const [loading, setLoading] = useState(false)
  const { isLogedIn, token } = useAuth();

  const isMember = localStorage.getItem("userType") === "member"
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const discount = isMember ? subtotal * 0.2 : 0 // Only apply discount for members
  const total = subtotal - discount

  const handlePayment = async () => {
    setLoading(true)
    const guestId: string = localStorage.getItem('guest-id') || '';
    const payload: Object = {
      orderItems: cartItems.map(cart => {
        return { id: cart.id, quantity: cart.quantity }
      })
    }
    if (isLogedIn) {
      payload.token = token;
    } else if (guestId) {
      payload.guestId = guestId;
    } else {
      alert("You need to login as a member or guest to place order");
      router.push('/membership-check');
    }

    // call the /order/place api for placing order
    try {
      const req = await fetch(API_URL + "/order/place.php", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      })
      const resp = await req.json();
      if (resp.ok) {
        localStorage.setItem('lastOrderTotal', total)
        localStorage.setItem('lastOrderNumber', "B&M-order-" + resp.orderId)
        localStorage.setItem('lastOrderItems', JSON.stringify(cartItems))

        // add to guest order : to implement
        if (guestId) {
          clearCart();
        } else {
          clearUserCart();
        }

        router.push('/order-confirmation');
        return;
      }
      throw new Error(resp.error);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }

  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Order</CardTitle>
          <CardDescription className="text-center text-gray-400">Choose your payment method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Order Summary</h3>
            <div className="bg-gray-700 rounded-md p-3 space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator className="my-2 bg-gray-600" />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {isMember && (
                <div className="flex justify-between text-primary text-sm">
                  <span>Membership Discount (20%)</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
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

