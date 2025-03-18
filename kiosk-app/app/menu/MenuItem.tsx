"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { BoxIcon, LogOutIcon, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/use-cart";
import { useMenu } from "@/hooks/useMenu";
import useAuth from "@/lib/useAuth";
import { API_URL } from "@/lib/base";
import { MenuCategory, MenuItem } from "@/lib/menu-data";
import { useRouter } from "next/navigation";

export default function MenuItems() {
  const { cartItems, addToCart } = useCart();
  const [isMember, setIsMember] = useState(false);
  const { menuItems } = useMenu();
  const { token, userType, logout, isLogedIn } = useAuth();
  const router = useRouter();

  const [loadingItemId, setLoadingItemId] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Function to call the cart API and add item
  async function addToTheCart(item: MenuItem) {
    const { id } = item;

    // Disable the button and show loading spinner
    setLoadingItemId(id); // Track the item being added
    setIsAddingToCart(true);

    try {
      if (isLogedIn) {
        const response = await fetch(API_URL + "/cart/add.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId: id,
            quantity: 1,
            token
          }),
        });

        if (response.ok) {
          addToCart(item);
        } else {
          alert("Failed to add item to cart.");
        }
      } else {
        addToCart(item);  // For guest users, just update local cart
      }
    } catch (error) {
      alert("Something went wrong, please try again.");
    } finally {
      // Reset the loading state
      setLoadingItemId(null);
      setIsAddingToCart(false);
    }
  }

  function handleLogout() {
    if (isLogedIn) {
      logout();
    } else {
      localStorage.removeItem('guest-id');
    }
    router.push('/membership-check');
  }

  useEffect(() => {
    setIsMember(isLogedIn && userType === "member");
  }, [isLogedIn, userType]);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center flex-wrap gap-5">
          <h1 className="text-xl font-bold">B&M Restaurant Menu</h1>
          <div className="flex items-center gap-4">
            {(userType === 'member' || localStorage.getItem('guest-id')) && (
              <>
                {isMember ? (
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary">
                    Membership User (20% Off)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-700 text-gray-400 border-gray-600">
                    Regular User
                  </Badge>
                )}
                <Link href="/cart">
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/orders" title="View All Orders">
                  <Button>
                    <BoxIcon className="h-5 w-5" />
                    My Orders
                  </Button>
                </Link>
                <Button onClick={handleLogout} title="logout" className="bg-red-400">
                  <LogOutIcon className="h-5 w-5" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.filter((category: MenuCategory) => category.items.length > 0).map((category: MenuCategory) => (
            <div key={category.id} className="space-y-4 py-4">
              <h2 className="text-xl font-bold border-b border-gray-700 pb-2">{category.name}</h2>
              <div className="space-y-4">
                {category.items.map((item: MenuItem) => (
                  <Card key={item.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{item.price}</p>
                          {isMember && <p className="text-xs text-primary">Member: ₹{(item.price * 0.8).toFixed(0)}</p>}
                        </div>
                      </div>
                    </CardContent>
                    {(userType === 'member' || localStorage.getItem('guest-id')) && <CardFooter className="p-4 pt-0">
                      <Button
                        onClick={() => addToTheCart(item)}
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        disabled={loadingItemId === item.id || isAddingToCart} // Disable button while adding
                      >
                        {loadingItemId === item.id ? "Adding..." : "Add to Cart"}
                      </Button>
                    </CardFooter>}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {(userType === 'member' || localStorage.getItem('guest-id')) && <div className="fixed bottom-4 right-4">
        <Link href="/cart">
          <Button className="flex items-center gap-2" disabled={cartItemCount === 0}>
            <ShoppingCart className="h-5 w-5" />
            View Cart ({cartItemCount})
          </Button>
        </Link>
      </div>}
    </div>
  );
}
