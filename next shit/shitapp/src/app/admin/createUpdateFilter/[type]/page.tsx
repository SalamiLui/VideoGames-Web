'use client'
import Header from "@/app/components/Header";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { filter } from "../../components/filterCard";
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";

export default function CreateFilterPage(){
    const params = useParams()
    const type = params.type

    const searchParams = useSearchParams()
    const filterID = searchParams.get("filterID")

    const [filter, setFilter] = useState<filter>()

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError : setShowError,
        setInfoError: setInfoError
    }

    const initFilter = async ()=>{
        const API_URL = "http://localhost:8080/"+type+"/"+filterID
        const token = localStorage.getItem("token")
        try {
            const res = await fetch(API_URL, {
                headers : {
                  "Authorization": `Bearer ${token}`,
                }
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            setFilter(data)

        }
        catch{
            triggerNetworkError(t)
        }
    }

    const uploadFilter = async (f : filter)=> {
        let API_URL = "http://localhost:8080/" + type
        let met = "POST"
        const token = localStorage.getItem("token")
        if (filterID){
            API_URL += "/"+filterID
            met = 'PUT'
        }
        try{
            const res = await fetch(API_URL, {
                method: met,
                headers: {
                  "Authorization": `Bearer ${token}`,
                  'Content-Type': 'application/json',

                },
                body: JSON.stringify(f)
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);

          const data: filter = {
              id:0,
              name : String(formData.get("name"))
          };

          uploadFilter(data)
      }

    useEffect(()=>{
        if (filterID) {
            initFilter()
        }
    }, [])

    return (
        <div>
            <Header/>
            {/* Contenedor principal */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8 text-red-500 tracking-wide uppercase">
                    {filter ? "Edit Filter "  : "New Filter"}
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="bg-neutral-950/70 border border-neutral-800 rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.1)] p-8 flex flex-col gap-6 backdrop-blur-sm"
                >
                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="title" className="text-sm text-gray-400 tracking-wide">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            defaultValue={filter?.name || ""}
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
                onClose={()=>setShowError(false)}
                />
            )}
        </div>
    )
}