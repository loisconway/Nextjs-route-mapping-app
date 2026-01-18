'use client';

import React from "react"

import { useState, useEffect } from "react"
import { LatLng, Waypoint } from "./types"
import { useGeocoding } from "./useGeocoding"

export const useRouteState = () => {
  const { reverseGeocode } = useGeocoding()

  const [startPoint, setStartPoint] = useState<LatLng | null>(null)
  const [endPoint, setEndPoint] = useState<LatLng | null>(null)
  const [startAddress, setStartAddress] = useState("")
  const [endAddress, setEndAddress] = useState("")
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{
    distance: string
    duration: string
    distanceKm: number
  } | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [draggedWaypointId, setDraggedWaypointId] = useState<string | null>(null)

  // Target distance state
  const [targetDistanceInput, setTargetDistanceInput] = useState<string>("")
  const [targetDistance, setTargetDistance] = useState<number | null>(null)

  // Target pace state - default to 6:00 min/km
  const [paceMinutes, setPaceMinutes] = useState<string>("6")
  const [paceSeconds, setPaceSeconds] = useState<string>("00")
  const [targetPace, setTargetPace] = useState<number | null>(6)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const handleMapClick = async (latlng: LatLng) => {
    if (!startPoint) {
      setStartPoint(latlng)
      setStartAddress("Loading...")
      setRouteInfo(null)
      setStartAddress(await reverseGeocode(latlng.lat, latlng.lng))
    } else if (!endPoint) {
      setEndPoint(latlng)
      setEndAddress("Loading...")
      setEndAddress(await reverseGeocode(latlng.lat, latlng.lng))
    } else if (isAddingWaypoint) {
      const newWaypoint: Waypoint = {
        id: `wp-${Date.now()}`,
        position: latlng,
        address: "Loading...",
      }

      setWaypoints(prev => [...prev, newWaypoint])
      setIsAddingWaypoint(false)

      const address = await reverseGeocode(latlng.lat, latlng.lng)
      setWaypoints(prev =>
        prev.map(wp => (wp.id === newWaypoint.id ? { ...wp, address } : wp))
      )
    }
  }

  const handleRemoveWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id))
  }

  const handleReset = () => {
    setStartPoint(null)
    setEndPoint(null)
    setStartAddress("")
    setEndAddress("")
    setWaypoints([])
    setIsAddingWaypoint(false)
    setRouteInfo(null)
    setTargetDistance(null)
    setTargetDistanceInput("")
    setTargetPace(6)
    setPaceMinutes("6")
    setPaceSeconds("00")
    setIsExpanded(true)
  }

  const handleApplyTargetDistance = () => {
    const distance = parseFloat(targetDistanceInput)
    if (!isNaN(distance) && distance > 0) {
      setTargetDistance(distance)
    }
  }

  const handleClearTargetDistance = () => {
    setTargetDistance(null)
    setTargetDistanceInput("")
  }

  const handleApplyTargetPace = () => {
    const mins = parseInt(paceMinutes) || 0
    const secs = parseInt(paceSeconds) || 0
    const totalMinutes = mins + secs / 60
    if (totalMinutes > 0) {
      setTargetPace(totalMinutes)
    }
  }

  const handleClearTargetPace = () => {
    setTargetPace(6)
    setPaceMinutes("6")
    setPaceSeconds("00")
  }

  const formatPace = (pace: number): string => {
    const mins = Math.floor(pace)
    const secs = Math.round((pace - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWaypointId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedWaypointId || draggedWaypointId === targetId) {
      setDraggedWaypointId(null)
      return
    }

    setWaypoints((prev) => {
      const draggedIndex = prev.findIndex((wp) => wp.id === draggedWaypointId)
      const targetIndex = prev.findIndex((wp) => wp.id === targetId)
      if (draggedIndex === -1 || targetIndex === -1) return prev

      const newWaypoints = [...prev]
      const [draggedItem] = newWaypoints.splice(draggedIndex, 1)
      newWaypoints.splice(targetIndex, 0, draggedItem)
      return newWaypoints
    })
    setDraggedWaypointId(null)
  }

  const handleDragEnd = () => {
    setDraggedWaypointId(null)
  }

  return {
    startPoint,
    endPoint,
    startAddress,
    endAddress,
    waypoints,
    isAddingWaypoint,
    routeInfo,
    isLoading,
    isDarkMode,
    isExpanded,
    draggedWaypointId,
    targetDistanceInput,
    targetDistance,
    paceMinutes,
    paceSeconds,
    targetPace,

    setIsDarkMode,
    setIsExpanded,
    setIsLoading,
    setRouteInfo,
    setIsAddingWaypoint,
    setDraggedWaypointId,
    setWaypoints,
    setTargetDistanceInput,
    setPaceMinutes,
    setPaceSeconds,

    handleMapClick,
    handleRemoveWaypoint,
    handleReset,
    handleApplyTargetDistance,
    handleClearTargetDistance,
    handleApplyTargetPace,
    handleClearTargetPace,
    formatPace,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  }
}
