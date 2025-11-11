'use client'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";
import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import { useState } from "react";

interface Key {
   key : string
   videogame_id : number
}

export default function NewCDKey(){

    const params = useParams()
    const gameID = params.gameID

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError : setShowError,
        setInfoError: setInfoError
    }


    const uploadKey = async (key : Key) => {
		// authGroup.POST("/cdkeys", controllers.CreateCDKey)
        const API_URL = "http://localhost:8080/cdkeys"
        const token = localStorage.getItem("token")
        try{
            const res = await fetch(API_URL, {
                method: "POST",
                headers : {
                  "Authorization": `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(key)
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data,t,res.status)
                return
            }
            window.location.href = "/admin"

        }
        catch{
            triggerNetworkError(t)
        }
    }


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);

          const data: Key = {
              key : String(formData.get("key")),
              videogame_id : Number(gameID)
          };

          uploadKey(data)

      }

    return (
        <div>
            <Header/>
<div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8 text-red-500 tracking-wide uppercase">
                    New cdkey
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className="bg-neutral-950/70 border border-neutral-800 rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.1)] p-8 flex flex-col gap-6 backdrop-blur-sm"
                >
                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="title" className="text-sm text-gray-400 tracking-wide">
                            Key
                        </label>
                        <input
                            type="text"
                            id="key"
                            name="key"
                            required
                            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all"
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="bg-red-700 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md shadow-[0_0_10px_rgba(255,0,0,0.25)] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"
                        >
                            Save
                        </button>
                    </div>

                </form>

            </div>
            {showError && infoError && (
                <ErrorCard
                description={infoError.description}
                errorNumber={infoError.errorNumber}
                onClose={()=>setShowError(false)}></ErrorCard>
            )}
        </div>
    )
}