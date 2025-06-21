"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface StoreLink {
  name: string
  url: string
  price: string
  originalPrice?: string
  discount?: number
  icon: React.ReactNode
  color: string
}

interface StoreLinksProps {
  gameTitle: string
  stores: StoreLink[]
}

export function StoreLinks({ gameTitle, stores }: StoreLinksProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Where to Buy</CardTitle>
        <p className="text-sm text-gray-400">Compare prices across platforms</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {stores.map((store, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded ${store.color}`}>{store.icon}</div>
              <div>
                <div className="text-white font-medium">{store.name}</div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 font-bold">{store.price}</span>
                  {store.originalPrice && (
                    <>
                      <span className="text-gray-500 line-through text-sm">{store.originalPrice}</span>
                      {store.discount && <Badge className="bg-red-600 text-xs">-{store.discount}%</Badge>}
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Link href={store.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Buy
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
