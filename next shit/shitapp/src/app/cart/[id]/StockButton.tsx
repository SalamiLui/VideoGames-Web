import { CartItem } from "./types";

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
                <button onClick={subAmount}> - </button>
                <span>{amount}</span>
                <button onClick={addAmount}> + </button>
            </div>
            <p>Stock: {stock} </p>
        </div>
    </>
}