/* type CartItem struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	VideoGame   *VideoGame `json:"videogame" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	VideoGameID uint       `json:"videogame_id"`
	IsPhysical  bool       `json:"is_physical"`
	Quantity    int        `json:"quantity"`
	CartID      uint       `json:"cart_id"`
} */

import { VideoGame } from "@/app/home/types"


export interface CartItem {
    id : number
    videogame : VideoGame
    videogame_id : number
    is_physical : boolean
    quantity : number
    cart_id : number
}