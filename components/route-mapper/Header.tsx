import { Footprints } from "lucide-react"
import { Card } from "@/components/ui/card"

export const Header = () => (
  <div className="absolute top-4 left-6 right-16 md:left-1/2 md:-translate-x-1/2 z-[1000]">
    <Card className="bg-card/95 backdrop-blur-sm border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <Footprints className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="font-semibold text-foreground text-sm">Run Route Planner</h1>
      </div>
    </Card>
  </div>
)
