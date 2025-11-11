'use client'
import OrderItemCard from "../../orderItem";
import ErrorCard from "@/app/components/errorCard";
import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import { DigOrder } from "../../page";
import { useState } from "react";
import CDKeyCard from "../../cdkeyCard";
import { ErrorInfo } from "@/app/components/errorCard";
import { triggerErrorProp } from "@/app/components/errorCard";
import { triggerError } from "@/app/components/errorCard";
import { triggerNetworkError } from "@/app/components/errorCard";
import { useEffect } from "react";

export default function DigOrderPage(){

    const params = useParams()
    const digOrderID = params.digOrder

    const [order, setOrder] = useState<DigOrder | null>(null)

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError : setShowError,
        setInfoError: setInfoError
    }



    const getPhyOrder = async () => {
        // router.GET("/digOrder/:orderID", controllers.GetDigOrderByID)
        const API_URL = "http://localhost:8080/digOrder/"+digOrderID
        const token = localStorage.getItem("token")
        try{
            const res = await fetch(API_URL, {
              headers:{

                "Authorization": `Bearer ${token}`
              }

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

    {/* Fondo overlay */}
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-none"></div>

    <Header />

    {order && (
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 text-gray-300 space-y-10">

        {/* Games Section */}
        <div>
          <h2 className="text-lg font-semibold tracking-widest uppercase text-gray-200
            border-b border-red-700/40 pb-1 mb-4
            group-hover:animate-[glitch_0.2s_ease-in-out]">
            Games
          </h2>

          {order.order_items.map(item => (
            <div key={item.id}
              className="mb-6 p-3 rounded-md bg-neutral-950/90 border border-neutral-800
              shadow-lg hover:shadow-[0_0_12px_rgba(160,0,0,0.25)]
              transition relative group">

              {/* glitch aura */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.10] pointer-events-none
                mix-blend-screen animate-[glitch_0.18s_ease-in-out]
                bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.12),transparent)]">
              </div>

              <OrderItemCard orderItem={item} />

              {/* CD-Keys accordion */}
              <details className="mt-3 text-gray-400">
                <summary className="cursor-pointer text-sm uppercase tracking-wider
                  hover:text-red-500 transition
                  border-l border-red-800/40 pl-2">
                  CD-Keys
                </summary>

                <div className="mt-2 space-y-2 p-2 rounded bg-neutral-950/80 border border-neutral-800">
                  {item.cdkey.map(cdk => (
                    <div key={cdk.id}
                      className="p-2 rounded bg-neutral-900/60 border border-neutral-800
                      text-red-500/80 font-mono text-sm tracking-widest
                      hover:border-red-600/40 hover:text-red-400
                      transition
                      shadow-[0_0_6px_rgba(0,0,0,0.6)]
                      hover:shadow-[0_0_10px_rgba(160,0,0,0.25)]">
                      <CDKeyCard t={t} cdkey={cdk} orderI={item} />
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div>
          <h2 className="text-lg font-semibold tracking-widest uppercase text-gray-200
            border-b border-neutral-800 pb-1 mb-3">
            Information
          </h2>

          <p><span className="text-red-600/60">Total Price:</span> {order.total_price}</p>
          <p><span className="text-red-600/60">Status:</span> {order.status}</p>
        </div>

      </div>
    )}

    {/* Error */}
    {showError && infoError && (
      <div className="pt-6">
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
                            <div>
                                <OrderItemCard key={item.id} orderItem={item}></OrderItemCard>)
                                <details>
                                    <summary>CD-Keys</summary>
                                    {item.cdkey.map(cdk =>
                                        <CDKeyCard cdkey={cdk} orderI={item}></CDKeyCard>
                                    )}
                                </details>

                            </div>
                        )}
                    </div>
                    <div>
                        <h2>Information: </h2>
                        <p>Total Price: {order.total_price}</p>
                        <p>Status: {order.status}</p>
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