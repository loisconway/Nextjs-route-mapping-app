"use client"

import dynamic from "next/dynamic"
import { useRouteState } from "./route-mapper/useRouteState"
import { ThemeToggle } from "./route-mapper/ThemeToggle"
import { Header } from "./route-mapper/Header"
import { RouteControls } from "./route-mapper/RouteControls"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
})

export default function RouteMapper() {
  const route = useRouteState()

  return (
    <div className="relative h-full w-full">
      <MapComponent
        startPoint={route.startPoint}
        endPoint={route.endPoint}
        waypoints={route.waypoints}
        targetDistance={route.targetDistance}
        targetPace={route.targetPace}
        isDarkMode={route.isDarkMode}
        isAddingWaypoint={route.isAddingWaypoint}
        onMapClick={route.handleMapClick}
        onRouteCalculated={route.setRouteInfo}
        isLoading={route.isLoading}
        setIsLoading={route.setIsLoading}
      />

      <ThemeToggle
        isDarkMode={route.isDarkMode}
        onToggle={() => route.setIsDarkMode(!route.isDarkMode)}
      />

      <Header />

      <RouteControls
        startPoint={route.startPoint}
        endPoint={route.endPoint}
        startAddress={route.startAddress}
        endAddress={route.endAddress}
        waypoints={route.waypoints}
        draggedWaypointId={route.draggedWaypointId}
        isAddingWaypoint={route.isAddingWaypoint}
        routeInfo={route.routeInfo}
        isExpanded={route.isExpanded}
        isLoading={route.isLoading}
        targetDistanceInput={route.targetDistanceInput}
        targetDistance={route.targetDistance}
        paceMinutes={route.paceMinutes}
        paceSeconds={route.paceSeconds}
        targetPace={route.targetPace}
        onToggleExpand={() => route.setIsExpanded(!route.isExpanded)}
        onToggleWaypointMode={() => route.setIsAddingWaypoint(!route.isAddingWaypoint)}
        onRemoveWaypoint={route.handleRemoveWaypoint}
        onDragStart={route.handleDragStart}
        onDragOver={route.handleDragOver}
        onDrop={route.handleDrop}
        onDragEnd={route.handleDragEnd}
        onReset={route.handleReset}
        onApplyTargetDistance={route.handleApplyTargetDistance}
        onClearTargetDistance={route.handleClearTargetDistance}
        onApplyTargetPace={route.handleApplyTargetPace}
        onClearTargetPace={route.handleClearTargetPace}
        formatPace={route.formatPace}
        onTargetDistanceInputChange={route.setTargetDistanceInput}
        onPaceMinutesChange={route.setPaceMinutes}
        onPaceSecondsChange={route.setPaceSeconds}
      />
    </div>
  )
}
