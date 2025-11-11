"use client"
import React, { useEffect, useState } from "react";
import { VideoGame} from "../home/types"
import { Cart } from "../cart/[id]/page";
import { CartItem } from "../cart/[id]/types";
import styles from "./add2cart.module.css"
import { triggerError, triggerErrorProp, triggerNetworkError } from "./errorCard";

interface Props {
    game : VideoGame;
    isPhy : boolean
    t : triggerErrorProp
}


export default function Add2CartButton({game, isPhy, t}: Props){
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
            const token = localStorage.getItem("token")
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    videogame_id : game.id,
                    is_physical : isPhy,
                    quantity : 1,
                }),
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            window.location.href = "/cart/" + userID

        }catch{
            triggerNetworkError(t)
        }
    }

    const deleteFromCart = async () => {
        if (!userID || !cartItemID) {return}
        try{
            // router.DELETE("users/:id/cartitem/:itemid", controllers.DeleteItemCart)
            const API_URL = "http://localhost:8080/users/"+userID+"/cartitem/"+cartItemID
            const token = localStorage.getItem("token")
            const res = await fetch(API_URL, {
                method : "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            setText("Add to Cart")

        }catch{
            triggerNetworkError(t)

        }

    }

    const initButton = async () => {
        if (!userID){return}
        const API_URL = "http://localhost:8080/users/" + userID + "/cart"
        const token = localStorage.getItem("token")
         try{
            const res = await fetch(API_URL, {
                headers:{
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            if (isAlreadyInCart(data.videogames)){
                setText("Delete from Cart")
            }
            else {
                setText("Add to Cart")
            }

        }catch{
            triggerNetworkError(t)

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

    initButton()

    /* useEffect(()=>{
        initButton()
    }, []) */

    return <>
        <button
            onClick={click}
            className={styles.addBtn}>
                {text}
        </button>
    </>

}