'use client'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";
import Header from "@/app/components/Header";
import ReviewCard from "@/app/games/[id]/reviewCard";
import { Review } from "@/app/home/types";
import { info } from "console";
import { useEffect, useState } from "react";

export default function ReviewsPage(){
    const userID = localStorage.getItem("userID")
    if (!userID){
        window.location.href = "/login"
        return
    }

    const [reviews, setReviews] = useState<Review[]>()

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError : setShowError,
        setInfoError: setInfoError
    }

    const deleteReview = async (id : number) => {

        // router.DELETE("/users/:id/review/:reviewID", controllers.DeleteReview)
        const API_URL = "http://localhost:8080/users/"+userID+"/review/"+id
        const token = localStorage.getItem("token")
        try {
            const res = await fetch(API_URL, {
                method:"DELETE",
                headers:{

                  "Authorization": `Bearer ${token}`
                }

            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            getReviews()

        }
        catch{
            triggerNetworkError(t)

        }

    }

    const getReviews = async ()=>{
        // router.GET("/users/:id/reviews", controllers.GetReviewsByUser)
        const API_URL = "http://localhost:8080/users/"+userID+"/reviews"
        const token = localStorage.getItem("token")
        try {
            const res = await fetch(API_URL, {
              headers:{

                "Authorization": `Bearer ${token}`
              }

            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            setReviews(data)
        }
        catch(Error)
        {
            triggerNetworkError(t)
        }
    }

    useEffect(()=>{
        getReviews()
    }, [])

    return (
  <div className="relative min-h-screen bg-black/90">
    {/* Fondo opcional o overlay fijo */}
    <div
      className="fixed inset-0 bg-cover bg-center pointer-events-none bg-fixed"
      style={{ backgroundImage: `url('/images/nina.gif')` }}
    />
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none"></div>

    <Header />

    <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {reviews && (
        <div className="grid gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="
                relative group flex flex-col rounded-md overflow-hidden
                bg-neutral-950/90 border border-neutral-900
                shadow-[0_0_8px_rgba(0,0,0,0.7)]
                hover:shadow-[0_0_12px_rgba(160,0,0,0.35)]
                hover:border-red-700/40
                transition-all duration-150
              "
            >
              {/* Glitch overlay */}
              <div
                className="
                  absolute inset-0 opacity-0 group-hover:opacity-[0.12]
                  pointer-events-none mix-blend-screen
                  bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.15),transparent)]
                  animate-[glitch_0.25s_ease-in-out]
                "
              ></div>

              {/* Review card */}
<h3
  className="
    text-xl font-extrabold uppercase tracking-wider
    text-red-500 drop-shadow-[0_0_6px_rgba(255,0,0,0.6)]
    group-hover:text-red-400
    transition-colors duration-200
    px-4 pt-3 pb-1
    border-b border-neutral-800/70
    relative
  "
>
  <span
    className="
      absolute inset-0 opacity-0 group-hover:opacity-[0.15]
      bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.2),transparent)]
      mix-blend-screen pointer-events-none
      animate-[glitch_0.3s_ease-in-out_infinite]
    "
  ></span>
  {r.videogame_name}
</h3>
              <ReviewCard review={r} />

              {/* Botones */}
              <div className="flex gap-2 justify-end p-3 border-t border-neutral-800">
                <button
                  onClick={() => deleteReview(r.id)}
                  className="
                    relative px-3 py-1 text-xs font-bold uppercase tracking-widest
                    text-red-600 border border-red-700/50 rounded
                    hover:text-red-400 hover:border-red-600/70
                    transition shadow-[0_0_6px_rgba(160,0,0,0.3)]
                    active:scale-[0.97] overflow-hidden
                  "
                >
                  <span
                    className="
                      absolute inset-0 opacity-0 group-hover:opacity-[0.15]
                      bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.2),transparent)]
                      mix-blend-screen pointer-events-none
                      animate-[glitch_0.25s_ease-in-out]
                    "
                  ></span>
                  Delete
                </button>

                <button
                  onClick={() => (window.location.href = `/user/${userID}/newReview/${r.videogame_id}`)}
                  className="
                    relative px-3 py-1 text-xs font-bold uppercase tracking-widest
                    text-yellow-400 border border-yellow-600/50 rounded
                    hover:text-yellow-300 hover:border-yellow-500/70
                    transition shadow-[0_0_6px_rgba(160,160,0,0.3)]
                    active:scale-[0.97] overflow-hidden
                  "
                >
                  <span
                    className="
                      absolute inset-0 opacity-0 group-hover:opacity-[0.12]
                      bg-[linear-gradient(90deg,transparent,rgba(255,255,0,0.15),transparent)]
                      mix-blend-screen pointer-events-none
                      animate-[glitch_0.25s_ease-in-out]
                    "
                  ></span>
                  Modify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    {showError && infoError && (
        <ErrorCard
        description={infoError.description}
        errorNumber={infoError.errorNumber}
        onClose={()=>setShowError(false)}></ErrorCard>
    )}

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


}