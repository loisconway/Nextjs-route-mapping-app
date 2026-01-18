export interface LatLng {
  lat: number
  lng: number
}

export interface Waypoint {
  id: string
  position: LatLng
  address: string
}
