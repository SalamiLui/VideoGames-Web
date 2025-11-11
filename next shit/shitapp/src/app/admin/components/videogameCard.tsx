import { VideoGame } from "@/app/home/types";

interface Props {
    game : VideoGame
    onDelete : (endpoint : string) => Promise<boolean>
    onRefresh : (key : string) => Promise<void>
}
export function VideogameAdminCard({game, onDelete, onRefresh}: Props){

    const handleDelete = async () => {
        const ok = await onDelete("videogames/" + game.id)
        if (ok) await onRefresh("videogames")

    }
return (
  <div
    className="
      p-4 mb-4 rounded-md
      bg-neutral-950/95
      border border-neutral-900
      shadow-[0_0_8px_rgba(0,0,0,0.7)]
      transition-all duration-150
      hover:border-red-700/40
      hover:shadow-[0_0_12px_rgba(160,0,0,0.35)]
      text-gray-300
    "
  >
    {/* Título del juego */}
    <h2 className="text-xl font-bold text-gray-200 mb-3 hover:text-red-500/80 transition-colors">
      {game.title}
    </h2>

    {/* Stock físico */}
    <div className="mb-2">
      <p>
        <span className="text-red-600/60">Physical Stock:</span> {game.phy_stock}
      </p>
    </div>

    {/* Stock digital */}
    <div className="mb-3 flex items-center justify-between">
      <p>
        <span className="text-red-600/60">Digital Stock:</span> {game.dig_stock}
      </p>
      <button
        className="
          px-3 py-1 text-sm font-medium rounded-md
          bg-red-700/70 text-white
          hover:bg-red-600 hover:shadow-[0_0_10px_#b30000]
          transition active:scale-[0.97]
        "
        onClick={()=>window.location.href = "/admin/newCDKey/"+game.id}>
        New CDKey
      </button>
    </div>

    {/* Acciones */}
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => (window.location.href = '/games/' + game.id)}
        className="
          px-3 py-1 text-sm font-medium rounded-md
          bg-neutral-700 text-gray-200
          hover:bg-neutral-600 hover:shadow-[0_0_6px_#666]
          transition active:scale-[0.97]
        "
      >
        View
      </button>

      <button
        className="
          px-3 py-1 text-sm font-medium rounded-md
          bg-blue-700/70 text-white
          hover:bg-blue-600 hover:shadow-[0_0_8px_#3388ff]
          transition active:scale-[0.97]
        "
        onClick={()=>window.location.href = "/admin/createUpdateVideogame?gameID="+game.id}>
        Modify
      </button>

      <button
        onClick={handleDelete}
        className="
          px-3 py-1 text-sm font-medium rounded-md
          bg-red-800/70 text-white
          hover:bg-red-700 hover:shadow-[0_0_8px_#ff0000]
          transition active:scale-[0.97]
        "
      >
        Delete
      </button>
    </div>
  </div>
);




}