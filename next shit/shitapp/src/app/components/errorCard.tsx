import React from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";

type ErrorCardProps = {
  errorNumber: string | number;
  description: string;
  onClose: () => void;
};

export type ErrorInfo = {
    errorNumber: string | number;
    description : string
}

export interface triggerErrorProp{
    setInfoError: Dispatch<SetStateAction<ErrorInfo | null>>,
    setShowError: Dispatch<SetStateAction<boolean>>,
}
export function triggerError(data: any, t : triggerErrorProp, status:number| string){
    const errorMsg = data.message || data.error || "Error desconocido";
    const err : ErrorInfo = {
        errorNumber:status,
        description:errorMsg,
    }
    t.setInfoError(err)
    t.setShowError(true)
}
export function triggerNetworkError(t : triggerErrorProp, error : string | null = null)  {
    const err: ErrorInfo = {
          errorNumber:666,
          description:(error || "Network error, please go f*ck somewhere else")
        }
        t.setInfoError(err)
        t.setShowError(true)
}


const ErrorCard: React.FC<ErrorCardProps> = ({ errorNumber, description, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative bg-black/80 text-gray-200 p-8 rounded-lg w-11/12 max-w-md border border-red-900 shadow-[0_0_15px_rgba(139,0,0,0.5)] z-10 flex flex-col items-center space-y-4">
        <img src={"/images/jeff.gif"} alt="Error GIF" className="w-24 h-24 object-contain" />

        <h1 className="text-5xl font-bold text-red-800">{errorNumber}</h1>

        <p className="text-center text-gray-300">{description}</p>

        <button
          onClick={onClose}
          className="mt-2 bg-red-900 hover:bg-red-800 text-gray-200 font-semibold py-2 px-6 rounded border border-red-700"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorCard;