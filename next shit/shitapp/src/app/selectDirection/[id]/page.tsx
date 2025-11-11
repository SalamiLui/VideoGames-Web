'use client'
import Header from "@/app/components/Header"
import { useEffect, useState } from "react"
import DirectionCard from "./DirectionCard"
import ErrorCard, { triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard"
import { ErrorInfo } from "@/app/components/errorCard"

/* type Direction struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	Street string `json:"street"`
	City   string `json:"city"`
	State  string `json:"state"`
	Zip    string `json:"zip"`
	Number string `json:"number"`
	UserID uint   `json:"user_id"`
}
 */


export interface Direction {
    id : number
    street : string
    city : string
    state : string
    zip : string
    number : string
    user_id : number
}

export default function ShowDirectionMenu(){

    const [directions, setDirections] = useState<Direction[]>([])
    const [showError, setShowError] = useState<boolean>(false)
    const [errorProps, setErrorProps] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp =  {
        setInfoError : setErrorProps,
        setShowError : setShowError
    }

    const directionSelected = (id : number)=> {
        const userID = localStorage.getItem("userID")
        window.location.href = "/checkout/" + userID + "?direction=" + id
    }

    const newDirectionBtn = () => {
        const userID = localStorage.getItem("userID")
        if (!userID){
            window.location.href = "/login"
            return
        }
        window.location.href = "/user/" + userID + "/newDirection"
    }

    const getDirectons = async () => {
        const userID = localStorage.getItem("userID")
        if (!userID){
            window.location.href = "/login"
            return
        }
        try{
            // router.GET("/users/:id/directions", controllers.GetUserDirections)
            const API_URL = "http://localhost:8080/users/" + userID + "/directions"
            const token = localStorage.getItem("token")

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
            setDirections(data)
        }
        catch{
            triggerNetworkError(t)
        }
    }

    useEffect(()=>{
        getDirectons()
    }, [])



   /*  return <>
        <div>
            <Header></Header>
            <div>
                {directions.map(direction => (
                    <div
                    onClick={() => directionSelected(direction.id)}>
                        <DirectionCard direction={direction}></DirectionCard>
                    </div>
                ))}
            </div>
            <button
                onClick={newDirectionBtn}>
                    New Direction
            </button>
        </div>
    </> */

    return (
    <div
      className="min-h-screen bg-cover bg-center relative flex flex-col items-center bg-fixed"
      style={{ backgroundImage: "url('/images/t1.jpg')" }}
    >
      {/* Overlay negro semitransparente */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Header pegado arriba y ancho completo */}
      <div className="absolute top-0 left-0 w-full z-10">
        <Header />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-3xl mt-24 px-4 flex flex-col items-center gap-4">
        <h1 className="mt-12 text-4xl md:text-6xl font-bold text-red-900 drop-shadow-lg">
            Select an Address
          </h1>
        {directions.map(direction => (
          <div
            key={direction.id}
            onClick={() => directionSelected(direction.id)}
            className={`w-full p-4 bg-black/60 text-red-600 rounded-lg shadow-sm cursor-pointer transition-all hover:border-red-600 hover:ring-1 hover:ring-red-600`}
          >
            <DirectionCard direction={direction} />
          </div>
        ))}

        <button
          onClick={newDirectionBtn}
          className="mt-6 p-3 rounded bg-black text-red-600 border border-red-600 hover:bg-red-600 hover:text-black transition-all shadow-sm"
        >
          New Direction
        </button>
      </div>
      {showError && errorProps && (
        <ErrorCard
          errorNumber={errorProps.errorNumber}
          description={errorProps.description}
          onClose={()=>{setShowError(false)}}>
        </ErrorCard>
      )}
    </div>

  );



}