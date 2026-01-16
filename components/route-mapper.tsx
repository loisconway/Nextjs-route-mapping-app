"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import {
  MapPin,
  Navigation,
  RotateCcw,
  Footprints,
  Route,
  Timer,
  Sun,
  Moon,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm">Loading map...</span>
      </div>
    </div>
  ),
})

export interface LatLng {
  lat: number
  lng: number
}

export default function RouteMapper() {
  const [startPoint, setStartPoint] = useState<LatLng | null>(null)
  const [endPoint, setEndPoint] = useState<LatLng | null>(null)
  const [startAddress, setStartAddress] = useState<string>("")
  const [endAddress, setEndAddress] = useState<string>("")
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; distanceKm: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [targetDistanceInput, setTargetDistanceInput] = useState<string>("")
  const [targetDistance, setTargetDistance] = useState<number | null>(null)
  const [paceMinutes, setPaceMinutes] = useState<string>("6")
  const [paceSeconds, setPaceSeconds] = useState<string>("00")
  const [targetPace, setTargetPace] = useState<number | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "RunRoutePlanner/1.0",
          },
        },
      )
      if (!response.ok) throw new Error("Geocoding failed")
      const data = await response.json()

      // Build a short, friendly address
      const addr = data.address
      const parts: string[] = []

      if (addr.road) parts.push(addr.road)
      if (addr.neighbourhood) parts.push(addr.neighbourhood)
      else if (addr.suburb) parts.push(addr.suburb)
      else if (addr.village) parts.push(addr.village)
      else if (addr.town) parts.push(addr.town)
      else if (addr.city) parts.push(addr.city)

      return parts.length > 0 ? parts.slice(0, 2).join(", ") : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  const handleMapClick = async (latlng: LatLng) => {
    if (!startPoint) {
      setStartPoint(latlng)
      setStartAddress("Loading...")
      setRouteInfo(null)
      const address = await reverseGeocode(latlng.lat, latlng.lng)
      setStartAddress(address)
    } else if (!endPoint) {
      setEndPoint(latlng)
      setEndAddress("Loading...")
      const address = await reverseGeocode(latlng.lat, latlng.lng)
      setEndAddress(address)
    }
  }

  const handleReset = () => {
    setStartPoint(null)
    setEndPoint(null)
    setStartAddress("")
    setEndAddress("")
    setRouteInfo(null)
    setTargetDistance(null)
    setTargetDistanceInput("")
    setTargetPace(null)
    setPaceMinutes("6")
    setPaceSeconds("00")
    setIsExpanded(true)
  }

  const handleApplyTargetDistance = () => {
    const parsed = Number.parseFloat(targetDistanceInput)
    if (!isNaN(parsed) && parsed > 0) {
      setTargetDistance(parsed)
    } else {
      setTargetDistance(null)
    }
  }

  const handleClearTargetDistance = () => {
    setTargetDistance(null)
    setTargetDistanceInput("")
  }

  const handleApplyTargetPace = () => {
    const mins = Number.parseInt(paceMinutes) || 0
    const secs = Number.parseInt(paceSeconds) || 0
    const totalMinutes = mins + secs / 60
    if (totalMinutes > 0) {
      setTargetPace(totalMinutes)
    } else {
      setTargetPace(null)
    }
  }

  const handleClearTargetPace = () => {
    setTargetPace(null)
    setPaceMinutes("6")
    setPaceSeconds("00")
  }

  const formatPace = (pace: number) => {
    const mins = Math.floor(pace)
    const secs = Math.round((pace - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getInstructions = () => {
    if (!startPoint && !endPoint) return "Click on the map to set your starting point"
    if (startPoint && !endPoint) return "Now click to set your destination"
    return "Route calculated! Click reset to plan a new route"
  }

  return (
    <div className="relative h-full w-full">
      <MapComponent
        startPoint={startPoint}
        endPoint={endPoint}
        targetDistance={targetDistance}
        targetPace={targetPace}
        isDarkMode={isDarkMode}
        onMapClick={handleMapClick}
        onRouteCalculated={setRouteInfo}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="bg-card/95 backdrop-blur-sm border border-border"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Header */}
 <div className="absolute top-4 left-4 right-16 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto z-[1000]">
  <Card className="bg-card/95 backdrop-blur-sm border-border px-4 py-3 md:px-6 max-w-[90%] md:max-w-[400px]">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
        <Footprints className="w-5 h-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="font-semibold text-foreground text-sm md:text-base">Run Route Planner</h1>
        <p className="text-xs text-muted-foreground"></p>
      </div>
    </div>
  </Card>
</div>

      <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80 z-[1000]">
        <Card className="bg-card/95 p-4 backdrop-blur-sm border-border overflow-hidden">
          {/* Collapsed Summary / Header - Always visible */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {routeInfo ? (
                <>
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-semibold text-foreground">{routeInfo.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{routeInfo.duration}</span>
                  </div>
                </>
              ) : isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Calculating...</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {!startPoint ? "Set start point" : "Set destination"}
                </span>
              )}
            </div>
            <div className="flex-shrink-0 ml-2">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="px-4 pb-4 space-y-3 border-t border-border">
              {/* Start Point */}
              <div className="flex items-center gap-3 pt-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Start Point</p>
                  <p className="text-sm text-foreground truncate">
                    {startPoint ? startAddress || "Loading..." : "Click on map to set"}
                  </p>
                </div>
              </div>

              {/* End Point */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="text-sm text-foreground truncate">
                    {endPoint
                      ? endAddress || "Loading..."
                      : startPoint
                        ? "Click on map to set"
                        : "Set start point first"}
                  </p>
                </div>
              </div>

              {startPoint && endPoint && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="w-4 h-4 text-primary" />
                    <Label htmlFor="targetDistance" className="text-xs text-muted-foreground">
                      Target Distance (km)
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      id="targetDistance"
                      type="number"
                      placeholder="e.g. 10"
                      value={targetDistanceInput}
                      onChange={(e) => setTargetDistanceInput(e.target.value)}
                      className="h-8 text-sm"
                      min="0"
                      step="0.5"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleApplyTargetDistance}
                      disabled={!targetDistanceInput || isLoading}
                      className="h-8"
                    >
                      Apply
                    </Button>
                    {targetDistance && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClearTargetDistance}
                        disabled={isLoading}
                        className="h-8 px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {targetDistance && routeInfo && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Target: {targetDistance} km | Actual: {routeInfo.distanceKm.toFixed(2)} km
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-2 mt-4">
                    <Timer className="w-4 h-4 text-primary" />
                    <Label className="text-xs text-muted-foreground">Target Pace (min:sec /km)</Label>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        placeholder="6"
                        value={paceMinutes}
                        onChange={(e) => setPaceMinutes(e.target.value)}
                        className="h-8 text-sm w-14 text-center"
                        min="0"
                        max="59"
                      />
                      <span className="text-muted-foreground font-medium">:</span>
                      <Input
                        type="number"
                        placeholder="00"
                        value={paceSeconds}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "" || (Number(val) >= 0 && Number(val) < 60)) {
                            setPaceSeconds(val)
                          }
                        }}
                        className="h-8 text-sm w-16 text-center"
                        min="0"
                        max="59"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleApplyTargetPace}
                      disabled={isLoading}
                      className="h-8"
                    >
                      Apply
                    </Button>
                    {targetPace && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClearTargetPace}
                        disabled={isLoading}
                        className="h-8 px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {targetPace && (
                    <p className="text-xs text-muted-foreground mt-2">Using pace: {formatPace(targetPace)} /km</p>
                  )}
                </div>
              )}

              {/* Route Info - detailed view when expanded */}
              {routeInfo && (
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="text-lg font-semibold text-primary">{routeInfo.distance}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-lg font-semibold text-foreground">{routeInfo.duration}</p>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Calculating route...</span>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <Button variant="secondary" className="w-full" onClick={handleReset} disabled={!startPoint && !endPoint}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Route
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
