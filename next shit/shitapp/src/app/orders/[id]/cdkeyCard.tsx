import { useState } from "react";
import { CDKey } from "./orderItem";
import { OrderItem } from "./orderItem";
import { triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";
import { ApiError } from "next/dist/server/api-utils";

interface Props {
    cdkey : CDKey
    orderI : OrderItem
    t : triggerErrorProp
}




export default function CDKeyCard({ cdkey, orderI, t }: Props) {

  const [showCDKey, setShowCDKey] = useState(false)
  const [CDKey, setCDKey] = useState<string | null>(null)

  const getCDKey = async () => {
    const API_URL = "http://localhost:8080/cdkeys/" + cdkey.id
    try{
      const res = await fetch(API_URL, {

      })
      const data = await res.json()
      if (!res.ok){
        triggerError(data,t, res.status)
        return
      }
      cdkey.state = "used"
      setCDKey(data.key)
    }
    catch{
      triggerNetworkError(t)

    }
  }

  const displayCDKey = async (show: boolean) => {
    if (CDKey === null){
      await getCDKey()
    }
    setShowCDKey(show)
  }

  const refundCDKey = async () => {
    const API_URL = "http://localhost:8080/cdkeys/" + cdkey.id + "/refund"
    try{
      const res = await fetch(API_URL, {
        method:"PUT"

      })
      const data = await res.json()
      if (!res.ok){
        triggerError(data,t, res.status)
        return
      }
      cdkey.state = "canceled"
      setCDKey(data.key)
    }
    catch{
      triggerNetworkError(t)

    }

  }



  const statusColor =
    cdkey.state === "used"
      ? "text-green-500/80"
      : cdkey.state === "canceled"
      ? "text-gray-500/70"
      : "text-red-500/70";

  return (
    <div
      className="
        mt-2 p-3 rounded bg-black/90 border border-neutral-800
        shadow-[0_0_6px_rgba(0,0,0,0.8)]
        text-sm text-gray-300 font-mono select-none
        hover:border-red-700/40 hover:shadow-[0_0_10px_rgba(160,0,0,0.25)]
        transition relative group
      "
    >
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-[0.10]
          pointer-events-none mix-blend-screen
          bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.12),transparent)]
          animate-[glitch_0.18s_ease-in-out]
        "
      ></div>

      <h2 className="text-xs text-gray-400 tracking-widest uppercase border-b border-neutral-800 pb-1 mb-2">
        {orderI.videogame.title} — CD Key
      </h2>

      <p className={`mb-2 ${statusColor}`}>
        Status: <span className="font-semibold">{cdkey.state}</span>
      </p>

      {/* 📌 Show CDKey box */}
      {showCDKey && (
        <div className="
          bg-neutral-900 border border-neutral-700 rounded p-2 mb-2 text-green-400
          break-all text-xs font-bold tracking-wider shadow-inner
        ">
          {CDKey}
        </div>
      )}

      {cdkey.state !== "canceled" && (
        <div className="flex gap-2">
          <button
            onClick={() => displayCDKey(!showCDKey)}
            className="
              px-2 py-1 text-xs border border-neutral-800 rounded
              hover:border-red-600/60 hover:text-red-400
              transition font-mono uppercase
            "
          >
            {showCDKey ? "Hide" : "Show"}
          </button>

          {cdkey.state !== "used" && (
            <button
              onClick={()=>refundCDKey()}
              className="
                px-2 py-1 text-xs border border-yellow-600/40 rounded
                text-yellow-400/80 hover:border-yellow-400/80 hover:text-yellow-300
                transition font-mono uppercase
              "
            >
              Refund
            </button>
          )}
        </div>
      )}
    </div>
  );


  return (
    <div
      className="
        mt-2 p-3 rounded bg-black/90 border border-neutral-800
        shadow-[0_0_6px_rgba(0,0,0,0.8)]
        text-sm text-gray-300 font-mono select-none
        hover:border-red-700/40 hover:shadow-[0_0_10px_rgba(160,0,0,0.25)]
        transition relative group
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

      <h2 className="text-xs text-gray-400 tracking-widest uppercase border-b border-neutral-800 pb-1 mb-2">
        {orderI.videogame.title} — CD Key
      </h2>

      <p className={`mb-2 ${statusColor}`}>
        Status: <span className="font-semibold">{cdkey.state}</span>
      </p>

      {cdkey.state !== "canceled" && (
        <div className="flex gap-2">
          {/* Show button */}
          <button
            className="
              px-2 py-1 text-xs border border-neutral-800 rounded
              hover:border-red-600/60 hover:text-red-400
              transition font-mono uppercase
            "
          >
            Show
          </button>

          {/* Refund only if not sold */}
          {cdkey.state !== "used" && (
            <button
              className="
                px-2 py-1 text-xs border border-yellow-600/40 rounded
                text-yellow-400/80 hover:border-yellow-400/80 hover:text-yellow-300
                transition font-mono uppercase
              "
            >
              Refund
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/*
export default function CDKeyCard({cdkey, orderI}: Props){



    return (
        <div>
            <h2>{orderI.videogame.title} CDkey</h2>
            <p>Status: {cdkey.state}</p>
            {cdkey.state === "canceled"? <></> :
            <div>
                <button>Show</button>
                {cdkey.state === "sold"? <></> : <button>Refund</button> }
            </div>

            }

        </div>
    );
} */