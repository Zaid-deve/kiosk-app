"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import useAuth from "./useAuth"
import { API_URL } from "./base"

export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  categoryId: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: any) => void
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void,
  clearUserCart: () => void
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => { },
  updateQuantity: () => { },
  removeFromCart: () => { },
  clearCart: () => { },
  clearUserCart: () => { }
})

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { userType, isLogedIn, token } = useAuth();

  // Load cart from localStorage on initial render
  useEffect(() => {

    // get member cart items
    if (isLogedIn && userType == 'member') {
      setCartItems([]);
      (async () => {
        try {
          const req = await fetch(API_URL + '/cart/fetch.php', {
            method: 'POST',
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token })
          });

          // data
          const result = await req.json();

          // resp
          if (req.ok) {
            let cart = result.cart_items || [];
            cart = cart.map((ci: CartItem) => {
              return {
                ...ci,
                quantity: Number(ci.quantity),
                price: Number(ci.price)
              }
            })
            setCartItems(cart);
            return;
          }

          throw new Error(result.error || 'Failed to load card items !');
        } catch (error: any) {
          alert(error.message);
        }
      })()
    } else {
      const cart = localStorage.getItem('cart') || "[]";
      setCartItems(JSON.parse(cart) || []);
    }

  }, [isLogedIn])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLogedIn) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  }, [cartItems])

  const addToCart = (item: any) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)

      if (existingItem) {
        return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      } else {
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = async (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const clearCart = async () => {
    if (isLogedIn) {
      try {
        const req = await fetch(API_URL + '/cart/clear.php', {
          method: "POST",
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const res = await req.json();
        if (!res.ok && res.error) {
          throw new Error(res.error);
        }

      } catch (error: any) {
        alert(error.message);
        return;
      }
    }

    // clear cart
    setCartItems([])
  }

  const clearUserCart = () => {
    setCartItems([])
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearUserCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

