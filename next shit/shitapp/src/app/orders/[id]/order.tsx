
import { DigOrder } from "./page";
import { PhyOrder } from "./page";
import { OrderItem } from "./orderItem";

interface DigOProps {
    digOrder : DigOrder
}

export function DigOrderCard({ digOrder }: DigOProps) {
  return (
    <div
      className="
        p-4 rounded-md
        bg-neutral-950/95
        border border-neutral-900
        shadow-[0_0_8px_rgba(0,0,0,0.7)]
        transition-all duration-150
        group
        hover:border-red-700/40
        hover:shadow-[0_0_12px_rgba(160,0,0,0.35)]
      "
    >
      {/* glitch aura */}
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-15
          pointer-events-none
          mix-blend-screen
          animate-[glitch_0.18s_ease-in-out]
          bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.12),transparent)]
        "
      />

      <p className="text-gray-300">
        <span className="text-red-600/60">Games:</span> {getFirst3Videogames(digOrder.order_items)}
      </p>
      <p className="text-gray-300">
        <span className="text-red-600/60">Price:</span> {digOrder.total_price}
      </p>
      <p className="text-gray-300">
        <span className="text-red-600/60">Status:</span> {digOrder.status}
      </p>

      {/* subtle digital flicker */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-5 bg-[url('/static/noise.png')]"></div>
    </div>
  );
}



interface PhyOProps {
    phyOrder : PhyOrder
}

export function PhyOrderCard({phyOrder} : PhyOProps){

  return (
    <div
      className="
        p-4 rounded-md
        bg-neutral-950/95
        border border-neutral-900
        shadow-[0_0_8px_rgba(0,0,0,0.7)]
        transition-all duration-150
        group
        hover:border-red-700/40
        hover:shadow-[0_0_12px_rgba(160,0,0,0.35)]
      "
    >
      {/* glitch / aura subtle layer */}
      <div
        className="
          absolute inset-0
          opacity-0 group-hover:opacity-10
          pointer-events-none
          mix-blend-lighten
          animate-[glitch_0.2s_ease-in-out]
          bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.1),transparent)]
        "
      />

      <p className="text-gray-300"><span className="text-red-600/60">Games:</span> {getFirst3Videogames(phyOrder.order_items)}</p>
      <p className="text-gray-300"><span className="text-red-600/60">Price:</span> {phyOrder.total_price}</p>
      <p className="text-gray-300"><span className="text-red-600/60">Status:</span> {phyOrder.status}</p>

      <p className="mt-2 text-red-600/60 text-sm uppercase tracking-wider">Direction</p>
      <p className="text-gray-400 text-sm">
        {phyOrder.direction.city}, {phyOrder.direction.street}, {phyOrder.direction.zip}
      </p>
    </div>
  );
  /* return (
        <div>
            <p>Games: {getFirst3Videogames(phyOrder.order_items)}</p>
            <p>Price: {phyOrder.total_price}</p>
            <p>Status: {phyOrder.status}</p>
            <p>Direction: </p>
            <p>{phyOrder.direction.city}, {phyOrder.direction.street}, {phyOrder.direction.zip}</p>
        </div>
    );  */
}



function getFirst3Videogames(items : OrderItem[]){
    return items.slice(0, 3).map(i => i.videogame.title);
}