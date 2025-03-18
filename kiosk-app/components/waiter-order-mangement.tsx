"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/lib/useAuth";
import { API_URL } from "@/lib/base";

export function WaiterOrderMangement() {
    const [waiterOrders, setWaiterOrders] = useState<any[]>([]);
    const [newOrderAlert, setNewOrderAlert] = useState(false);  // State to control alert visibility
    const { isLogedIn, token, userType } = useAuth();

    const fetchWaiterOrders = async () => {
        const payload: Object = {};
        if (isLogedIn) {
            payload.token = token;
            payload.for = 'waiter';
        }
    
        try {
            const req = await fetch(API_URL + '/admin/fetchOrders.php', {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            });
    
            const resp = await req.json();
    
            if (req.ok) {
                // Check if there are new orders by comparing with previous state
                const hasNewOrders = resp.orders.length > waiterOrders.length || 
                    resp.orders.some(newOrder => !waiterOrders.some(oldOrder => oldOrder.id === newOrder.id));
                
                // Update the orders state
                setWaiterOrders(resp.orders);
    
                // Only show alert if there are actually new orders
                if (hasNewOrders) {
                    setNewOrderAlert(true);
    
                    // Hide the alert after 5 seconds
                    setTimeout(() => {
                        setNewOrderAlert(false);
                    }, 5000);
                }
            } else {
                alert(resp.error || "Failed to fetch waiterOrders");
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    useEffect(() => {
        if (isLogedIn && userType === 'waiter') {
            // Fetch orders when component mounts
            fetchWaiterOrders();

            // Set interval to fetch orders every 5 seconds (5000 ms)
            const interval = setInterval(() => {
                fetchWaiterOrders();
            }, 5000);

            // Clean up the interval when the component unmounts
            return () => clearInterval(interval);
        }
    }, [isLogedIn, userType]); // Re-run when login state or userType changes

    const deliverOrder = async (orderId: string) => {
        try {
            const req = await fetch(API_URL + '/admin/deliver.php', {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ token, orderId }),
            });

            const resp = await req.json();

            if (req.ok && resp.success) {
                setWaiterOrders(waiterOrders.filter(wo => wo.id !== orderId));
            } else {
                alert(resp.error || "Failed to deliver order");
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-6">
            {newOrderAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 p-4 bg-green-500 text-white rounded-lg shadow-md">
                    <div className="flex items-center">
                        <CheckCircle className="mr-2 h-6 w-6" />
                        <span>You have new orders!</span>
                    </div>
                </div>
            )}

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList className="bg-gray-700">
                    <TabsTrigger value="pending" className="relative">
                        To Deliver
                        {waiterOrders.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {waiterOrders.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {waiterOrders.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No Orders To Deliver</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {waiterOrders.map((order) => (
                                <Card key={order.id} className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">Order #B&M-order-{order.id}</CardTitle>
                                            <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-600">
                                                ready to deliver
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
                                        <Button size="sm" onClick={() => deliverOrder(order.id)}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            I Have Delivered
                                        </Button>
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
