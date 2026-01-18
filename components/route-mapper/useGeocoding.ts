/** In order to be able to get addresses of locations rather than lat/long,
 * I use reverse Geocode to fetch the address details.
 */

export const useGeocoding = () => {
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "User-Agent": "RunRoutePlanner/1.0" } }
      )

      if (!response.ok) throw new Error("Geocoding failed")

      const data = await response.json()
      const addr = data.address
      const parts: string[] = []

      if (addr.road) parts.push(addr.road)
      if (addr.neighbourhood) parts.push(addr.neighbourhood)
      else if (addr.suburb) parts.push(addr.suburb)
      else if (addr.village) parts.push(addr.village)
      else if (addr.town) parts.push(addr.town)
      else if (addr.city) parts.push(addr.city)

      return parts.length > 0
        ? parts.slice(0, 2).join(", ")
        : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  return { reverseGeocode }
}
