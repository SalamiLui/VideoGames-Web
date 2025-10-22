
// types/game.ts
export interface Genre {
  id: number
  name: string
}

export interface Platform {
  id: number
  name: string
}

export interface Label {
  id: number
  name: string
}

export interface VideoGame {
  id: number
  title: string
  genre?: Genre[]
  platform?: Platform[]
  release_year?: number
  developer?: string
  label?: Label[]
  price: number
  synopsis?: string
  phy_stock?: number
  dig_stock?: number
  pegi?: number
  min_req?: string
  rating: number
  image_url?: string
}