export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export const menuItems: MenuCategory[] = [
  {
    id: "starters",
    name: "Starters",
    items: [
      {
        id: "item-1",
        name: "Paneer Tikka",
        description: "Marinated cottage cheese grilled to perfection",
        price: 250,
        categoryId: "starters",
      },
      {
        id: "item-2",
        name: "Veg Spring Rolls",
        description: "Crispy rolls filled with vegetables",
        price: 180,
        categoryId: "starters",
      },
      {
        id: "item-3",
        name: "Manchurian",
        description: "Fried vegetable balls in spicy sauce",
        price: 220,
        categoryId: "starters",
      },
    ],
  },
  {
    id: "main-course",
    name: "Main Course",
    items: [
      {
        id: "item-4",
        name: "Butter Chicken",
        description: "Tender chicken in rich tomato and butter gravy",
        price: 350,
        categoryId: "main-course",
      },
      {
        id: "item-5",
        name: "Paneer Butter Masala",
        description: "Cottage cheese in creamy tomato gravy",
        price: 280,
        categoryId: "main-course",
      },
      {
        id: "item-6",
        name: "Dal Makhani",
        description: "Black lentils cooked overnight with butter and cream",
        price: 240,
        categoryId: "main-course",
      },
    ],
  },
  {
    id: "breads",
    name: "Breads",
    items: [
      {
        id: "item-7",
        name: "Butter Naan",
        description: "Soft bread baked in tandoor and brushed with butter",
        price: 60,
        categoryId: "breads",
      },
      {
        id: "item-8",
        name: "Garlic Roti",
        description: "Whole wheat bread with garlic flavor",
        price: 50,
        categoryId: "breads",
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    items: [
      {
        id: "item-9",
        name: "Gulab Jamun",
        description: "Deep-fried milk solids soaked in sugar syrup",
        price: 120,
        categoryId: "desserts",
      },
      {
        id: "item-10",
        name: "Ice Cream",
        description: "Choice of vanilla, chocolate, or strawberry",
        price: 150,
        categoryId: "desserts",
      },
    ],
  },
  {
    id: "beverages",
    name: "Beverages",
    items: [
      {
        id: "item-11",
        name: "Masala Chai",
        description: "Indian spiced tea",
        price: 80,
        categoryId: "beverages",
      },
      {
        id: "item-12",
        name: "Fresh Lime Soda",
        description: "Refreshing lime soda, sweet or salted",
        price: 100,
        categoryId: "beverages",
      },
    ],
  },
]

