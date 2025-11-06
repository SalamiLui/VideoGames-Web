import { VideoGame } from "@/app/home/types";
/* type OrderItem struct {
	ID             uint       `json:"id" gorm:"primaryKey"`
	VideoGame      *VideoGame `json:"videogame" gorm:"constraint:OnUpdate:CASCADE;"`
	VideoGameID    uint       `json:"videogame_id"`
	Quantity       int        `json:"quantity"`
	CDkey          []*CDKey   `json:"cdkey" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	OrderOwnerID   uint
	OrderOwnerType string // "phy_orders" o "dig_orders"
}
 */

export interface OrderItem {
    id : number
    videogame : VideoGame
    videogame_id : number
    quantity : number
    cdkey : CDKey[]

}

/* type CDKey struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	VideoGame   *VideoGame `json:"videogame" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	VideoGameID uint       `json:"videogame_id"`
	Key         string     `json:"key" gorm:"unique"`
	State       string     `json:"state"` // available, reserved, sold
	OrderItemID uint       `json:"order_item_id"`
} */

export interface CDKey {
    id :  number
    state : string
    order_item_id : number
}


interface Props {
    orderItem : OrderItem

}

export default function OrderItemCard({orderItem}: Props) {
  return (
    <div
      className="
        p-4 rounded-md bg-neutral-950/90 border border-neutral-800
        shadow-[0_0_6px_rgba(0,0,0,0.7)]
        transition relative group select-none
        hover:border-red-700/40 hover:shadow-[0_0_10px_rgba(160,0,0,0.25)]
      "
    >
      {/* glitch overlay */}
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-[0.10]
          pointer-events-none mix-blend-screen
          bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.12),transparent)]
          animate-[glitch_0.18s_ease-in-out]
        "
      ></div>

      <p className="text-gray-200 text-sm">
        <span className="text-red-600/50">Title:</span> {orderItem.videogame.title}
      </p>

      <p className="text-gray-300 text-sm">
        <span className="text-red-600/50">Quantity:</span> {orderItem.quantity}
      </p>

      <p className="text-gray-300 text-sm">
        <span className="text-red-600/50">Price:</span> ${orderItem.videogame.price}
      </p>
    </div>
  );
}


