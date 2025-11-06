'use client'
import Header from "@/app/components/Header";
import { OrderItem } from "./orderItem";
import { useEffect, useState } from "react";
import { Direction } from "@/app/selectDirection/[id]/page";
import OrderItemCard from "./orderItem";
import { PhyOrderCard } from "./order";
import { DigOrderCard } from "./order";
import { ApiError } from "next/dist/server/api-utils";
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";

/*
type PhyOrder struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	UserID      uint         `json:"user_id"`
	OrderItems  []*OrderItem `json:"order_items" gorm:"polymorphic:OrderOwner;"`
	TotalPrice  float64      `json:"total_price"`
	Status      string       `json:"status"` // pending, completed, canceled
	Direction   Direction    `json:"direction"`
	DirectionID uint         `json:"direction_id"`
}

type DigOrder struct {
	ID         uint         `json:"id" gorm:"primaryKey"`
	UserID     uint         `json:"user_id"`
	OrderItems []*OrderItem `json:"order_items" gorm:"polymorphic:OrderOwner;"`
	TotalPrice float64      `json:"total_price"`
	Status     string       `json:"status"` // pending, completed, canceled
} */

export interface PhyOrder {
    id : number
    user_id : number
    order_items : OrderItem[]
    total_price : number
    status : string
    direction : Direction
    direction_id : number
}

export interface DigOrder {
    id : number
    user_id : number
    order_items : OrderItem[]
    total_price : number
    status : string
}





export default function Orders(){

    const userID = localStorage.getItem("userID")
    if (!userID) {
        window.location.href = "/login"
        return
    }

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoErro] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setInfoError : setInfoErro,
        setShowError : setShowError
    }

    const [isPhy, setIsPhy] = useState(true)
    const [phyOrders, setPhyOrders] = useState<PhyOrder[] | null>(null)
    const [digOrders, setDigOrders] = useState<DigOrder[] | null>(null)

    const showPhyOrderInfo = (orderID : number)=> {
        window.location.href = "/orders/"+userID+"/pOrd/"+orderID
    }

    const showDigOrderInfo = (orderID : number)=> {
        window.location.href = "/orders/"+userID+"/dOrd/"+orderID
    }

    const getPhyOrders = async () => {
        // router.GET("/users/:id/phyOrders", controllers.GetPhyOrders)
        const API_URL = "http://localhost:8080/users/"+ userID+ "/phyOrders"
        try{
            const res = await fetch(API_URL, {

            })
            const data = await  res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            setPhyOrders(data)

        }
        catch{
            triggerNetworkError(t)
        }

    }

    const getDigOrders  = async () => {
        // router.GET("/users/:id/digOrders", controllers.GetDigOrders)
        const API_URL = "http://localhost:8080/users/"+userID +"/digOrders"
        try{
            const res = await fetch(API_URL, {

            })
            const data = await  res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            setDigOrders(data)

        }
        catch{
            triggerNetworkError(t)
        }

    }


    useEffect(()=>{
        getPhyOrders()
        getDigOrders()
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

    {/* Overlay oscuro sobre el fondo */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none"></div>

    <Header />

    <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 text-red-600">

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setIsPhy(true) }}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition
          border-b-2
          ${isPhy ? 'border-red-600 text-red-500' : 'border-transparent text-gray-400 hover:text-red-600'}
          hover:brightness-125 hover:shadow-[0_0_10px_#b30000]
          active:scale-[0.97]
          `}
        >
          Physical Orders
        </button>

        <button
          onClick={() => { setIsPhy(false) }}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition
          border-b-2
          ${!isPhy ? 'border-red-600 text-red-500' : 'border-transparent text-gray-400 hover:text-red-600'}
          hover:brightness-125 hover:shadow-[0_0_10px_#b30000]
          active:scale-[0.97]
          `}
        >
          Digital Orders
        </button>
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {isPhy ? (
          phyOrders && phyOrders.map(o => (
            <div
              key={o.id}
              onClick={() => showPhyOrderInfo(o.id)}
              className="
                relative group cursor-pointer rounded-md overflow-hidden
                bg-neutral-950/90 border border-neutral-900
                shadow-[0_0_8px_rgba(0,0,0,0.7)]
                hover:shadow-[0_0_12px_rgba(160,0,0,0.35)]
                transition-all duration-150
                hover:border-red-700/40
                "
            >

              {/* Glitch layer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition duration-150 pointer-events-none
                mix-blend-screen animate-[glitch_0.2s_ease-in-out]
              "></div>

              <PhyOrderCard phyOrder={o} />
            </div>
          ))
        ) : (
          digOrders && digOrders.map(o => (
            <div
              key={o.id}
              onClick={() => showDigOrderInfo(o.id)}
              className="
                relative group cursor-pointer rounded-md overflow-hidden
                bg-neutral-950/90 border border-neutral-900
                shadow-[0_0_8px_rgba(0,0,0,0.7)]
                hover:shadow-[0_0_12px_rgba(160,0,0,0.35)]
                transition-all duration-150
                hover:border-red-700/40
                "

            >

              {/* Glitch layer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition duration-150 pointer-events-none
                mix-blend-screen animate-[glitch_0.2s_ease-in-out]
              "></div>

              <DigOrderCard digOrder={o} />
            </div>
          ))
        )}
      </div>

      {/* Error card */}
      {showError && infoError && (
        <div className="mt-6">
          <ErrorCard
            description={infoError.description}
            errorNumber={infoError.errorNumber}
            onClose={() => setShowError(false)}
          />
        </div>
      )}
    </div>

    {/* Glitch animation keyframes */}
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


   /*  return (
        <div>
            <Header></Header>
            <div>
                <div>
                    <button onClick={()=>{setIsPhy(true)}}>Physical Orders</button>
                    <button onClick={()=>{setIsPhy(false)}}>Digital Orders</button>
                </div>
                <div>
                    {isPhy?
                    <div>
                        {phyOrders && (
                            phyOrders.map(o =>
                                <div onClick={()=>showPhyOrderInfo(o.id)}>
                                    <PhyOrderCard key={o.id} phyOrder={o}></PhyOrderCard>
                                </div>
                            )
                        )}

                    </div>
                    :
                    <div>
                        {digOrders && (
                            digOrders.map(o =>
                                <div onClick={()=>{showDigOrderInfo(o.id)}}>
                                    <DigOrderCard key={o.id} digOrder={o}></DigOrderCard>
                                </div>
                            )
                        )}

                    </div>
                }
                </div>
            </div>
            {showError && infoError && (
                <ErrorCard
                    description={infoError.description}
                    errorNumber={infoError.errorNumber}
                    onClose={()=>{setShowError(false)}}></ErrorCard>
            )}
        </div>
    );
} */

}