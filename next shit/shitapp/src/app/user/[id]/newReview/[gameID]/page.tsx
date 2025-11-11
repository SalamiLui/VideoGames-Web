'use client'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";
import Header from "@/app/components/Header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";



export interface Review {
  id: number | undefined;
  user_id: number | undefined;
  videogame_id: number | undefined;
  rating: number;
  comment: string ;
  modstatus: string | undefined;
  videogame_name : string | undefined
}

interface reviewProp {
  rating: number;
  comment: string ;

}

export default function NewReview(){
    const userID = localStorage.getItem("userID")
    if (!userID){
        window.location.href = "/login"
        return
    }

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const params = useParams()
    const gameID = params.gameID

    const [review, setReview] = useState<Review>()

    const [showError, setShowError] = useState(false)
    const [infoError, setInfoError] = useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
        setShowError: setShowError,
        setInfoError: setInfoError
    }

    const getReview = async () => {
        // router.GET("/users/:id/games/:gameID", controllers.GetReviewByUserAndGame)
        const API_URL = "http://localhost:8080/users/"+userID+"/games/"+gameID+"/review"
        const token = localStorage.getItem("token")
        try{
            const res = await fetch(API_URL, {
                headers:{

                    "Authorization": `Bearer ${token}`
                }

            })
            const data = await res.json()
            if (!res.ok){
                if (res.status === 404 && data.error === "review not found"){return}
                triggerError(data, t , res.status)
                return
            }
            setReview(data)
            if (review){
                setRating(review.rating)
            }

        }catch{
            triggerNetworkError(t)
        }
    }

    useEffect(()=>{
        getReview()
    }, [])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const data: reviewProp = {
            comment: String(String(formData.get("Comment"))),
            rating: Number(formData.get("Rating")),
        };

        uplaodReview(data)



    }

    const uplaodReview= async (r : reviewProp) => {
        // router.PUT("/users/:id/games/:gameID/review", controllers.CreateOrUpdateReview)
        const API_URL = "http://localhost:8080/users/"+userID+"/games/"+gameID+"/review"
        const token = localStorage.getItem("token")
        try{
            const res = await fetch(API_URL, {
                method:"PUT",
                body: JSON.stringify(r),
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (!res.ok){
                triggerError(data, t, res.status)
                return
            }
            window.location.href = "/user/" +userID+"/reviews"


        }
        catch{
            triggerNetworkError(t)
        }

    }



    return (
        <div>
            <div className="absolute inset-0 bg-black/70"></div>

            <div className="relative z-10">
            <Header></Header>

            <div className="flex justify-center items-center min-h-[80vh] flex-col">

                <h2 className="text-3xl md:text-4xl font-bold text-red-800 mb-6 drop-shadow-[0_0_6px_rgba(139,0,0,0.4)] tracking-wider">
                    Review {review?.videogame_name}
                </h2>
                <form
                onSubmit={handleSubmit}
                className="bg-black/40 backdrop-blur-sm p-8 rounded-lg border border-red-900/30 shadow-[0_0_15px_2px_rgba(139,0,0,0.3)] space-y-4 w-[90%] max-w-md"
                >

                <div className="text-gray-200 font-medium">

                <div className="text-gray-200 font-medium">
                    <p className="mb-1 text-red-700">Rating:</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                        <label key={num} className="cursor-pointer">
                            <input
                            type="radio"
                            name={"Rating"}
                            value={num}
                            checked={rating === num}
                            onChange={() => setRating(num)}
                            className="hidden"
                            />
                            <span
                            onMouseEnter={() => setHover(num)}
                            onMouseLeave={() => setHover(0)}
                            className={`text-2xl ${
                                num <= (hover || rating)
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                            >
                            ★
                            </span>
                        </label>
                        ))}
                    </div>
                </div>
                </div>


                <label className="text-gray-200 font-medium block">
                    <p className="mb-1 text-red-700">Comment:</p>
                    <textarea
                        name="Comment"
                        required
                        defaultValue={review?.comment}
                        className="w-full h-28 bg-black/60 text-gray-200 border border-red-900/40 rounded px-3 py-2
                                focus:outline-none focus:border-red-700 focus:shadow-[0_0_8px_rgba(139,0,0,0.6)]
                                placeholder-gray-500 resize-none"
                        placeholder="Enter comment"
                    />
                </label>


                <button
                    type="submit"
                    className="w-full py-2 mt-4 bg-red-900 hover:bg-red-800 text-gray-200 font-semibold border border-red-700 rounded shadow-[0_0_10px_rgba(139,0,0,0.5)] hover:shadow-[0_0_15px_rgba(139,0,0,0.7)] transition duration-200"
                >
                    Submit
                </button>
                </form>
            </div>
            </div>



            {showError && infoError && (
                <ErrorCard
                description={infoError.description}
                errorNumber={infoError.errorNumber}
                onClose={()=>setShowError(false)}></ErrorCard>
            )}
        </div>
    )
}