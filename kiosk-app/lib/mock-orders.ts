export interface OrderItem {
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  timestamp: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "ready" | "completed" | "rejected" | "received" | "delivered"
}

export const mockOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "B&M-1001",
    timestamp: "2023-03-11 12:30 PM",
    items: [
      { name: "Butter Chicken", price: 350, quantity: 1 },
      { name: "Butter Naan", price: 60, quantity: 2 },
      { name: "Fresh Lime Soda", price: 100, quantity: 2 },
    ],
    total: 670,
    status: "pending",
  },
  {
    id: "order-2",
    orderNumber: "B&M-1002",
    timestamp: "2023-03-11 12:45 PM",
    items: [
      { name: "Paneer Butter Masala", price: 280, quantity: 1 },
      { name: "Garlic Roti", price: 50, quantity: 3 },
      { name: "Masala Chai", price: 80, quantity: 2 },
    ],
    total: 540,
    status: "processing",
  },
  {
    id: "order-3",
    orderNumber: "B&M-1003",
    timestamp: "2023-03-11 1:00 PM",
    items: [
      { name: "Paneer Tikka", price: 250, quantity: 1 },
      { name: "Dal Makhani", price: 240, quantity: 1 },
      { name: "Butter Naan", price: 60, quantity: 2 },
      { name: "Gulab Jamun", price: 120, quantity: 1 },
    ],
    total: 730,
    status: "completed",
  },
]

