'use client';

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Navigation,
  RotateCcw,
  Route,
  Timer,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  CircleDot,
  GripVertical,
} from "lucide-react"

import { LatLng, Waypoint } from "./types"

interface RouteControlsProps {
  startPoint: LatLng | null
  endPoint: LatLng | null
  startAddress: string
  endAddress: string
  waypoints: Waypoint[]
  draggedWaypointId: string | null
  isAddingWaypoint: boolean
  routeInfo: { distance: string; duration: string; distanceKm: number } | null
  isExpanded: boolean
  isLoading: boolean
  targetDistanceInput: string
  targetDistance: number | null
  paceMinutes: string
  paceSeconds: string
  targetPace: number | null
  onToggleExpand: () => void
  onToggleWaypointMode: () => void
  onRemoveWaypoint: (id: string) => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onReset: () => void
  onApplyTargetDistance: () => void
  onClearTargetDistance: () => void
  onApplyTargetPace: () => void
  onClearTargetPace: () => void
  formatPace: (pace: number) => string
  onTargetDistanceInputChange: (value: string) => void
  onPaceMinutesChange: (value: string) => void
  onPaceSecondsChange: (value: string) => void
}

export const RouteControls: React.FC<RouteControlsProps> = ({
  startPoint,
  endPoint,
  startAddress,
  endAddress,
  waypoints,
  draggedWaypointId,
  isAddingWaypoint,
  routeInfo,
  isExpanded,
  isLoading,
  targetDistanceInput,
  targetDistance,
  paceMinutes,
  paceSeconds,
  targetPace,
  onToggleExpand,
  onToggleWaypointMode,
  onRemoveWaypoint,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onReset,
  onApplyTargetDistance,
  onClearTargetDistance,
  onApplyTargetPace,
  onClearTargetPace,
  formatPace,
  onTargetDistanceInputChange,
  onPaceMinutesChange,
  onPaceSecondsChange,
}) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 md:w-80 z-[1000]">
      <Card className="bg-card/95 p-4 backdrop-blur-sm border-border overflow-hidden">

        {/* Collapsed / Expand Header */}
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between hover:bg-muted/50 transition-colors px-2 py-1"
        >
          <span className="text-sm font-medium">
            Route Details
          </span>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>

        {/* Collapsed summary */}
        {!isExpanded && routeInfo && (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            {routeInfo.distance} • {routeInfo.duration}
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-3 mt-2">

            {/* Start / End */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <div className="text-sm truncate">{startPoint ? startAddress || "Loading..." : "Click map to set start"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-rose-400" />
                <div className="text-sm truncate">{endPoint ? endAddress || "Loading..." : startPoint ? "Click map to set end" : "Set start first"}</div>
              </div>
            </div>

            {/* Waypoints */}
            {startPoint && endPoint && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-muted-foreground">Waypoints</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isAddingWaypoint ? "default" : "outline"}
                    onClick={onToggleWaypointMode}
                    disabled={isLoading}
                    className="h-7 text-xs"
                  >
                    {isAddingWaypoint ? (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>

                {isAddingWaypoint && (
                  <p className="text-xs text-amber-400 mb-2">Click map to add a waypoint</p>
                )}

                {waypoints.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {waypoints.map((wp, idx) => (
                      <div
                        key={wp.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, wp.id)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, wp.id)}
                        onDragEnd={onDragEnd}
                        className={`flex items-center gap-2 bg-muted/30 rounded-md px-2 py-1.5 cursor-grab active:cursor-grabbing transition-opacity ${
                          draggedWaypointId === wp.id ? "opacity-50" : ""
                        }`}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-amber-400">{idx + 1}</span>
                        </div>
                        <span className="text-xs text-foreground truncate flex-1">{wp.address}</span>
                        <button onClick={() => onRemoveWaypoint(wp.id)} className="text-muted-foreground hover:text-rose-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : !isAddingWaypoint && <p className="text-xs text-muted-foreground">No waypoints added</p>}
              </div>
            )}

            {/* Target Distance */}
            {startPoint && endPoint && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 mb-1">
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
                    onChange={(e) => onTargetDistanceInputChange(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="secondary" onClick={onApplyTargetDistance} className="h-8">
                    Apply
                  </Button>
                  {targetDistance && (
                    <Button size="sm" variant="ghost" onClick={onClearTargetDistance} className="h-8 px-2">
                      Clear
                    </Button>
                  )}
                </div>
                {targetDistance && routeInfo && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {targetDistance} km | Actual: {routeInfo.distanceKm.toFixed(2)} km
                  </p>
                )}
              </div>
            )}

            {/* Target Pace */}
            {startPoint && endPoint && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="w-4 h-4 text-primary" />
                  <Label className="text-xs text-muted-foreground">Target Pace (min:sec /km)</Label>
                </div>
                <div className="flex gap-2 items-center">
                  <Input type="number" value={paceMinutes} onChange={(e) => onPaceMinutesChange(e.target.value)} className="h-8 text-sm w-14 text-center" />
                  <span className="text-muted-foreground font-medium">:</span>
                  <Input type="number" value={paceSeconds} onChange={(e) => onPaceSecondsChange(e.target.value)} className="h-8 text-sm w-16 text-center" />
                  <Button size="sm" variant="secondary" onClick={onApplyTargetPace} className="h-8">Apply</Button>
                  {targetPace && <Button size="sm" variant="ghost" onClick={onClearTargetPace} className="h-8 px-2">Clear</Button>}
                </div>
                {targetPace && <p className="text-xs text-muted-foreground mt-1">Using pace: {formatPace(targetPace)} /km</p>}
              </div>
            )}

            {/* Detailed Route Info */}
            {routeInfo && (
              <div className="pt-2 border-t border-border flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-lg font-semibold text-primary">{routeInfo.distance}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-lg font-semibold text-foreground">{routeInfo.duration}</p>
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="pt-2 border-t border-border flex items-center justify-center gap-2 py-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Calculating route...</span>
              </div>
            )}

            {/* Reset Button */}
            <Button variant="secondary" className="w-full" onClick={onReset} disabled={!startPoint && !endPoint}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset Route
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
