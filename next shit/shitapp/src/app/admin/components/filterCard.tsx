export interface filter {
    id: number
    name : string
}

export type filterType = "genres" | "platforms" | "labels";

type Props<T extends filter> = {
    filter : T
    type : filterType
    onDelete : (endpoint : string) => Promise<boolean>
    onRefresh : (key : string) => Promise<void>
}
export function FilterAdminCard<T extends filter>({filter, onDelete, onRefresh, type} : Props<T>){

    const handleDelete = async ()=>{
        const ok = await onDelete(type+"/"+filter.id)
        if (ok) await onRefresh(type)
    }


return (
  <div
    className="
      p-3 mb-4 rounded-md
      bg-neutral-950/95
      border border-neutral-900
      shadow-[0_0_6px_rgba(0,0,0,0.6)]
      transition-all duration-150
      hover:border-red-700/40
      hover:shadow-[0_0_10px_rgba(160,0,0,0.3)]
      text-gray-300
      flex items-center justify-between
    "
  >
    {/* Nombre del filtro */}
    <p className="text-sm">
      <span className="text-red-600/60">Name:</span> {filter.name}
    </p>

    {/* Acciones */}
    <div className="flex gap-2">
      <button
        className="
          px-3 py-1 text-xs font-medium rounded-md
          bg-blue-700/70 text-white
          hover:bg-blue-600 hover:shadow-[0_0_8px_#3388ff]
          transition active:scale-[0.97]
        "
        onClick={()=>window.location.href  ="/admin/createUpdateFilter/"+type+"?filterID="+filter.id}>
        Modify
      </button>

      <button
        onClick={handleDelete}
        className="
          px-3 py-1 text-xs font-medium rounded-md
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