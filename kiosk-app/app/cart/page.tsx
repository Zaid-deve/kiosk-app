"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/use-cart"
import { API_URL } from "@/lib/base"
import useAuth from "@/lib/useAuth"

export default function Cart() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isMember, setIsMember] = useState(false)
  const { userType, isLogedIn, token } = useAuth();
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    // Check if user is a member from localStorage
    const userType = localStorage.getItem("userType")
    setIsMember(userType === "member")
  }, [userType])

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const discount = isMember ? subtotal * 0.2 : 0
  const total = subtotal - discount

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    router.push("/payment/order")
  }

  // Custom function to handle the quantity update
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return
    }

    if (isLogedIn && userType === 'member') {
      try {
        setLoading(true);  // Start loading
        const req = await fetch(API_URL + '/cart/update.php', {
          method: "POST",
          headers: { "content-type": 'application/json' },
          body: JSON.stringify({ itemId, newQuantity, token })
        })
        const result = await req.json();
        if (result.error) {
          throw new Error(result.error);
        }
        
      } catch (error: any) {
        alert(error.message)
        return;
      } finally {
        setLoading(false); 
      }
    }

    // Call the updateQuantity function after custom logic
    updateQuantity(itemId, newQuantity)
  }

  // Custom function to handle item removal from the cart
  const handleRemoveItem = async (itemId: string) => {
    if (isLogedIn && userType === 'member') {
      try {
        setLoading(true);  // Start loading
        const req = await fetch(API_URL + '/cart/remove.php', {
          method: "POST",
          headers: { "content-type": 'application/json' },
          body: JSON.stringify({ itemId, token })
        })
        const result = await req.json();
        if (result.error) {
          throw new Error(result.error);
        }
        
      } catch (error: any) {
        alert(error.message)
        return;
      } finally {
        setLoading(false); 
      }
    }

    removeFromCart(itemId)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-400">
            <p>Add some delicious items from our menu to get started.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/menu">
              <Button>Return to Menu</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-400">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={loading}  // Disable button when loading
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={loading}  // Disable button when loading
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={loading}  // Disable remove button while loading
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-24 text-right">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Separator className="my-4 bg-gray-700" />
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {isMember && (
                <div className="flex justify-between text-primary">
                  <span>Membership Discount (20%)</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-2 bg-gray-700" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <Link href="/menu">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
