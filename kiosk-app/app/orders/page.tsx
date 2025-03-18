"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/lib/base";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import useAuth from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { Clock, Truck, Badge, CheckCircle, XCircle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const { token, isLogedIn } = useAuth();
    const router = useRouter();

    // Fetch orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            const payload: Object = {};
            const guestId = localStorage.getItem('guest-id');
            if (isLogedIn) {
                payload.token = token;
            } else if (guestId) {
                payload.guestId = guestId;
            } else {
                return;
            }

            try {
                const req = await fetch(API_URL + '/order/fetch.php', {
                    method: "POST",
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const resp = await req.json();

                if (req.ok && resp.success) {
                    setOrders(resp.orders);
                } else {
                    alert(resp.error || "Failed to fetch orders");
                }
            } catch (error: any) {
                alert(error.message);
            }
        };

        fetchOrders();
    }, [isLogedIn]);

    // Handle canceling the order
    const handleCancelOrder = async (orderId: string) => {
        const payload: any = { orderId };  // Include order ID

        // Include token or guestId based on whether the user is logged in
        const guestId = localStorage.getItem('guest-id');
        if (isLogedIn) {
            payload.token = token;
        } else if (guestId) {
            payload.guestId = guestId;
        } else {
            alert("You must be logged in or have a guest ID to cancel the order.");
            return;
        }

        try {
            // Send request to the backend to cancel the order
            const req = await fetch(API_URL + '/order/reject.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const resp = await req.json();

            // Check if the request was successful
            if (req.ok && resp.success) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === orderId ? { ...order, status: 'rejected' } : order
                    )
                );
            } else {
                alert(resp.error || "Failed to cancel order.");
            }
        } catch (error: any) {
            alert("An error occurred while canceling the order: " + error.message);
        }
    };


    // Handle marking an order as received
    const handleReceivedOrder = async (orderId: string) => {
        const payload: any = { orderId };  // Include order ID

        // Include token or guestId based on whether the user is logged in
        const guestId = localStorage.getItem('guest-id');
        if (isLogedIn) {
            payload.token = token;
        } else if (guestId) {
            payload.guestId = guestId;
        } else {
            alert("You must be logged in or have a guest ID to mark the order as received.");
            return;
        }

        try {
            // Send request to the backend to mark the order as received
            const req = await fetch(API_URL + '/order/received.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const resp = await req.json();

            // Check if the request was successful
            if (req.ok && resp.success) {
                // On success, update the order status to 'received'
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === orderId ? { ...order, status: 'received' } : order
                    )
                );
            } else {
                alert(resp.error || "Failed to mark order as received.");
            }
        } catch (error: any) {
            alert("An error occurred while marking the order as received: " + error.message);
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 py-10">
            <div className="container mx-auto max-w-6xl">
                <Link href="/membership-check"><h1 className="text-2xl font-bold mb-6">B&M Restaurant Admin Dashboard</h1></Link>


                {/* Tabs Component */}
                <Tabs defaultValue="all-orders" className="w-full">

                    {/* Tabs Content */}
                    <TabsContent value="all-orders" className="mt-4">
                        <div className="space-y-4">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <Card key={order.id} className="bg-gray-800 border-gray-700">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                                                <Badge variant="outline" className="bg-yellow-600/20 text-yellow-400 border-yellow-600">
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
                                        <CardFooter className="flex justify-between flex-wrap pt-2 gap-4">
                                            {(
                                                <>
                                                    {(order.status == 'pending' || order.status == 'processing') && <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-900/20 border-red-800"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Cancel Order
                                                    </Button>}
                                                    {order.status === 'delivered' && <Button size="sm" onClick={() => handleReceivedOrder(order.id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        I Have Received This Order
                                                    </Button>}
                                                </>
                                            )}

                                            <div className="space-y-2">
                                                {order.status == 'pending' && (
                                                    <div className="text-white mt-3 w-full flex items-center">
                                                        <Clock className="mr-2 h-5 w-5" /> {/* Pending icon */}
                                                        <span>Order has been placed, waiting for the seller to accept the order.</span>
                                                    </div>
                                                )}

                                                {order.status == 'received' && (
                                                    <div className="text-green-500 mt-3 w-full flex items-center">
                                                        <CheckCircle className="mr-2 h-5 w-5" /> {/* Received icon */}
                                                        <span>Order has been received, waiting for the seller auto close the order.</span>
                                                    </div>
                                                )}

                                                {order.status == 'delivered' && (
                                                    <div className="text-green-500 mt-3 w-full flex items-center">
                                                        <CheckCircle className="mr-2 h-5 w-5" /> {/* Received icon */}
                                                        <span>Order has been received, click on the `i have received` to close order.</span>
                                                    </div>
                                                )}

                                                {order.status == 'processing' && (
                                                    <div className="text-gray-400 mt-3 w-full flex items-center">
                                                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> {/* Received icon */}
                                                        <span>Your order is being processing, you can cancel it before its ready.</span>
                                                    </div>
                                                )}

                                                {order.status == 'ready' && (
                                                    <div className="text-green-500 mt-3 w-full flex items-center">
                                                        <Truck className="mr-2 h-5 w-5" /> {/* Ready icon */}
                                                        <span>Order is ready and will be delivered to you shortly.</span>
                                                    </div>
                                                )}

                                                {order.status == 'rejected' && (
                                                    <div className="text-red-500 mt-3 w-full flex items-center">
                                                        <XCircle className="mr-2 h-5 w-5" /> {/* Rejected icon */}
                                                        <span>Order has been rejected.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardFooter>

                                    </Card>
                                ))
                            ) : (
                                <p>No orders available</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
