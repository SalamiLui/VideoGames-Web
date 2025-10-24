import { CartItem } from "./types";
import styles from "./cart.module.css"
import { StockButton } from "./StockButton";
import { useState } from "react";
import { useEffect } from "react";

interface Props {
    cartItem : CartItem
}


export default function GameCartItem ({cartItem} : Props){
    const game = cartItem.videogame

    const [amount, setAmount] = useState(cartItem.quantity)
    const [isPhysical, setIsPhysical] = useState(cartItem.is_physical)

    cartItem.is_physical = isPhysical
    cartItem.quantity = amount


    const updateCartItem = async () => {
        const userID = localStorage.getItem("userID")

        const API_URL = "http://localhost:8080/users/" + userID + "/cartitem/" + cartItem.id

        try{
            const res = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: cartItem.id,
                    quantity: amount,
                    is_physical: isPhysical
                }),
            });
            if (!res.ok){
                return
            }
        }catch{

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
                <img src={game.image_url} alt={game.title} />
                <div className={styles.mainInfo}>
                    <h1>{game.title}</h1>
                    <p>Price: {game.price}</p>

                    <div className={styles.selector}>
                        <label>
                            <input
                                type="radio"
                                name={`type-${game.id}`}
                                value="physical"
                                checked={isPhysical}
                                onChange={() => setIsPhysical(true)}
                            />
                            Físico
                        </label>
                        <label>
                            <input
                                type="radio"
                                name={`type-${game.id}`}
                                value="digital"
                                checked={!isPhysical}
                                onChange={() => setIsPhysical(false)}
                            />
                            Digital
                        </label>
                    </div>

                    <div className={styles.ButtonsStock}>
                        <StockButton
                            cartItem={cartItem}
                            amount={amount}
                            setAmount={setAmount}>
                        </StockButton>
                    </div>
                </div>

            </div>
            <div className={styles.subTotalCard}>
                <p>SubTotal: </p>
                <p>{game.price * amount}</p>
            </div>
        </div>
    </>
}