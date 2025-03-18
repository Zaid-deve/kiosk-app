"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Order } from "@/lib/mock-orders"
import useAuth from "@/lib/useAuth"
import { API_URL } from "@/lib/base"

export function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const { token, isLogedIn } = useAuth();

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const processingOrders = orders.filter((order) => {
    return order.status == 'processing' || order.status == 'delivered' || order.status == 'received'
  })
  const deliveredOrders = orders.filter((order) => order.status === "delivered")
  const completedOrders = orders.filter((order) => order.status === "completed")

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const req = await fetch(API_URL + '/admin/accept.php', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, orderId }),
      });

      const resp = await req.json();

      if (req.ok && resp.success) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "processing" } : order)))
      } else {
        alert(resp.error || "Failed to mark order");
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    try {
      const req = await fetch(API_URL + '/admin/reject.php', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, orderId }),
      });

      const resp = await req.json();

      if (req.ok && resp.success) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "rejected" } : order)))
      } else {
        alert(resp.error || "Failed to fetch orders");
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const req = await fetch(API_URL + '/admin/complete.php', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, orderId }),
      });

      const resp = await req.json();

      if (req.ok && resp.success) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "completed" } : order)))
      } else {
        alert(resp.error || "Failed to complete order");
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const req = await fetch(API_URL + '/admin/fetchOrders.php', {
          method: "POST",
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const resp = await req.json();

        if (req.ok && resp.success) {
          setOrders(resp.orders)
        } else {
          alert(resp.error || "Failed to fetch orders");
        }
      } catch (error: any) {
        alert(error.message);
      }
    })()
  }, [isLogedIn])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-gray-700">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingOrders.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processing" className="relative">
            Processing
            {processingOrders.length > 0 && (
              <Badge variant="default" className="ml-2 bg-yellow-600">
                {processingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No pending orders</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrders.map((order) => (
                <Card key={order.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <Badge variant="outline" className="bg-yellow-600/20 text-yellow-400 border-yellow-600">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{order.timestamp}</p>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-400 hover:bg-red-900/20 border-red-800"
                      onClick={() => handleRejectOrder(order.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {processingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No orders in processing</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processingOrders.map((order) => (
                <Card key={order.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Order #B&M-order-{order.orderNumber}</CardTitle>
                      <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-600">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{order.timestamp}</p>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-2">
                    {order.status == 'received' && <Button size="sm" onClick={() => handleCompleteOrder(order.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </Button>}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No completed orders</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedOrders.map((order) => (
                <Card key={order.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-600">
                        Completed
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{order.timestamp}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

