'use client'
import { useParams } from "next/navigation"
import Header from "@/app/components/Header";
import styles from "./wishlist.module.css"
import { VideoGame } from "@/app/home/types";
import { useEffect, useState } from "react";
import WishlistCard from "./components/wishlistCard";

export default function Wishlist(){
    const params = useParams();
    const userID =  params.id;
    const [games, setGames] = useState<VideoGame[]>([])

    useEffect(()=>{
        const API_URL = "http://localhost:8080/users/" + userID + "/wishlist"
        async function getWishlist(){
            try{
                const res = await fetch(API_URL, {
                    method: "GET",
                })
                if (!res.ok){
                    return
                }
                const data = await res.json()
                setGames(data.videogames)
            }
            catch{

            }
        }
        getWishlist()
    }, [])


    return <>
    <div className={styles.pageWrap}>
        <Header></Header>
        <div className={styles.gameContainer}>
            {games.map(game => <WishlistCard key={game.id} game={game} />)}
        </div>
    </div>
    </>
}