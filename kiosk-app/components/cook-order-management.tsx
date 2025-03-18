import { useEffect, useState } from "react";
import { CheckCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockOrders, type Order } from "@/lib/mock-orders";
import useAuth from "@/lib/useAuth";
import { API_URL } from "@/lib/base";
import { Select, SelectContent, SelectItem, SelectValue } from "@radix-ui/react-select";

export function CookOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiters, setWaiters] = useState([]);
  const [selectedWaiter, setSelectedWaiter] = useState<string | null>(null);
  const { isLogedIn, token } = useAuth();

  const pendingOrders = orders.filter((order) => order.status === "processing");
  const completedOrders = orders.filter((order) => order.status === "ready");

  useEffect(() => {
    const fetchOrders = async () => {
      const payload: Object = {};
      if (isLogedIn) {
        payload.token = token;
        payload.for = 'cook';
      }

      try {
        const req = await fetch(API_URL + '/admin/fetchOrders.php', {
          method: "POST",
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const resp = await req.json();

        if (req.ok && resp.success) {
          setOrders(resp.orders);
          setWaiters(resp.waiters || []);
        } else {
          alert(resp.error || "Failed to fetch orders");
        }
      } catch (error: any) {
        alert(error.message);
      }
    };

    fetchOrders();
  }, [isLogedIn]);

  const handleOrderReady = async (orderId: string) => {
    try {
      const req = await fetch(API_URL + '/admin/markReady.php', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, orderId }),
      });

      const resp = await req.json();

      if (req.ok && resp.success) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "ready" } : order)));
      } else {
        alert(resp.error || "Failed to fetch orders");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleNotifyWaiter = async (orderId: string) => {
    if (!selectedWaiter) {
      alert("Please select a waiter before notifying.");
      return;
    }

    try {
      const req = await fetch(API_URL + '/admin/notifyWaiter.php', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, orderId, waiterId: selectedWaiter }),
      });

      const resp = await req.json();

      if (req.ok && resp.success) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "ready", notified: true } : order)));
      } else {
        alert(resp.error || "Failed to notify waiter");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-gray-700">
          <TabsTrigger value="pending" className="relative">
            Pending Orders
            {pendingOrders.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="relative">
            Ready for Pickup
            {completedOrders.length > 0 && (
              <Badge variant="default" className="ml-2 bg-green-600">
                {completedOrders.length}
              </Badge>
            )}
          </TabsTrigger>
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
                      <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-600">
                        Processing
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-2">
                    <Button size="sm" onClick={() => handleOrderReady(order.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Ready
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No orders ready for pickup</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedOrders.map((order) => (
                <Card key={order.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Order #B&M{order.orderNumber}</CardTitle>
                      <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-600">
                        Ready
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-2 gap-4">
                    {!order.notified && <select
                      value={selectedWaiter || ""}
                      onChange={(e) => setSelectedWaiter(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="" disabled>
                        Choose a waiter
                      </option>
                      {
                        waiters.map((waiter, id) => (
                          <option key={id} value={waiter}>
                            {`Waiter No :${id+1}`}
                          </option>
                        ))
                      }
                    </select>}

                    {!order.notified && <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNotifyWaiter(order.id)}
                      disabled={!selectedWaiter}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notify Waiter
                    </Button>}
                    {order.notified && <div>waiter is notified and order will be delivered soon !</div>}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
