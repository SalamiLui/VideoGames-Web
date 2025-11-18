'use client'

import { useEffect } from "react";

import { useRef } from "react";

export function Screamer() {
const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.1;
        audio.play().catch(() => {
            console.log("shit browser");
        });

        const handleUserInteraction = () => {
            audio.play().catch(() => {
                console.log("shit browser x2");
            });
        };

        document.addEventListener("click", handleUserInteraction, { once: true });
        document.addEventListener("touchstart", handleUserInteraction, { once: true });

        return () => {
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("touchstart", handleUserInteraction);
        };
    }, []);



    return (
        <div className="flex flex-col justify-center items-center w-screen h-screen bg-black text-red-600 text-center overflow-hidden">
            <audio ref={audioRef}
             src="/sounds/jeff.mp3" loop ></audio>
            <img
                src="/images/jeff.gif"
                alt="jeff"
                className="max-w-[80%] max-h-[70%] object-contain"
            />
            <p className="mt-5 text-3xl font-bold">
                Where u goin bitch?
            </p>
        </div>
    )
}

