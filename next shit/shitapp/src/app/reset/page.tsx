'use client'
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { useState } from "react";

export default function ResetPassword(){
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [info, setInfo] = useState<string>()


    const uploadKey = async (mail : any) => {
        const API_URL = "http://localhost:8081/password/reset"
        try{
            const res = await fetch(API_URL, {
                method: "PUT",
                headers : {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(mail)
            })
            const data = await res.json()
            if (!res.ok){
                const msg = data.message || data.error || "unknow shit error"
                setInfo(msg)
                return
            }
            setInfo("password changed successfully :)")

        }
        catch{
            setInfo("fuck something went wrong")
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);

          const passw = String(formData.get("password"))
          const passw2 = String(formData.get("password2"))

          if (passw !== passw2){
            setInfo("passwords dont match asshole")
            return
          }

          const data = {
              password : passw,
              token : token,
          };

          uploadKey(data)

      }

    if (!token) {return}

    return (
    <div className="min-h-screen bg-black flex flex-col">
        <Header/>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">

                <h2 className="text-3xl font-extrabold text-white mb-4 text-center">
                    Change Password
                </h2>

                <p className="text-gray-400 mb-6 text-center text-sm">
                    Enter your new password below and confirm it.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                >
                    {/* Password Input */}
                    <div className="flex flex-col">
                        <label htmlFor="password" className="text-sm text-gray-400 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Your new password"
                            className="bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="password2" className="text-sm text-gray-400 mb-2">
                            Repeat Password
                        </label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            required
                            placeholder="Repeat your password"
                            className="bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                        Change Password
                    </button>

                    {/* Info Message */}
                    {info && (
                        <p className="text-sm text-green-400 mt-2 text-center">
                            {info}
                        </p>
                    )}
                </form>
            </div>
        </div>
    </div>
)


    return (
        <div>
            <Header/>
            <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">

                <h2 className="text-3xl font-extrabold text-white mb-4 text-center">
                    Recover Account
                </h2>

                <p className="text-gray-400 mb-6 text-center text-sm">
                    Enter your email below and we'll send you a link to reset your password.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                >
                    {/* Email Input */}
                    <div className="flex flex-col">
                        <label htmlFor="mail" className="text-sm text-gray-400 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition"
                            placeholder="AfuckingPasswIwontForgetThisTime"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="mail" className="text-sm text-gray-400 mb-2">
                            Repeat password
                        </label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            required
                            className="bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition"
                            placeholder="AfuckingPasswIwontForgetThisTime"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
        {info && (
            <p>{info}</p>
        )}


        </div>
    )
}