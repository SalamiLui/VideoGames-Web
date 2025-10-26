import { CartItem } from "./types";
import styles from "./cart.module.css"

interface Prop {
    cartItem : CartItem;
    amount : number;
    setAmount : React.Dispatch<React.SetStateAction<number>>;
}


export function StockButton({cartItem, amount, setAmount} : Prop){

    const stock = cartItem.is_physical?
                    cartItem.videogame.phy_stock:
                    cartItem.videogame.dig_stock

    if (!stock || stock === 0) {
        return <>
            <p>Stock: 0 </p>
        </>
    }



    const addAmount = () => {
        if (amount >= stock){
            return
        }
        setAmount(amount + 1)
    }

    const subAmount = () => {
        if (amount <= 1){
            return
        }
        setAmount(amount - 1)
    }

    return <>
        <div>
            <div>
                <button className={styles.btn} onClick={subAmount}> - </button>
                <span className={styles.amount}>{amount}</span>
                <button className={styles.btn} onClick={addAmount}> + </button>
            </div>
            <p className={styles.stock}>Stock: {stock} </p>
        </div>
    </>
}