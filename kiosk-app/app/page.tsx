import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <div className="text-center space-y-6 max-w-3xl px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to <span className="text-primary">B&M</span> Restaurant
        </h1>
        <p className="text-xl text-gray-400">Experience delicious food with our self-service kiosk system</p>
        <div className="pt-6">
          <Link href="/membership-check">
            <Button size="lg" className="text-lg px-8 py-6">
              Order Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

