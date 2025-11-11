'use client'
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Genre, Label, Platform, Review, VideoGame } from "../home/types";
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "../components/errorCard";
import { Dispatch } from "react";
import { SetStateAction } from "react";
import { VideogameAdminCard } from "./components/videogameCard";
import { FilterAdminCard } from "./components/filterCard";
import ReviewCard from "../games/[id]/reviewCard";

enum Options {
    VideoGames,
    Platforms,
    Genres,
    Labels,
    Reviews
}

enum  ReviewModStatus {
    Pending = "pending",
    Approved = "approved",
    Rejected = "rejected"
}

export default function AdminPage(){
    const [option, setOption] = useState(0)

    const [videogames, setVideogames] = useState<VideoGame[]>([])
    const [platforms, setPlatforms] = useState<Platform[]>([])
    const [genres, setGenres] = useState<Genre[]>([])
    const [labels, setLabels] = useState<Label[]>([])
    const [reviews, setReviews] = useState<Review[]>([])

    const [showError, setShowError] = useState(false)
    const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError : setShowError,
        setInfoError : setErrorInfo
    }

    const datas = new Map<string, Dispatch<SetStateAction<any>>>([
        ["videogames", setVideogames],
        ["platforms", setPlatforms],
        ["genres", setGenres],
        ["labels", setLabels],
        ["reviews", setReviews]
    ])

    const fetchData = async (API_URL : string) => {
        const token = localStorage.getItem("token")
        try{
            const res = await fetch(API_URL, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            return data

        }
        catch{
            triggerNetworkError(t)
        }
    }


    const getDatas = async ( datas : Map<string,Dispatch<SetStateAction<any>>> ) => {
        const API_URL = "http://localhost:8080/"

        await Promise.all(
            Array.from(datas.entries()).map(async ([endpoint, set]) => {
                const data = await fetchData(API_URL + endpoint);
                if (data) set(data);
            })
        );
    }

    const getData = async (key: string) => {
        const API_URL = "http://localhost:8080/";
        const setFn = datas.get(key);

        if (!setFn) {
            console.error(`No setter for key "${key}"`);
            return;
        }

        const data = await fetchData(API_URL + key);
        if (data) setFn(data);
    };

    const fetchDelete = async (endpoint : string)=> {
        const API_URL = "http://localhost:8080/"
        const token = localStorage.getItem("token")
        try {
            const res = await fetch(API_URL + endpoint, {
                method:"DELETE",
                headers : {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return false
            }
            return true

        }
        catch {
            triggerNetworkError(t)
            return false
        }
    }

    useEffect(()=>{
        getDatas(datas);
    }, [])

    const changeReview = async (endpoint : string) => {
      const API_URL = "http://localhost:8080/reviews/" + endpoint
      const token = localStorage.getItem("token")
      try{
        const res = await fetch(API_URL, {
          method:'PUT',
          headers: {
            "Authorization": `Bearer ${token}`
          }

        })
        const data = await res.json()
        if (!res.ok){
          triggerError(data, t, res.status)
          return
        }
        window.location.href = "/admin"

      }
      catch{
        triggerNetworkError(t)

      }
    }


    return (
  <div className="relative min-h-screen">

    {/* Fondo animado */}
    <div
      className="
        fixed inset-0
        bg-cover bg-center
        pointer-events-none
        bg-fixed
      "
      style={{ backgroundImage: `url('/images/nina.gif')` }}
    />

    {/* Overlay oscuro con blur */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none"></div>

    <Header />

    <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 text-red-600">

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setOption(Options.VideoGames)}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition border-b-2
            ${option === Options.VideoGames
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-gray-400 hover:text-red-600'}
            hover:brightness-125 hover:shadow-[0_0_10px_#b30000]
            active:scale-[0.97]
          `}
        >
          VideoGames
        </button>
        <button
          onClick={() => setOption(Options.Platforms)}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition border-b-2
            ${option === Options.Platforms
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-gray-400 hover:text-red-600'}
            hover:brightness-125 hover:shadow-[0_0_10px_#b30000]
            active:scale-[0.97]
          `}
        >
          Platforms
        </button>
        <button
          onClick={() => setOption(Options.Genres)}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition border-b-2
            ${option === Options.Genres
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-gray-400 hover:text-red-600'}
            hover:brightness-125 hover:shadow-[0_0_10px_#b30000]
            active:scale-[0.97]
          `}
        >
          Genres
        </button>
        <button
          onClick={() => setOption(Options.Labels)}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition border-b-2
            ${option === Options.Labels
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-gray-400 hover:text-red-600'}
            hover:brightness-125 hover:shadow-[0_0_10px_#b30000]
            active:scale-[0.97]
          `}
        >
          Labels
        </button>
        <button
          onClick={() => setOption(Options.Reviews)}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition border-b-2
            ${option === Options.Reviews
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-gray-400 hover:text-red-600'}
            hover:brightness-125 hover:shadow-[0_0_10px_#b30000]
            active:scale-[0.97]
          `}
        >
          Reviews
        </button>
      </div>

      {/* Contenido dinámico */}
      <div className="grid gap-4">
        {option === Options.VideoGames && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                className="px-4 py-2 bg-red-700 text-white font-semibold rounded-md shadow-[0_0_10px_#b30000]
                  hover:bg-red-600 hover:shadow-[0_0_14px_#ff0000] transition active:scale-95"
              onClick={()=>window.location.href = "/admin/createUpdateVideogame"}>
                New Game
              </button>
            </div>
            {videogames.map(v => (
              <VideogameAdminCard key={v.id} onDelete={fetchDelete} onRefresh={getData} game={v} />
            ))}
          </div>
        )}

        {option === Options.Platforms && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                className="px-4 py-2 bg-red-700 text-white font-semibold rounded-md shadow-[0_0_10px_#b30000]
                  hover:bg-red-600 hover:shadow-[0_0_14px_#ff0000] transition active:scale-95"
                onClick={()=>window.location.href = "/admin/createUpdateFilter/platforms"}>
                New Platform
              </button>
            </div>
            {platforms.map(f => (
              <FilterAdminCard key={f.id} onDelete={fetchDelete} onRefresh={getData} type="platforms" filter={f} />
            ))}
          </div>
        )}

        {option === Options.Genres && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                className="px-4 py-2 bg-red-700 text-white font-semibold rounded-md shadow-[0_0_10px_#b30000]
                  hover:bg-red-600 hover:shadow-[0_0_14px_#ff0000] transition active:scale-95"
                onClick={()=>window.location.href = "/admin/createUpdateFilter/genres"}>

                New Genre
              </button>
            </div>
            {genres.map(f => (
              <FilterAdminCard key={f.id} onDelete={fetchDelete} onRefresh={getData} type="genres" filter={f} />
            ))}
          </div>
        )}

        {option === Options.Labels && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                className="px-4 py-2 bg-red-700 text-white font-semibold rounded-md shadow-[0_0_10px_#b30000]
                  hover:bg-red-600 hover:shadow-[0_0_14px_#ff0000] transition active:scale-95"
                onClick={()=>window.location.href = "/admin/createUpdateFilter/labels"}>

                New Label
              </button>
            </div>
            {labels.map(f => (
              <FilterAdminCard key={f.id} onDelete={fetchDelete} onRefresh={getData} type="labels" filter={f} />
            ))}
          </div>
        )}

        {option === Options.Reviews && (
          <div>
            {reviews.map(r => (
              <div
                key={r.id}
                className="p-4 rounded-md bg-neutral-950/95 border border-neutral-900 shadow-[0_0_8px_rgba(0,0,0,0.7)]
                  hover:border-red-700/40 hover:shadow-[0_0_12px_rgba(160,0,0,0.35)] transition-all duration-150 mb-4"
              >
                <p className="text-gray-300 mb-2"><span className="text-red-600/60">Game:</span> {r.videogame_name}</p>
                <ReviewCard review={r} />
                <div className="mt-2 flex gap-2">
                  {r.modstatus !== ReviewModStatus.Approved && (
                    <button
                      className="px-3 py-1 bg-green-700/60 text-white rounded-md text-sm hover:bg-green-600/70 transition"
                      onClick={()=>changeReview(r.id+"/approve")}>
                      Approve
                    </button>
                  )}
                  {r.modstatus !== ReviewModStatus.Rejected && (
                    <button
                      className="px-3 py-1 bg-red-700/60 text-white rounded-md text-sm hover:bg-red-600/70 transition"
                      onClick={()=>changeReview(r.id+"/reject")}>
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error card */}
      {showError && errorInfo && (
        <div className="mt-6">
          <ErrorCard
            description={errorInfo.description}
            errorNumber={errorInfo.errorNumber}
            onClose={() => setShowError(false)}
          />
        </div>
      )}
    </div>

    {/* Glitch animation */}
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