import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateOrderNumber() {
  const prefix = "B&M"
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${randomNum}`
}

