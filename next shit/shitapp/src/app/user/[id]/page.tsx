'use client'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";
import Header from "@/app/components/Header";
import { Direction } from "@/app/selectDirection/[id]/page";
import { useEffect, useState } from "react";

/* type User struct {
	ID         uint         `json:"id" gorm:"primaryKey"`
	Username   string       `json:"username" gorm:"unique"`
	Password   string       `json:"password"`
	Mail       string       `json:"mail" gorm:"unique"`
	Role       string       `json:"role"`
	Directions *[]Direction `json:"directions" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Cart       *Cart        `json:"cart"`
	WishList   *WishList    `json:"wishlist"`
	DigOrders  *[]DigOrder  `json:"dig_orders" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	PhyOrders  *[]PhyOrder  `json:"phy_orders" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Reviews    *[]Review    `json:"reviews" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
} */



interface UserInfo {
    username : string
    mail : string
    role : string
    directions : Direction
}

export default function UserSettings() {

    const userID = localStorage.getItem("userID")
    if (!userID) {
        window.location.href = "/login"
        return
    }

    const [user, setUser] = useState<UserInfo>()

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError : setShowError,
        setInfoError: setInfoError
    }

    const getUser = async () => {

        // router.GET("/users/:id", controllers.GetUserByID)
        const API_URL = "http://localhost:8080/users/" + userID
        try{
            const res = await fetch(API_URL, {

            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data,t,res.status)
                return
            }
            setUser(data)

        }catch{
            triggerNetworkError(t)
        }
    }


    useEffect(()=>{
        getUser()
    },[])


    return (
  <div  className="h-screen overflow-hidden bg-[url('/images/t2.jpg')] bg-cover bg-center relative text-white">
    {/* Overlay (para futura imagen de fondo) */}
    <div className="absolute inset-0 bg-black/70"></div>

      <Header />

    {/* Contenido principal centrado */}
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] mt-8">
      {user && (
        <div className="w-full max-w-md p-8 bg-black/80 border border-red-700 rounded-md shadow-[0_0_20px_rgba(255,0,0,0.3)] animate-fadeIn text-center">
          <div>
            <h2 className="text-3xl font-bold text-red-600 tracking-wide">{user.username}</h2>
            <p className="text-gray-300 mt-2">Email: {user.mail}</p>
            <p className="text-gray-400">Role: {user.role}</p>
          </div>

          <div className="space-y-6 mt-8">
            <div>
              <h2 className="text-xl text-red-600 font-semibold mb-2">Handle Directions</h2>
              <button className="px-6 py-2 bg-black border border-red-600 text-white rounded-md transition-all duration-300 hover:bg-red-700 hover:shadow-[0_0_10px_rgba(255,0,0,0.6)]"
              onClick={()=>{window.location.href = "/user/"+userID+"/directions"}}>
                Directions
              </button>
            </div>

            <div>
              <h2 className="text-xl text-red-600 font-semibold mb-2">Handle Reviews</h2>
              <button className="px-6 py-2 bg-black border border-red-600 text-white rounded-md transition-all duration-300 hover:bg-red-700 hover:shadow-[0_0_10px_rgba(255,0,0,0.6)]">
                Reviews
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Error Card */}
    {showError && infoError && (
      <div className="relative z-10 mt-4 flex justify-center">
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