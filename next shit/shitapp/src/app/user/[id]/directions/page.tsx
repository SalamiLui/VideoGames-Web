'use client'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard"
import Header from "@/app/components/Header"
import DirectionCard from "@/app/selectDirection/[id]/DirectionCard"
import { Direction } from "@/app/selectDirection/[id]/page"
import { useEffect, useId, useState } from "react"

export default function Directions(){

    const userID = localStorage.getItem("userID")
    if (!userID){
        window.location.href  ="/login"
        return
    }

    const [directions, setDirections] = useState<Direction[]>()

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
      setShowError : setShowError,
      setInfoError : setInfoError
    }

    const deleteDirection = async (id : number) => {

      // router.DELETE("/users/:id/directions/:dirID", controllers.DeleteDirection)
      const API_URL = "http://localhost:8080/users/"+userID+"/directions/"+id
      try{
        const res = await fetch(API_URL,{
          method:"DELETE"

        })
        const data = await res.json()
        if (!res.ok){
          triggerError(data, t, res.status)
          return
        }
        getDirections()


      }catch{
        triggerNetworkError(t)

      }

    }


    const getDirections = async () => {

      // router.GET("/users/:id/directions", controllers.GetUserDirections)
      const API_URL = "http://localhost:8080/users/" + userID + "/directions"
      try{
        const res = await fetch(API_URL, {

        })
        const data = await res.json()
        if (!res.ok){
          triggerError(data, t, res.status)
          return
        }
        setDirections(data)

      }catch{
        triggerNetworkError(t)

      }
    }

    useEffect(()=>{
      getDirections()
    },[])


    return (
  <div className="min-h-screen bg-[url('/images/t2.jpg')] bg-cover bg-center bg-fixed relative text-gray-300 ">
    {/* Overlay (oscurece la imagen) */}
    <div className="absolute inset-0 bg-black/85"></div>

    <Header />

    {/* Contenido principal */}
    <div className="relative z-10 flex flex-col items-center justify-start min-h-[calc(100vh-5rem)] py-12 space-y-8">
      {directions && directions.length > 0 ? (
        directions.map((d) => (
          <div
            key={d.id}
            className="bg-neutral-950/90 border border-neutral-800 p-6 rounded-md shadow-[0_0_15px_rgba(255,0,0,0.1)] w-full max-w-md text-center animate-fadeIn"
          >
            <DirectionCard direction={d} />

            <div className="flex justify-center space-x-4 mt-4">
              <button className="px-5 py-2 bg-neutral-950 border border-neutral-800 text-gray-300 rounded-md transition-all duration-300 hover:bg-red-900/60 hover:border-red-700 hover:text-gray-100 hover:shadow-[0_0_8px_rgba(255,0,0,0.3)]"
              onClick={()=>{deleteDirection(d.id)}}>
                Delete
              </button>
              <button className="px-5 py-2 bg-neutral-950 border border-neutral-800 text-gray-300 rounded-md transition-all duration-300 hover:bg-red-900/60 hover:border-red-700 hover:text-gray-100 hover:shadow-[0_0_8px_rgba(255,0,0,0.3)]"
              onClick={()=>window.location.href = "/user/"+userID+"/directions/"+d.id}>
                Modify
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No directions found</p>
      )}

      {/* Botón para nueva dirección */}
      <button className="px-6 py-3 bg-neutral-950 border border-neutral-800 text-gray-300 rounded-md transition-all duration-300 hover:bg-red-900/60 hover:border-red-700 hover:text-gray-100 hover:shadow-[0_0_8px_rgba(255,0,0,0.3)]"
      onClick={()=>window.location.href = "/user/"+userID+"/newDirection"}>
        New Direction
      </button>
    </div>

    {/* ErrorCard */}
    {showError && infoError && (
      <div className="relative z-10 mt-6 flex justify-center">
        <ErrorCard
          description={infoError.description}
          errorNumber={infoError.errorNumber}
          onClose={() => setShowError(false)}
        />
      </div>
    )}
  </div>
)




}