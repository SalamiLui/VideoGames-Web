
"use client";

import { useEffect, useState } from "react"
import styles from "./Login.module.css"
import Header from "../components/Header";
import { UserLogin } from "./types";
import { FormEvent } from "react";


interface ApiResponseSuccess {
  message: string;
}

interface ApiResponseError {
  error: string;
}

const handleClick = () => {
    const audio = new Audio('/sounds/minecraft_button_sound.mp3');
    audio.play();
}

const API_URL = "http://localhost:8081/login";


export default function Login() {
     const [username, setUsername] = useState("");
     const [password, setPassword] = useState("");
     const [errorMessage, setErrorMessage] = useState<string | null>(null);

     const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrorMessage(null);

        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username : username,
                password : password,
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            setErrorMessage((data as ApiResponseError).error);
            return;
        }
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        window.location.href = "/home";
     }

    return <>
    <div className={styles.pageWrap}>
        <Header></Header>
        <div className={styles.main}>
            <div className={styles.container}>
                <form onSubmit={handleLogin} className={styles.form}>
                    <h2 className={styles.title}>Singleplayer</h2>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                        required>
                    </input>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required>
                    </input>
                    {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                    <div className={styles.buttons}>
                        <button
                            type="submit"
                            className={styles.loginButton}
                            onClick={() => {
                                handleClick();
                                handleLogin;}}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                handleClick();
                                setTimeout  (() => {
                                    window.location.href = "/register";
                                }, 600);}}
                            className={styles.createButton}
                        >
                            Create New Account
                        </button>
                    </div>
                    < a href="/imFatFuckMoronThatDontRememberHisAccount" className={styles.recoverLink}>
                        Forget Password?
                    </a>

                </form>
            </div>

        </div>


    </div>


    </>
}