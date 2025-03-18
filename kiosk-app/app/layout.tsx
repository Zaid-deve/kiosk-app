import type React from "react"
import { CartProvider } from "@/lib/use-cart"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


export const metadata = {
  generator: 'v0.dev'
};
