import { useState, useEffect } from "react";
import styles from "./Register.module.css"
import { SetStateAction } from "react";
import { Dispatch } from "react";

interface Props {
    label: string;
    texts: string[];
    setExIndex : Dispatch<SetStateAction<number>> | null

}

const handleClickSound = () => {
    const audio = new Audio('/sounds/minecraft_button_sound.mp3');
    audio.play();
}

export default function ChangingButtonText( { label, texts, setExIndex } : Props) {
    const [index, setIndex] = useState(0);

    const changeText = () => {
        setIndex((prevIndex) => (prevIndex + 1) % texts.length);
        if (setExIndex) {
            setExIndex(index)
            console.log(index)
        }
        handleClickSound();
    }

    return <>
    <button
        onClick={changeText}
        className={styles.Button}
        type="button">
        {label} {texts[index]}
    </button>
    </>
}


