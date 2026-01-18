import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export const ThemeToggle = ({ isDarkMode, onToggle }: any) => (
  <div className="absolute top-4 right-4 z-[1000]">
    <Button
      variant="secondary"
      size="icon"
      onClick={onToggle}
      className="bg-card/95 backdrop-blur-sm border border-border"
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  </div>
)
