'use client'
import { useParams } from "next/navigation"
import Header from "@/app/components/Header";
import styles from "./cart.module.css"
import GameCartItem from "./cartItem";
import { useEffect, useState } from "react";
import { CartItem } from "./types";


/* type Cart struct {
	ID         uint        `json:"id" gorm:"primaryKey"`
	VideoGames *[]CartItem `json:"videogames" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	TotalPrice float64     `json:"total_price"`
	UserID     uint        `json:"user_id"`
} */

export interface Cart{
    id : number;
    videogames : CartItem[];
    total_price : number;
    user_id : number
}

export default function Cart(){
    const params = useParams();
    const userID =  params.id;

    const [cartItems, setCartItems] = useState<CartItem[]>([])

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
            setCartItems(data.videogames)
        }catch{

        }
    }

    useEffect(()=> {
        getCart()
    }, [])

    return <>
    <div className={styles.pageWrap}>
        <Header></Header>
        <div>
            {cartItems.map(
                cartItem => <GameCartItem key={cartItem.id} cartItem={cartItem} />
            )}
        </div>
    </div>

    </>
}