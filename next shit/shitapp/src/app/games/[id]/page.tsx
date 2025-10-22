"use client"
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import styles from  "./games.module.css"
import { VideoGame } from "@/app/home/types";
import { useEffect, useState } from "react";
import WishlistButton from "./buttonWishlist";

export default function Game(){
    const params = useParams();
    const id = params.id;
    const [game,  setGame] = useState<VideoGame>()
    const [errorMessage, setErrorMessage] = useState<string |  null>(null)

    useEffect( () => {
        const getGame = async () => {
            const API_URL  = "http://localhost:8080/videogames/" + id
            try {
                const res = await fetch(API_URL, {
                    method:"GET",
                })
                const data = await res.json()
                if (!res.ok){
                    setErrorMessage(data.message)
                    return
                }
                setGame(data)
                setErrorMessage(null)

            }catch{
                setErrorMessage("Error loading game,  please try again later")

            }
        }
        getGame()
    }, []);

    const addWishlist = async () => {
        const userID = localStorage.getItem("userID")
	      // router.POST("users/:id/wishlist/addVideogame/:vid", )
        const API_URL = "http://localhost:8080/users/" + userID + "/wishlist/addVideogame/" + game?.id
        try {
            const res = await fetch(API_URL, {
               method:"POST"
            })
            if (res.ok){
                window.location.href = "/wishlist/" + userID
                return
            }
            const data = await res.json()
            if (res.status === 409 && data.message === "videogame already in wishlist") { //is this even good?
                window.location.href = "/wishlist/" + userID
                return
            }

        }
        catch{

        }
    }



    return <>
    <div  className={styles.pageWrap}>
        <Header></Header>
        {errorMessage && (
            <span>{errorMessage}</span>
        )}
        {  game && (

            <div className={styles.gameContainer}>

              <div className={styles.mainCard}>
                <div className={styles.gameImage}>
                  {game?.image_url && <img src={game.image_url} alt={game.title} />}
                </div>
                <div className={styles.subMainInfo}>
                  <h1 className={styles.gameTitle}>{game?.title}</h1>
                  <p><strong>Price:</strong> ${game?.price}</p>
                  <p><strong>Physical Stock:</strong> {game?.phy_stock}</p>
                  <p><strong>Digital Stock:</strong> {game?.dig_stock}</p>
                  <div className={styles.gameButtons}>
                    <button className={`${styles.btn} ${styles.redGlow}`}>Add to Cart</button>
                    <WishlistButton game_id={game.id}></WishlistButton>
                    {/* <button
                      className={`${styles.btn} ${styles.redGlow}`}
                      onClick={addWishlist}>Add to Wishlist</button> */}
                  </div>
                </div>
              </div>

              <div className={styles.gameInfo}>

                <div className={styles.cards}>
                  <div className={styles.card}>
                    <div className={styles.cardInfo}>
                      <p><strong>Genres:</strong> {game?.genre?.map(g => g.name).join(", ")}</p>
                      <p><strong>Plataforms:</strong> {game?.platform?.map(g => g.name).join(", ")}</p>
                      <p><strong>Labels:</strong> {game?.label?.map(g => g.name).join(", ")}</p>
                      <p><strong>Rating:</strong> {game?.rating}</p>
                      <p><strong>Release year:</strong> {game?.release_year}</p>
                      <p><strong>Developer:</strong> {game?.developer}</p>
                      <p><strong>PEGI:</strong> {game?.pegi}</p>
                    </div>

                  </div>

                  <div className={styles.card}>
                    <p><strong>Minimun Requirements:</strong> </p>
                    <p>{game.min_req}</p>
                  </div>

                  <div className={styles.card}>
                    <p><strong>Synopsis:</strong> </p>
                    <p>{game.synopsis}</p>
                  </div>

                  <div className={styles.card}>
                    <p><strong>Reviews:</strong> </p>
                    <p></p>
                  </div>

                </div>


              </div>
            </div>
        )}

    </div>

    </>
}