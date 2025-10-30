'use client'
import { useState } from "react";
import CardInfoForm from "./CardInfo";
import { useSearchParams } from "next/navigation";
import PurchaseSum from "./PurchaseSum";
import { CreditCard } from "./CardInfo";

export default function Checkout(){
    const [step, setStep] = useState(1)
    const [card, setCard] = useState<CreditCard | null>(null)
    const searchP = useSearchParams()
    const direction = searchP.get("direction")

    switch(step){
        case 1:
            return <CardInfoForm  setStep={setStep} setCard={setCard}></CardInfoForm>

        case 2:
            return  <PurchaseSum  setStep={setStep} direction={direction} card={card}></PurchaseSum>

    }
}