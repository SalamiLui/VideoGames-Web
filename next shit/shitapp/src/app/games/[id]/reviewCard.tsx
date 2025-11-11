import { Review } from "../../home/types"

interface Props {
    review : Review
}

export default function ReviewCard({ review }: Props) {
  // Calcular estrellas basadas en el rating
  const totalStars = 5;
  const stars = Array.from({ length: totalStars }, (_, i) => i < review.rating);

  return (
  <div
    className="
      relative group rounded-md overflow-hidden
      bg-black/80 border border-neutral-900
      shadow-[0_0_6px_rgba(0,0,0,0.8)]
      hover:border-red-700/40
      hover:shadow-[0_0_12px_rgba(160,0,0,0.35)]
      transition-all duration-150
      cursor-default
    "
  >
    {/* Glitch overlay */}
    <div
      className="
        absolute inset-0 opacity-0 group-hover:opacity-[0.12]
        pointer-events-none mix-blend-screen
        bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.15),transparent)]
        animate-[glitch_0.25s_ease-in-out]
      "
    ></div>

    {/* Contenido */}
    <div className="relative z-10 p-4 flex flex-col gap-3 text-gray-300 font-sans">
      {/* Encabezado: Usuario, Rating, ModStatus */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        {/* Usuario + estrellas */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700">
            <span className="text-red-600 text-lg">👤</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-400 uppercase tracking-widest">
              {review.username}
            </span>

            <div className="flex gap-1">
              {stars.map((filled, idx) => (
                <span
                  key={idx}
                  className={`text-xs ${
                    filled ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Badge de moderación */}
        <span
          className={`
            px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide
            ${
              review.modstatus === 'approved'
                ? 'bg-green-800/40 text-green-400 border border-green-700/50'
                : review.modstatus === 'rejected'
                ? 'bg-red-800/40 text-red-400 border border-red-700/50'
                : 'bg-yellow-700/40 text-yellow-300 border border-yellow-600/50'
            }
          `}
        >
          {review.modstatus}
        </span>
      </div>

      {/* Comentario */}
      <div
        className="
          relative max-h-40 overflow-y-auto pr-2 text-sm leading-relaxed
          scrollbar-thin scrollbar-thumb-red-800 scrollbar-track-neutral-900
        "
      >
        <p className="text-gray-300 whitespace-pre-line">{review.comment}</p>
      </div>
    </div>

    {/* Keyframes para glitch y scrollbar */}
    <style>
      {`
        @keyframes glitch {
          0% { transform: translate(0); opacity: 0.1; }
          30% { transform: translate(-1px, 1px); opacity: 0.4; }
          60% { transform: translate(1px, -1px); opacity: 0.25; }
          100% { transform: translate(0); opacity: 0.1; }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb {
          background: rgba(153, 0, 0, 0.6);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(200, 0, 0, 0.8);
        }
        ::-webkit-scrollbar-track {
          background: rgba(20, 20, 20, 0.8);
        }
      `}
    </style>
  </div>
);



}