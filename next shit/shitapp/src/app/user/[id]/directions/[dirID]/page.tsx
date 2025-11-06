'use client'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard"
import Header from "@/app/components/Header"
import { Direction } from "@/app/selectDirection/[id]/page"
import { Fira_Sans_Extra_Condensed } from "next/font/google"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ModifyDirection(){
    const params = useParams()
    const dirID = params.dirID

    const userID = localStorage.getItem("userID")
    if (!userID){
        window.location.href = "/login"
        return
    }
    const [direction, setDirection] = useState<Direction>()

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError : setShowError,
        setInfoError: setInfoError
    }

    const getDirection = async () => {
        const API_URL = "http://localhost:8080/users/"+userID+"/directions/"+dirID
        try{
            const res = await fetch(API_URL, {

            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            setDirection(data)
        }
        catch{
            triggerNetworkError(t)
        }

    }

    const putDirection = async (direction : Direction) =>{
        const API_URL = "http://localhost:8080/users/"+userID+"/directions/"+dirID
        try{
            const res = await fetch(API_URL, {
                method:'PUT',
                body: JSON.stringify(direction),
                headers: {'Content-Type': 'application/json'}
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            window.location.href = "/user/"+userID+"/directions"

        }
        catch{
            triggerNetworkError(t)

        }
    }


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const data: Direction = {
            street: String(String(formData.get("Street"))),
            city: String(formData.get("City")),
            state: String(String(formData.get("State"))),
            zip: String(formData.get("Zip")),
            number: String(formData.get("Number")),
            id: 0,
            user_id: Number(userID)
        };

        putDirection(data)

    };

    useEffect(()=>{
        getDirection()
    }, [])


    return (
  <div className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed"
       style={{ backgroundImage: "url('/images/vela.gif')" }}
  >
    {/* Overlay oscuro */}
    <div className="absolute inset-0 bg-black/70"></div>

    <div className="relative z-10">
      <Header></Header>

      <div className="flex justify-center items-center min-h-[80vh] flex-col">

        <h2 className="text-3xl md:text-4xl font-bold text-red-800 mb-6 drop-shadow-[0_0_6px_rgba(139,0,0,0.4)] tracking-wider">
            Modify Direction
          </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-black/40 backdrop-blur-sm p-8 rounded-lg border border-red-900/30 shadow-[0_0_15px_2px_rgba(139,0,0,0.3)] space-y-4 w-[90%] max-w-md"
        >

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">Street:</p>
            <input type="text" name="Street" defaultValue={direction?.street} required
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="Enter street..."
            />
          </label>

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">City:</p>
            <input type="text" name="City" required defaultValue={direction?.city}
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="Enter city..."
            />
          </label>

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">State:</p>
            <input type="text" name="State" required defaultValue={direction?.state}
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="Enter state..."
            />
          </label>

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">Zip:</p>
            <input type="number" name="Zip" required defaultValue={direction?.zip}
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="Enter zip..."
            />
          </label>

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">Number:</p>
            <input type="number" name="Number" required defaultValue={direction?.number}
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="House number..."
            />
          </label>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-red-900 hover:bg-red-800 text-gray-200 font-semibold border border-red-700 rounded shadow-[0_0_10px_rgba(139,0,0,0.5)] hover:shadow-[0_0_15px_rgba(139,0,0,0.7)] transition duration-200"
          >
            Save
          </button>
        </form>
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


}