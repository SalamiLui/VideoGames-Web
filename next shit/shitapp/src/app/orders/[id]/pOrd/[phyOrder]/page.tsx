'use client'
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PhyOrder } from "../../page";
import Header from "@/app/components/Header";
import OrderItemCard from "../../orderItem";
import DirectionCard from "@/app/selectDirection/[id]/DirectionCard";
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";

export default function PhyOrderPage(){

    const userID = localStorage.getItem("userID")
    if (!userID) {
        window.location.href = "/login"
        return
    }


    const params = useParams()
    const phyOrderID = params.phyOrder

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError : setShowError,
        setInfoError: setInfoError
    }

    const [order, setOrder] = useState<PhyOrder | null>(null)


    const getPhyOrder = async () => {

        // router.GET("/phyOrder/:orderID", controllers.GetPhyOrderByID)
        const API_URL = "http://localhost:8080/phyOrder/"+phyOrderID
        try{
            const res = await fetch(API_URL, {

            })
            const data = await  res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            setOrder(data)

        }catch{
            triggerNetworkError(t)
        }
    }

    useEffect(()=>{
        getPhyOrder()
    },[])

    return (
  <div className="relative min-h-screen">


  <div className="
      fixed inset-0
      bg-cover bg-center
      pointer-events-none
      bg-fixed
    "
    style={{ backgroundImage: `url('/images/nina.gif')` }}
  />

    {/* Overlay oscuro */}
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-none"></div>

    <Header />

    {order && (
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 text-gray-300 space-y-10">

        {/* Games */}
        <div>
          <h2 className="text-lg font-semibold tracking-widest uppercase text-gray-200
            border-b border-red-700/40 pb-1 mb-4">
            Games
          </h2>

          <div className="space-y-4">
            {order.order_items.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-md bg-neutral-950/90 border border-neutral-900
                shadow-[0_0_8px_rgba(0,0,0,0.7)]
                hover:border-red-700/40 hover:shadow-[0_0_12px_rgba(160,0,0,0.35)]
                transition relative group"
              >
                {/* glitch aura */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.10]
                  pointer-events-none mix-blend-screen
                  animate-[glitch_0.18s_ease-in-out]
                  bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.12),transparent)]"
                ></div>

                <OrderItemCard orderItem={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Information */}
        <div>
          <h2 className="text-lg font-semibold tracking-widest uppercase text-gray-200
            border-b border-neutral-800 pb-1 mb-3">
            Information
          </h2>

          <p><span className="text-red-600/60">Total Price:</span> {order.total_price}</p>
          <p><span className="text-red-600/60">Status:</span> {order.status}</p>
        </div>

        {/* Direction */}
        <div>
          <h2 className="text-lg font-semibold tracking-widest uppercase text-gray-200
            border-b border-neutral-800 pb-1 mb-3">
            Direction
          </h2>
          <DirectionCard direction={order.direction} />
        </div>

      </div>
    )}

    {/* Error */}
    {showError && infoError && (
      <div className="pt-6 relative z-10">
        <ErrorCard
          description={infoError.description}
          errorNumber={infoError.errorNumber}
          onClose={() => setShowError(false)}
        />
      </div>
    )}

    {/* glitch animation */}
    <style>
      {`
        @keyframes glitch {
          0% { transform: translate(0); opacity: 0.1; }
          30% { transform: translate(-1px, 1px); opacity: 0.4; }
          60% { transform: translate(1px, -1px); opacity: 0.25; }
          100% { transform: translate(0); opacity: 0.1; }
        }
      `}
    </style>
  </div>
);

/*
    return (
        <div>
            <Header></Header>
            {order && (
                <div>
                    <div>
                        <h2>Games: </h2>
                        {order.order_items.map(item =>
                            <OrderItemCard key={item.id} orderItem={item}></OrderItemCard>)}
                    </div>
                    <div>
                        <h2>Information: </h2>
                        <p>Total Price: {order.total_price}</p>
                        <p>Status: {order.status}</p>
                    </div>
                    <div>
                        <h2>Direction: </h2>
                        <DirectionCard direction={order.direction}></DirectionCard>
                    </div>
                </div>
            )}
            {showError && infoError && (
                <ErrorCard
                    description={infoError.description}
                    errorNumber={infoError.errorNumber}
                    onClose={()=>{setShowError(false)}}>
                </ErrorCard>
            )}

        </div>
    ); */
}