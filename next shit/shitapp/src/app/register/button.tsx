import { useState, useEffect } from "react";
import styles from "./Register.module.css"

interface Props {
    label: string;
    texts: string[];
}

const handleClickSound = () => {
    const audio = new Audio('/sounds/minecraft_button_sound.mp3');
    audio.play();
}

export default function ChangingButtonText( { label, texts } : Props) {
    const [index, setIndex] = useState(0);

    const changeText = () => {
        setIndex((prevIndex) => (prevIndex + 1) % texts.length);
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