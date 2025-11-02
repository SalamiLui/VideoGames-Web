import { VideoGame} from "@/app/home/types";
import styles from "./wishlistCard.module.css"
import { triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";

interface Prop {
    game : VideoGame
    t : triggerErrorProp
}


export default function WishlistCard({game, t}: Prop){
    // user/:id/wishlist/deleteVideogame/:vid

    const deleteItem = async () => {
        const userID  = localStorage.getItem("userID")
        const APTI_URL = "http://localhost:8080/users/" + userID + "/wishlist/deleteVideogame/" + game.id
        try {
            const res = await fetch(APTI_URL, {
                method: "DELETE"
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            // const data = await res.json()
            window.location.reload()
        }
        catch{
            triggerNetworkError(t)
        }
    }


    return <>
    <div className={styles.container}>
        <div className={styles.imageSide}>
            <img src={game.image_url} alt={game.title} width={200}></img>
        </div>
        <div className={styles.infoSide}>
            <title>{game.title}</title>
            <p>${game.price}</p>
            <p>Release Year: {game.release_year}</p>
            <p>Genres: {game?.genre?.map(g => g.name).join(", ")}</p>
            <p>Plataforms: {game?.platform?.map(g => g.name).join(", ")}</p>
        </div>
        <div className={styles.buttons}>
            <button
                className={styles.btn}
                onClick={()=>{window.location.href = "/games/"+game.id}}
                >
                View
            </button>
            <button
                className={styles.btn}
                onClick={deleteItem}
                >
                    Delete
            </button>
        </div>
    </div>
    </>
}