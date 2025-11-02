'use client'
import type { Direction } from "@/app/selectDirection/[id]/page";
import Header from "@/app/components/Header";
import { useState } from "react";
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";


export default function NewDirection(){

    const [errroInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
    const [showError, setShowError] = useState<boolean>(false)
    const t : triggerErrorProp =  {
        setInfoError: setErrorInfo,
        setShowError: setShowError
    }

    const userID = localStorage.getItem("userID")
    if (!userID){
        window.location.href = "/login"
        return
    }

    const uploadDirection = async (d : Direction) => {
        try{
            // router.POST("/users/:id/directions", controllers.NewUserDirection)
            const APIT_URL = "http://localhost:8080/users/" + userID + "/directions"
            const res = await fetch(APIT_URL, {
                method:"POST",
                body: JSON.stringify(d),
                headers: {'Content-Type': 'application/json'}
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            window.history.back()

        }catch{
            triggerNetworkError(t)
        }

    }


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const data: Direction = {
          street: String(formData.get("Street")),
          city: String(formData.get("City")),
          state: String(String(formData.get("State"))),
          zip: String(formData.get("Zip")),
          number: String(formData.get("Number")),
          id: 0,
          user_id: Number(userID)
        };

        uploadDirection(data)
  };

  return (
  <div className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
       style={{ backgroundImage: "url('/images/vela.gif')" }}
  >
    {/* Overlay oscuro */}
    <div className="absolute inset-0 bg-black/70"></div>

    <div className="relative z-10">
      <Header></Header>

      <div className="flex justify-center items-center min-h-[80vh] flex-col">

        <h2 className="text-3xl md:text-4xl font-bold text-red-800 mb-6 drop-shadow-[0_0_6px_rgba(139,0,0,0.4)] tracking-wider">
            New Direction
          </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-black/40 backdrop-blur-sm p-8 rounded-lg border border-red-900/30 shadow-[0_0_15px_2px_rgba(139,0,0,0.3)] space-y-4 w-[90%] max-w-md"
        >

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">Street:</p>
            <input type="text" name="Street" required
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="Enter street..."
            />
          </label>

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">City:</p>
            <input type="text" name="City" required
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="Enter city..."
            />
          </label>

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">State:</p>
            <input type="text" name="State" required
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="Enter state..."
            />
          </label>

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">Zip:</p>
            <input type="number" name="Zip" required
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="Enter zip..."
            />
          </label>

          <label className="text-gray-200 font-medium block">
            <p className="mb-1 text-red-700">Number:</p>
            <input type="number" name="Number" required
              className="w-full bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2 focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)] placeholder-gray-500"
              placeholder="House number..."
            />
          </label>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-red-900 hover:bg-red-800 text-gray-200 font-semibold border border-red-700 rounded shadow-[0_0_10px_rgba(139,0,0,0.5)] hover:shadow-[0_0_15px_rgba(139,0,0,0.7)] transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
    {showError && errroInfo && (
        <ErrorCard
            description={errroInfo.description}
            errorNumber={errroInfo.errorNumber}
            onClose={()=>{setShowError(false)}}></ErrorCard>
    )}
  </div>
);


}