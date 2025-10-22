'use client'
import { useParams } from "next/navigation"
import Header from "@/app/components/Header";
import styles from "./cart.module.css"

export default function Cart(){
    const params = useParams();
    const userID =  params.id;

    return <>
    <div className={styles.pageWrap}>
    <Header></Header>

    </div>

    </>
}