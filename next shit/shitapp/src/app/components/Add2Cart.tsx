"use client"
import React, { useEffect, useState } from "react";
import { VideoGame} from "../home/types"
import { Cart } from "../cart/[id]/page";
import { CartItem } from "../cart/[id]/types";
import styles from "./add2cart.module.css"

interface Props {
    game : VideoGame;
    isPhy : boolean
}


export default function Add2CartButton({game, isPhy}: Props){
    const stock = isPhy? game.phy_stock : game.dig_stock
    if (!stock || stock <= 0){
        return
    }

    const [text, setText] = useState("Add to Cart")
    const [cartItemID, setCartItemID] = useState<number | null>(null)
    const userID = localStorage.getItem("userID")

    const click = () => {
        if (!userID) {
            window.location.href = "/login"
            return
        }
        if (text === "Add to Cart"){
            add2Cart()
        }else{
            deleteFromCart()
        }
    }

    const add2Cart = async () => {
        if (!userID) {return}
        try{
            // router.POST("users/:id/cartitem", controllers.AddItemToCart)
            const API_URL = "http://localhost:8080/users/"+userID+"/cartitem"
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    videogame_id : game.id,
                    is_physical : isPhy,
                    quantity : 1,
                }),
            })
            if (!res.ok){
                return
            }
            window.location.href = "/cart/" + userID

        }catch{

        }
    }

    const deleteFromCart = async () => {
        if (!userID || !cartItemID) {return}
        try{
            // router.DELETE("users/:id/cartitem/:itemid", controllers.DeleteItemCart)
            const API_URL = "http://localhost:8080/users/"+userID+"/cartitem/"+cartItemID
            const res = await fetch(API_URL, {
                method : "DELETE"
            })
            if (!res.ok){
                const data = await res.json()
                return
            }
            setText("Add to Cart")

        }catch{

        }

    }

    const initButton = async () => {
        if (!userID){return}
        const API_URL = "http://localhost:8080/users/" + userID + "/cart"
         try{
            const res = await fetch(API_URL, {
                // TODO send auth jwt when implemented in endpoint
            })
            if (!res.ok){
                return
            }
            const cart : Cart = await res.json()
            if (isAlreadyInCart(cart.videogames)){
                setText("Delete from Cart")
            }
            else {
                setText("Add to Cart")
            }

        }catch{

        }
    }

    const isAlreadyInCart = (cartItems :CartItem[]) => {
        for (const cartI of cartItems) {
            if (cartI.videogame.id === game.id && cartI.is_physical === isPhy){
                setCartItemID(cartI.id)
                return true
            }
        }
        return false
    }

    useEffect(()=>{
        initButton()
    }, [isPhy])

    return <>
        <button
            onClick={click}
            className={styles.addBtn}>
                {text}
        </button>
    </>

}