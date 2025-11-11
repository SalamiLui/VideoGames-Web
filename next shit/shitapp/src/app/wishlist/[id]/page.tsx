'use client'
import { useParams } from "next/navigation"
import Header from "@/app/components/Header";
import styles from "./wishlist.module.css"
import { VideoGame } from "@/app/home/types";
import { useEffect, useState } from "react";
import WishlistCard from "./components/wishlistCard";
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";

export default function Wishlist(){
    const params = useParams();
    const userID =  params.id;
    const [games, setGames] = useState<VideoGame[]>([])

    const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
    const [showError, setShowError] = useState<boolean>(false)
    const t : triggerErrorProp = {
        setInfoError: setErrorInfo,
        setShowError: setShowError
    }

    useEffect(()=>{
        const API_URL = "http://localhost:8080/users/" + userID + "/wishlist"
        const token = localStorage.getItem("token")
        async function getWishlist(){
            try{
                const res = await fetch(API_URL, {
                    method: "GET",
                    headers:{

                        "Authorization": `Bearer ${token}`
                    }
                })
                const data = await res.json()
                if (!res.ok){
                    triggerError(data, t, res.status)
                    return
                }
                setGames(data.videogames)
            }
            catch{
                triggerNetworkError(t)
            }
        }
        getWishlist()
    }, [])


    return <>
    <div className={styles.pageWrap}>
        <Header></Header>
        <div className={styles.gameContainer}>
            {games.map(game => <WishlistCard key={game.id} t={t} game={game} />)}
        </div>
        {showError && errorInfo && (
            <ErrorCard
                errorNumber={errorInfo.errorNumber}
                description={errorInfo.description}
                onClose={()=>{setShowError(false)}}></ErrorCard>
        )}
    </div>
    </>
}