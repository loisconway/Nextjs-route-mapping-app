"use client"

import { useEffect, useRef, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { LatLng, Waypoint } from "./route-mapper"

// Leaflet for maps https://leafletjs.com/examples.html

interface MapComponentProps {
  startPoint: LatLng | null
  endPoint: LatLng | null
  waypoints: Waypoint[]
  targetDistance: number | null
  targetPace: number | null
  isDarkMode: boolean
  isAddingWaypoint: boolean
  onMapClick: (latlng: LatLng) => void
  onRouteCalculated: (info: { distance: string; duration: string; distanceKm: number } | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const createIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

const startIcon = createIcon("#10b981")
const endIcon = createIcon("#f43f5e")

const createNumberedWaypointIcon = (number: number) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: #f59e0b;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      ">${number}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const waypointIcon = createIcon("#3b82f6") // Declare waypointIcon here

export default function MapComponent({
  startPoint,
  endPoint,
  waypoints,
  targetDistance,
  targetPace,
  isDarkMode,
  isAddingWaypoint,
  onMapClick,
  onRouteCalculated,
  setIsLoading,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const startMarkerRef = useRef<L.Marker | null>(null)
  const endMarkerRef = useRef<L.Marker | null>(null)
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const waypointMarkersRef = useRef<L.Marker[]>([]) 
  const tileLayerRef = useRef<L.TileLayer | null>(null) 


  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [51.5074, -0.1278], // London
      zoom: 13,
      zoomControl: false,
    })

    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: "topleft" }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return

    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

    tileLayerRef.current.setUrl(tileUrl)
  }, [isDarkMode])

  // Handle map clicks
  useEffect(() => {
    if (!mapRef.current) return

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }

    mapRef.current.on("click", handleClick)

    return () => {
      mapRef.current?.off("click", handleClick)
    }
  }, [onMapClick])

  // Update start marker
  useEffect(() => {
    // Always clear existing marker first
    if (startMarkerRef.current) {
      startMarkerRef.current.remove()
      startMarkerRef.current = null
    }

    // Only add new marker if we have a map and a start point
    if (mapRef.current && startPoint) {
      startMarkerRef.current = L.marker([startPoint.lat, startPoint.lng], {
        icon: startIcon,
      })
        .addTo(mapRef.current)
        .bindPopup("Start Point")
    }
  }, [startPoint])

  // Update end marker
  useEffect(() => {
    // Always clear existing marker first
    if (endMarkerRef.current) {
      endMarkerRef.current.remove()
      endMarkerRef.current = null
    }

    // Only add new marker if we have a map and an end point
    if (mapRef.current && endPoint) {
      endMarkerRef.current = L.marker([endPoint.lat, endPoint.lng], {
        icon: endIcon,
      })
        .addTo(mapRef.current)
        .bindPopup("Destination")
    }
  }, [endPoint])

  // Update manual waypoint markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing waypoint markers
    waypointMarkersRef.current.forEach((marker) => marker.remove())
    waypointMarkersRef.current = []

    // Add new waypoint markers with numbered icons
    waypoints.forEach((wp, index) => {
      const marker = L.marker([wp.position.lat, wp.position.lng], {
        icon: createNumberedWaypointIcon(index + 1),
      })
        .addTo(mapRef.current!)
        .bindPopup(`Waypoint ${index + 1}: ${wp.address}`)
      waypointMarkersRef.current.push(marker)
    })
  }, [waypoints])

/**
 * The current algorithm for working out the extended distance involves zig-zagging perpendicular to the route, it sometimes comes up with some very strange ideas lol
 * Needs work generally
 * Some ideas:
 * - Is it possible to access strava common routes api and use this to assist? 
 * - Start/end point the same and create a loop of certain distance 
 * - Look into if there are existing route optimisation algorithms you could use
 */
  const generateExtendedWaypoints = useCallback(
    (start: LatLng, end: LatLng, directDistanceKm: number, targetKm: number): LatLng[] => {
      // Calculate how much we need to extend the route
      // Foot routes are typically ~1.3x direct distance, so we account for that
      const estimatedRouteRatio = 1.3
      const currentEstimatedRouteKm = directDistanceKm * estimatedRouteRatio

      if (targetKm <= currentEstimatedRouteKm * 1.1) {
        // Target is close to direct route, no extension needed
        return []
      }

      // Calculate extension factor needed
      const extensionFactor = targetKm / currentEstimatedRouteKm

      // Generate waypoints in a loop pattern perpendicular to the main path
      const waypoints: LatLng[] = []
      const midLat = (start.lat + end.lat) / 2
      const midLng = (start.lng + end.lng) / 2

      // Direction perpendicular to start-end line
      const dx = end.lng - start.lng
      const dy = end.lat - start.lat
      const perpDx = -dy
      const perpDy = dx
      const perpLength = Math.sqrt(perpDx * perpDx + perpDy * perpDy)

      // Normalize perpendicular vector
      const normPerpDx = perpDx / perpLength
      const normPerpDy = perpDy / perpLength

      // Calculate offset distance based on how much we need to extend
      // Rough approximation: each km of offset adds ~2km to route
      const neededExtraKm = targetKm - currentEstimatedRouteKm
      const offsetKm = neededExtraKm / 4 // Divide by 4 because we go out and back on both sides

      // Convert km to degrees (rough approximation at London latitude)
      const kmToDegrees = 0.009 // ~1km ≈ 0.009 degrees at 51°N
      const offsetDegrees = offsetKm * kmToDegrees

      // Create a detour pattern: go to one side, then the other
      // Point 1: 25% along path, offset to one side
      waypoints.push({
        lat: start.lat + (end.lat - start.lat) * 0.25 + normPerpDy * offsetDegrees,
        lng: start.lng + (end.lng - start.lng) * 0.25 + normPerpDx * offsetDegrees,
      })

      // Point 2: 50% along path, offset to other side
      waypoints.push({
        lat: midLat - normPerpDy * offsetDegrees,
        lng: midLng - normPerpDx * offsetDegrees,
      })

      // Point 3: 75% along path, offset to first side again
      waypoints.push({
        lat: start.lat + (end.lat - start.lat) * 0.75 + normPerpDy * offsetDegrees * 0.5,
        lng: start.lng + (end.lng - start.lng) * 0.75 + normPerpDx * offsetDegrees * 0.5,
      })

      return waypoints
    },
    [],
  )

  // Calculate route when both points are set
  const calculateRoute = useCallback(async () => {
    if (!mapRef.current || !startPoint || !endPoint) return

    // Clear previous route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    setIsLoading(true)

    try {
      const R = 6371 // Earth radius in km
      const dLat = ((endPoint.lat - startPoint.lat) * Math.PI) / 180
      const dLng = ((endPoint.lng - startPoint.lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((startPoint.lat * Math.PI) / 180) *
          Math.cos((endPoint.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const directDistanceKm = R * c

      // Combine manual waypoints with auto-generated ones for target distance
      let allWaypoints: LatLng[] = waypoints.map((wp) => wp.position)

      // If target distance is set, add generated waypoints
      if (targetDistance && targetDistance > 0) {
        const generatedWaypoints = generateExtendedWaypoints(startPoint, endPoint, directDistanceKm, targetDistance)
        // Insert generated waypoints between manual ones (simplified: just append)
        allWaypoints = [...allWaypoints, ...generatedWaypoints]
      }

      let coordinatesString = `${startPoint.lng},${startPoint.lat}`
      allWaypoints.forEach((wp) => {
        coordinatesString += `;${wp.lng},${wp.lat}`
      })
      coordinatesString += `;${endPoint.lng},${endPoint.lat}`

      // For route finding: https://project-osrm.org/ Modern C++ routing engine for shortest paths in road networks.

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`,
      )

      if (!response.ok) throw new Error("Route calculation failed")

      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as L.LatLngTuple,
        )

        // Draw route
        routeLayerRef.current = L.polyline(coordinates, {
          color: "#eab308",
          weight: 4,
          opacity: 0.8,
        }).addTo(mapRef.current!)

        // Fit map to route bounds
        const bounds = routeLayerRef.current.getBounds()
        mapRef.current!.fitBounds(bounds, { padding: [50, 50] })

        // Calculate distance and duration
        const distanceKm = route.distance / 1000
        const distanceText = distanceKm < 1 ? `${Math.round(route.distance)} m` : `${distanceKm.toFixed(2)} km`

        const paceMinPerKm = targetPace ?? 6
        const durationMinutes = Math.round(distanceKm * paceMinPerKm)
        const durationText =
          durationMinutes < 60
            ? `${durationMinutes} min`
            : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`

        onRouteCalculated({
          distance: distanceText,
          duration: durationText,
          distanceKm: distanceKm,
        })
      }
    } catch (error) {
      console.error("Route calculation error:", error)
      onRouteCalculated(null)
    } finally {
      setIsLoading(false)
    }
  }, [startPoint, endPoint, waypoints, targetDistance, targetPace, onRouteCalculated, setIsLoading, generateExtendedWaypoints])

  useEffect(() => {
    if (startPoint && endPoint) {
      calculateRoute()
    } else {
      // Clear route when points are reset
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }
      onRouteCalculated(null)
    }
  }, [startPoint, endPoint, waypoints, targetDistance, targetPace, calculateRoute, onRouteCalculated])

  return <div ref={mapContainerRef} className="h-full w-full" style={{ background: "#1a1a2e" }} />
}
