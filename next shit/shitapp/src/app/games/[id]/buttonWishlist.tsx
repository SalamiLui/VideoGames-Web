'use client'
import { useEffect, useState } from "react"
import styles from "./games.module.css"
import { VideoGame } from "@/app/home/types"

const userID = localStorage.getItem("userID")



interface Props {
    game_id : number
}

function isInWishlist(videogames : VideoGame[], game_id: number): boolean {
    for (const v of videogames){
        if (v.id == game_id){
            return true
        }
    }
    return false
}

export default function WishlistButton({game_id} : Props){

    const [text, setText] = useState<string>("Add to WishList")

    const Add2Wishlist  = async ()  => {
        const API_URL = "http://localhost:8080/users/" + userID + "/wishlist/addVideogame/" + game_id
        try {
            const res = await fetch(API_URL, {
               method:"POST"
            })
            if (res.ok){
                window.location.href = "/wishlist/" + userID
                return
            }
            // handle error
        }
        catch{

        }

    }

    const DeleteFromWishlist = async () => {
        const userID  = localStorage.getItem("userID")
        const APTI_URL = "http://localhost:8080/users/" + userID + "/wishlist/deleteVideogame/" + game_id
        try {
            const res = await fetch(APTI_URL, {
                method: "DELETE"
            })
            if (!res.ok){
                return
            }
            window.location.reload()
        }
        catch{

        }

    }

    const ButtonClick = () => {
        if (!userID){
            window.location.href = "/login"
            return
        }
        if (text === "Add to WishList"){
            Add2Wishlist()
            return
        }
        DeleteFromWishlist()
    }

    useEffect(()=> {
        const  initButtonText = async () => {
            if (!userID) {
                return
            }
            const API_URL = "http://localhost:8080/users/" + userID + "/wishlist"
            try{
                const res = await fetch(API_URL)
                if (!res.ok){
                    return
                }
                const data = await res.json()
                const videogames : VideoGame[] = data.videogames
                if (isInWishlist(videogames, game_id)){
                    setText("Delete from Wishlist")
                    return
                }
                setText("Add to WishList")
            }
            catch{

            }
        }
        initButtonText()
    }, [])



    return <>
        <button
          className={`${styles.btn} ${styles.redGlow}`}
          onClick={ButtonClick}>{userID? text:"Add to Wishlist"}</button>
    </>
}