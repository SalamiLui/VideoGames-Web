import { CartItem } from "./types";
import styles from "./cart.module.css"
import { StockButton } from "./StockButton";
import { useState } from "react";
import { useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { triggerErrorProp } from "@/app/components/errorCard";
import { ErrorInfo } from "@/app/components/errorCard";
import { triggerNetworkError } from "@/app/components/errorCard";
import { triggerError } from "@/app/components/errorCard";


interface Props {
    cartItem : CartItem
    setTotal : Dispatch<SetStateAction<number>>
    t : triggerErrorProp
}


export default function GameCartItem ({cartItem, setTotal,t } : Props, ){
    const game = cartItem.videogame

    const [amount, setAmount] = useState(cartItem.quantity)
    const [isPhysical, setIsPhysical] = useState(cartItem.is_physical)

    cartItem.is_physical = isPhysical
    cartItem.quantity = amount

    function viewClick() {
        window.location.href = "/games/" + cartItem.videogame.id
    }

    async function deleteClick() {
        const userID = localStorage.getItem("userID")
        try{
            // router.DELETE("users/:id/cartitem/:itemid", controllers.DeleteItemCart)
            const API_URL = "http://localhost:8080/users/"+userID+"/cartitem/"+cartItem.id
            const token = localStorage.getItem("token")
            const res = await fetch(API_URL, {
                method : "DELETE",
                headers : {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data,t, res.status)
                return
            }
            window.location.reload()
        }catch{
            triggerNetworkError(t)
        }



    }


    const updateCartItem = async () => {
        const userID = localStorage.getItem("userID")

        const API_URL = "http://localhost:8080/users/" + userID + "/cartitem/" + cartItem.id
        const token = localStorage.getItem("token")

        try{
            const res = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: cartItem.id,
                    quantity: amount,
                    is_physical: isPhysical
                }),
            });
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            setTotal(data.new_total)

        }catch{
            triggerNetworkError(t)

        }
    }


    useEffect(() => {
      const timeout = setTimeout(() => {
        // router.PUT("users/:id/cartitem/:itemid", controllers.UpdateItemCart)
        cartItem.is_physical = isPhysical
        cartItem.quantity = amount
        updateCartItem()

      }, 500);

      return () => clearTimeout(timeout);
    }, [amount, isPhysical]);

    return <>
        <div className={styles.container}>
            <div className={styles.infoCard}>
                <img className={styles.image} src={game.image_url} alt={game.title} />
        <div className={styles.mainInfo}>
                    <h1 className={styles.title}>{game.title}</h1>
                    <p className={styles.price}>Price: {game.price}</p>
                    <div className={styles.manage}>
                        <div>
                            <p className={styles.selector}>{isPhysical? "Physical Game":"Digital Game" }</p>
                            <div className={styles.ButtonsStock}>
                                <StockButton
                                    cartItem={cartItem}
                                    amount={amount}
                                    setAmount={setAmount}>
                                </StockButton>
                            </div>
                        </div>
                        <div className={styles.btnManage}>
                        <button
                            className={styles.delete}
                            onClick={deleteClick}>
                                Delete
                        </button>
                        <button
                            className={styles.view}
                            onClick={viewClick}>
                                View
                        </button>
                        </div>
                    </div>
                </div>



            </div>
            <div className={styles.subTotalCard}>
                <p>SubTotal: </p>
                <p><strong>{game.price * amount}</strong></p>
            </div>

        </div>
    </>
}