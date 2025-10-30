import styles from "./cartitem.module.css"
import { CartItem } from "@/app/cart/[id]/types"

interface Props {
    ci : CartItem
}
export default function CartItemResume({ci} : Props){
    const game = ci.videogame
    return <>
        <div className={styles.container}>
            <div className={styles.infoCard}>
                <img className={styles.image} src={game.image_url} alt={game.title} />
                <div>
                    <h1 className={styles.title}>{game.title}</h1>
                    <p>Price: {game.price}</p>

                </div>
                <div className={styles.mainInfo}>
                    <p>{ci.is_physical? "Physical Game":"Digital Game" }</p>
                    <p>Quantity: {ci.quantity}</p>
                    <p>SubTotal: <strong>{game.price * ci.quantity}</strong></p>
                </div>
            </div>
        </div>
    </>
}