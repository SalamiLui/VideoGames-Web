import { CreditCard } from "./CardInfo"

interface Props {
    card : CreditCard
}
export default function CreditCardResume({card} : Props){
    return <>
    <div>
        <h1>Holder: {card.CardHolder}</h1>
        <p>Number: {card.CardNumber}</p>
        <p>Expiration: {card.ExpirationDate.toLocaleDateString()}</p>
    </div>
    </>
}