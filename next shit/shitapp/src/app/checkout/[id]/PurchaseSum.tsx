import { useEffect, useState } from "react"
import { Cart } from "@/app/cart/[id]/page"
import Header from "@/app/components/Header"
import DirectionCard from "@/app/selectDirection/[id]/DirectionCard"
import CartItemResume from "./CartItemResume"
import { CreditCard } from "./CardInfo"
import CreditCardResume from "./CreditCardResume"
import type { Direction } from "@/app/selectDirection/[id]/page"


interface Props {
    direction : string | null
    card : CreditCard | null
    setStep : React.Dispatch<React.SetStateAction<number>>
}
export default function PurchaseSum({direction, card, setStep} : Props) {
    const userID = localStorage.getItem("userID")
    if (!userID){
        window.location.href = "/login"
        return
    }

    if (!card){
        setStep(1)
        return
    }

    const [cart, setCart] = useState<Cart>()
    const [dir, setDir] = useState<Direction>()

    const getCart = async () => {
        try{
            // router.GET("/users/:id/cart", controllers.GetCartByUserID)
            const API_URL = "http://localhost:8080/users/" + userID + "/cart"
            const res = await fetch(API_URL, {
                // TODO send auth jwt when implemented in endpoint
            })
            if (!res.ok){
                return
            }
            const data : Cart = await res.json()
            setCart(data)
        }catch{

        }
    }


    const getDirection = async () => {
        if (direction == null){return}
        try{
            // router.GET("/users/:id/directions", controllers.GetUserDirections)
            const API_URL = "http://localhost:8080/users/" + userID + "/directions"
            const res = await fetch(API_URL, {
                // TODO send auth jwt when implemented in endpoint
            })
            if (!res.ok){
                return
            }
            const dirs : Direction[] = await res.json()
            let dir : Direction | undefined
            for (const d of dirs){
                if (d.id.toString() === direction){
                    dir = d
                    break
                }
            }
            if (!dir){
                return
            }
            setDir(dir)
        }catch{

        }
    }



    useEffect(()=>{
        getCart()
        getDirection()
    },[])



/*     return <>
    <div>
        <Header></Header>
        <div>
            {cart?.videogames.map(ci => (<CartItemResume key={ci.id} ci={ci}></CartItemResume>))}
        </div>

        {dir?
            <div>
                <DirectionCard direction={dir}></DirectionCard>
            </div> : <></>
        }

        <div>
            {<CreditCardResume card={card}></CreditCardResume>}
        </div>

        <button>Confirm</button>
    </div>
    </> */

    return (
  <>
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative flex flex-col items-center py-8"
      style={{ backgroundImage: "url('/images/t2.jpg')" }}
    >
      {/* Overlay oscuro semitransparente */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Header fijo arriba */}
      <div className="absolute top-0 left-0 w-full z-10">
        <Header />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col gap-8 px-4 pt-24">
        {/* pt-24 para que el contenido no quede sobre el header */}

        {/* Shopping Cart */}
        <div className="bg-black/60 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Your Cart</h2>
          <div className="flex flex-col">
            {cart?.videogames.map(ci => (
              <CartItemResume key={ci.id} ci={ci} />
            ))}
              <h3 className="text-2xl font-bold text-red-600 mb-4">Total: ${cart?.total_price}</h3>
          </div>
        </div>

        {/* Shipping Address */}
        {dir && (
          <div className="bg-black/60 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Shipping Address</h2>
            <DirectionCard direction={dir} />
          </div>
        )}

        {/* Credit Card Summary */}
        <div className="bg-black/60 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Credit Card Summary</h2>
          <CreditCardResume card={card} />
        </div>

        {/* Confirm Button */}
        <button
          className="mt-4 px-6 py-3 rounded bg-black text-red-600 hover:bg-red-600 hover:text-black transition-all shadow-sm mx-auto"
        >
          Confirm
        </button>

      </div>
    </div>
  </>
);

}