'use client'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from "@/app/components/errorCard";
import Header from "@/app/components/Header";
import { Genre, Label, Platform, VideoGame } from "@/app/home/types";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateVideogamePage(){
    const params = useSearchParams()
    const videogameID = params.get("gameID")

    const [game, setGame]= useState<VideoGame>()

    const [showError, setShowError]= useState(false)
    const [infoError, setInfoError]= useState<ErrorInfo | null>(null)
    const t : triggerErrorProp = {
      setShowError: setShowError,
      setInfoError: setInfoError
    }

    const [genresOptions, setGenresOptions] = useState<Genre[]>([])
    const [platformsOptions, setPlatformsOptions] = useState<Platform[]>([])
    const [labelsOptions, setLabelsOptions] = useState<Label[]>([])

    const getFilters = async () => {
      // router.GET("/filters", controllers.GetFilters)
      const API_URL = "http://localhost:8080/filters"
      try {
        const res = await fetch(API_URL)
        const data = await res.json()
        if (!res.ok){
          triggerError(data,t, res.status)
          return
        }
        setGenresOptions(data.genres)
        setLabelsOptions(data.labels)
        setPlatformsOptions(data.platforms)

      }
      catch {
        triggerNetworkError(t)

      }
    }

    const initVideogame =  async () => {
        const API_URL = "http://localhost:8080/videogames/" + videogameID
        const token = localStorage.getItem("token")
        try {
          const res = await fetch(API_URL, {
            headers : {
                  "Authorization": `Bearer ${token}`,
            }
          })
          const data = await res.json()
          if (!res.ok){
            triggerError(data, t, res.status)
            return
          }
          setGame(data)
        }
        catch{
          triggerNetworkError(t)

        }



    }

    const uploadVideoGame = async (videogame : any)=>{
		// authGroup.POST("/videogames", controllers.CreateVideogame)
		// authGroup.PUT("/videogames/:id", controllers.UpdateVideogame)
        let API_URL = "http://localhost:8080/videogames"
        let met = "POST"
        const token = localStorage.getItem("token")
        if (videogameID){
          met = "PUT"
          API_URL += "/"+game?.id
        }
        try {
            const res = await fetch (API_URL, {
              method: met,
              headers : {
                  "Authorization": `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(videogame)
            })
            const data = await res.json()
            if (!res.ok){
              triggerError(data, t, res.status)
              return
            }
            window.location.href = "/admin"
        }
        catch{
          triggerNetworkError(t)

        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);

          const data: VideoGame = {
              title: (String(formData.get("title"))),
              release_year: Number(formData.get("release_year")),
              developer: (String(formData.get("developer"))),
              price: (Number(formData.get("price"))),
              synopsis: (String(formData.get("synopsis"))),
              phy_stock: (Number(formData.get("phy_stock"))),
              dig_stock: 0,
              pegi: (Number(formData.get("pegi"))),
              min_req: (String(formData.get("min_req"))),
              rating: (Number(formData.get("rating"))),
              image_url: (String(formData.get("image_url"))),
              reviews: [],
              id: 0,
          };

          const payload: Omit<VideoGame, "genre" | "platform" | "label"> & {
            genre: Partial<Genre>[];
            platform: Partial<Platform>[];
            label: Partial<Label>[];
          } = {
            ...data,
            genre: selectedGenres.map((id) => ({ id })),
            platform: selectedPlatforms.map((id) => ({ id })),
            label: selectedLabels.map((id) => ({ id })),
          };


          uploadVideoGame(payload)
      }


      useEffect(()=>{
        // if (videogameID)
        if (videogameID) initVideogame()
          getFilters()
      }, [])

      const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([])
  const [selectedLabels, setSelectedLabels] = useState<number[]>([])

  // ✅ Si existe un videojuego cargado, inicializamos los valores seleccionados
  useEffect(() => {
    if (game) {
      setSelectedGenres(game.genre?.map((g) => g.id) || [])
      setSelectedPlatforms(game.platform?.map((p) => p.id) || [])
      setSelectedLabels(game.label?.map((l) => l.id) || [])
    }
  }, [game])


    const handleCheckboxChange = (
    id: number,
    selectedArray: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    if (selectedArray.includes(id)) {
      setter(selectedArray.filter((x) => x !== id))
    } else {
      setter([...selectedArray, id])
    }
  }


    return (
  <div className="min-h-screen bg-black text-gray-200 font-sans relative overflow-hidden">
    <Header />

    {/* Fondo glitch leve */}
    <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.12),transparent)] animate-[glitch_1.8s_infinite_ease-in-out]" />

    {/* Contenedor principal */}
    <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-red-500 tracking-wide uppercase">
        {game ? "Edit Videogame: " + game.title : "New Videogame"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-neutral-950/70 border border-neutral-800 rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.1)] p-8 flex flex-col gap-6 backdrop-blur-sm"
      >
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm text-gray-400 tracking-wide">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={game?.title || ""}
            required
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all"
          />
        </div>


        {/* === Genres === */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400 tracking-wide">Genres</label>
        <div className="bg-neutral-900 border border-neutral-800 rounded-md p-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-neutral-800">
          {genresOptions.map((g) => (
            <label key={g.id} className="flex items-center gap-2 text-gray-300 text-sm mb-1">
              <input
                type="checkbox"
                value={g.id}
                checked={selectedGenres.includes(g.id)}
                onChange={() => handleCheckboxChange(g.id, selectedGenres, setSelectedGenres)}
                className="accent-red-700 bg-neutral-800 rounded"
              />
              {g.name}
            </label>
          ))}
        </div>
      </div>

      {/* === Platforms === */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400 tracking-wide">Platforms</label>
        <div className="bg-neutral-900 border border-neutral-800 rounded-md p-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-neutral-800">
          {platformsOptions.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-gray-300 text-sm mb-1">
              <input
                type="checkbox"
                value={p.id}
                checked={selectedPlatforms.includes(p.id)}
                onChange={() => handleCheckboxChange(p.id, selectedPlatforms, setSelectedPlatforms)}
                className="accent-red-700 bg-neutral-800 rounded"
              />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      {/* === Labels === */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400 tracking-wide">Labels</label>
        <div className="bg-neutral-900 border border-neutral-800 rounded-md p-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-neutral-800">
          {labelsOptions.map((l) => (
            <label key={l.id} className="flex items-center gap-2 text-gray-300 text-sm mb-1">
              <input
                type="checkbox"
                value={l.id}
                checked={selectedLabels.includes(l.id)}
                onChange={() => handleCheckboxChange(l.id, selectedLabels, setSelectedLabels)}
                className="accent-red-700 bg-neutral-800 rounded"
              />
              {l.name}
            </label>
          ))}
        </div>
      </div>






        {/* Release Year */}
        <div className="flex flex-col gap-1">
          <label htmlFor="release_year" className="text-sm text-gray-400 tracking-wide">
            Release Year
          </label>
          <input
            type="number"
            id="release_year"
            name="release_year"
            defaultValue={game?.release_year || ""}
            required
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all"
          />
        </div>

        {/* Developer */}
        <div className="flex flex-col gap-1">
          <label htmlFor="developer" className="text-sm text-gray-400 tracking-wide">
            Developer
          </label>
          <input
            type="text"
            id="developer"
            name="developer"
            defaultValue={game?.developer || ""}
            required
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all"
          />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <label htmlFor="price" className="text-sm text-gray-400 tracking-wide">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            id="price"
            name="price"
            defaultValue={game?.price || 0}
            required
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all"
          />
        </div>

        {/* Synopsis */}
        <div className="flex flex-col gap-1">
          <label htmlFor="synopsis" className="text-sm text-gray-400 tracking-wide">
            Synopsis
          </label>
          <textarea
            id="synopsis"
            name="synopsis"
            rows={4}
            defaultValue={game?.synopsis || ""}
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all resize-none"
          ></textarea>
        </div>

        {/* Physical Stock */}
        <div className="flex flex-col gap-1">
          <label htmlFor="phy_stock" className="text-sm text-gray-400 tracking-wide">
            Physical Stock
          </label>
          <input
            type="number"
            id="phy_stock"
            name="phy_stock"
            defaultValue={game?.phy_stock || 0}
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all"
          />
        </div>

        {/* PEGI */}
        <div className="flex flex-col gap-1">
          <label htmlFor="pegi" className="text-sm text-gray-400 tracking-wide">
            PEGI
          </label>
          <input
            type="number"
            id="pegi"
            name="pegi"
            min={3}
            max={18}
            step={1}
            defaultValue={game?.pegi || ""}
            required
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all"
          />
        </div>

        {/* Minimum Requirements */}
        <div className="flex flex-col gap-1">
          <label htmlFor="min_req" className="text-sm text-gray-400 tracking-wide">
            Minimum Requirements
          </label>
          <textarea
            id="min_req"
            name="min_req"
            rows={3}
            defaultValue={game?.min_req || ""}
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all resize-none"
          ></textarea>
        </div>

        {/* Image URL */}
        <div className="flex flex-col gap-1">
          <label htmlFor="image_url" className="text-sm text-gray-400 tracking-wide">
            Image URL
          </label>
          <input
            type="string"
            id="image_url"
            name="image_url"
            defaultValue={game?.image_url || ""}
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-700 outline-none transition-all"
          />
        </div>

        {/* Buttons */}
        <div className="pt-4">
          <button
            type="submit"
            className="bg-red-700 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md shadow-[0_0_10px_rgba(255,0,0,0.25)] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"
          >
            Save
          </button>
        </div>
      </form>
    </div>

    <style>
      {`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(1px, -1px); }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
          100% { transform: translate(0); }
        }
      `}
    </style>

    {showError && infoError && (
      <ErrorCard
      description={infoError.description}
      errorNumber={infoError.errorNumber}
      onClose={()=>setShowError(false)}
      />
    )}
  </div>
);



}