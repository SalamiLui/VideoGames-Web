import { VideoGame } from "@/app/home/types";
import styles from "./cart.module.css"

// FIXME does this works?
class ManageStockButton {
    game : VideoGame;
    isPhy : boolean;
    stock? : number;
    startAmount : number

    constructor(game : VideoGame, isPhy : boolean){
        this.game = game
        this.isPhy = isPhy
        this.stock = isPhy? game.phy_stock : game.dig_stock
        this.startAmount = 1
    }

    add() {
        if (!this.stock){return}
        if (this.startAmount >= this.stock ){return}
        this.stock++
    }

    sub() {
        if (!this.stock){return}
        if (this.startAmount <= 0){return}
        this.stock--
    }


    Create() {
        return <>
        <div>
            <div>
                <button> - </button>
                <span>{this.startAmount}</span>
                <button> + </button>
            </div>
            <p>{this.isPhy? "Physical": "Digital"} Stock: {this.stock}</p>
        </div>
        </>
    }
}



export default function GameCartItem (game : VideoGame){
    return <>
        <div className={styles.container}>
            <div className={styles.infoCard}>
                <img src={game.image_url} alt={game.title} />
                <div className={styles.mainInfo}>
                    <h1>{game.title}</h1>
                    <p>Price: {game.price}</p>
                    <div className={styles.ButtonsStock}>

                    </div>
                </div>

            </div>
            <div className={styles.subTotalCard}>
                <p>SubTotal: </p>
                <p>{game.price * ((game.phy_stock || 0) + (game.dig_stock || 0 ))}</p>
            </div>


        </div>
    </>
}