"use client"
import { text } from "stream/consumers";
import Header from "../components/Header";
import styles from "./Register.module.css"
import ChangingButtonText from "./button";
import {User} from "./type";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface ApiResponseSuccess {
  message: string;
}

interface ApiResponseError {
  error: string;
}



export default function Register() {

    const handleClickSound = () => {
        const audio = new Audio('/sounds/minecraft_button_sound.mp3');
        audio.play();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setUser({
            ...user,
            [name]: value,
        });

    }

    const router = useRouter();
    const [user, setUser] =  useState<User>({
        username: "",
        mail: "",
        password: "",
        passwordConfirm: "",
    })
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [cheatsIndex, setCheatsIndex] = useState(1)


    const handleSubmit = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (user.password !== user.passwordConfirm) {
            setErrorMessage("Passwords do not match");
            return;
        }
        if (user.password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long");
            return;
        }
        if (!user.mail){
            setErrorMessage("Email is required");
            return;
        }
        if (!user.username){
            setErrorMessage("Username is required");
            return;
        }
        if (!acceptedTerms) {
            setErrorMessage("You must accept our terms and conditions :)");
            return;
        }
        let API_URL = "http://localhost:8081/signup";
        let jwt : string | null = ""
        if (cheatsIndex === 0){
            API_URL += "/admin"
            jwt = localStorage.getItem("token")
        }

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    username: user.username,
                    mail: user.mail,
                    password: user.password,
                }),
            });

            const data: ApiResponseSuccess | ApiResponseError = await res.json();

            if (!res.ok) {
                setErrorMessage((data as ApiResponseError).error);
                return
            }
            setErrorMessage("Account created successfully, Redirecting to login...");
            setTimeout(() => {
                router.push("/login");
            }, 3000);

        }
        catch (error) {
            setErrorMessage("An error occurred. Please try again later.");
        }

    }




    return <>
    <div className={styles.pageWrap}>
        <Header></Header>
        <div  className={styles.main}>
            <div className={styles.container}>
                <form className={styles.form}>
                    <h2 className={styles.title}>New Player</h2>
                    <div className={styles.formContainer}>
                        <input
                            type="text"
                            placeholder="Username"
                            className={styles.input}
                            value={user.username}
                            onChange={handleChange}
                            name="username"
                            required>
                        </input>
                        <input
                            type="email"
                            placeholder="Email"
                            className={styles.input}
                            value={user.mail}
                            onChange={handleChange}
                            name="mail"
                            required>
                        </input>
                        <input
                            type="password"
                            placeholder="Password"
                            className={styles.input}
                            value={user.password}
                            onChange={handleChange}
                            name="password"
                            required>
                        </input>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={user.passwordConfirm}
                            onChange={handleChange}
                            name="passwordConfirm"
                            className={styles.input}
                            required>
                        </input>
                        <ChangingButtonText
                            label="Genre:"
                            texts={["Male","Washing machine"]}
                            setExIndex={null}>
                        </ChangingButtonText>
                        <ChangingButtonText
                            label="Difficulty:"
                            texts={["Peaceful","Easy","Normal","Hard"]}
                            setExIndex={null}>
                        </ChangingButtonText>
                        <ChangingButtonText
                            label="Skin Color:"
                            texts={["Black","Brown","Beige","White"]}
                            setExIndex={null}>
                        </ChangingButtonText>
                        <ChangingButtonText
                            label="Cheats:"
                            texts={["Off", "On"]}
                            setExIndex={setCheatsIndex}>

                        </ChangingButtonText>
                    </div>
                    <label className={styles.label}>
                        <input type="checkbox"></input>
                          Accept being a racist
                    </label>
                    <label className={styles.label}>
                        <input type="checkbox"
                                required
                                checked={acceptedTerms}
                                onChange={(e) =>  setAcceptedTerms(e.target.checked)}>
                        </input>
                        <span>
                          Accept Terms and Conditions and by my own free will cede my body and sould
                          to our lords Lucifer, Belial, Beelzebub, <a
                                                            href="/demons"
                                                            target="_blank"
                                                            rel="noopener noreferrer"> etc ...</a>

                        </span>
                    </label>
                    {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                    <button
                        onClick= {() => {
                            handleClickSound();
                            handleSubmit(event as unknown as FormEvent<HTMLFormElement>);
                        }}
                        className={styles.Button}
                        type="submit">
                        Create Account
                    </button>

                </form>
            </div>
        </div>
    </div>

    </>
}