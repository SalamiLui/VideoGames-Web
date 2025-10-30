import {Direction} from "./page"
import styles from "./direction.module.css"

interface Prop {
    direction : Direction
    selected? : boolean
    onClick?: ()=>void
}
export default function DirectionCard({direction, selected, onClick} : Prop){
    /* return <>
    <div>
        <p>City: {direction.city}</p>
        <p>State: {direction.state}</p>
        <p>Street: {direction.street}</p>
        <p>Zip: {direction.zip}</p>
        <p>Number: {direction.number}</p>
    </div>
    </> */

      return (
    <div className="bg-black text-white border border-black rounded-lg p-4 shadow-md hover:shadow-red-900 transition-shadow duration-300">
      <p className="text-xl font-bold mb-2 border-b border-red-900 pb-1">{direction.city}</p>
      <div className="flex flex-col gap-1 text-gray-200">
        <p>State: {direction.state}</p>
        <p>Street: {direction.street}</p>
        <p>Zip: {direction.zip}</p>
        <p>Number: {direction.number}</p>
      </div>
    </div>
  );

      return (
    <div className="bg-gray-900 text-gray-100 border border-gray-700 rounded-lg p-4 shadow-md hover:shadow-red-800 transition-shadow duration-300">
      <p className="text-xl font-bold mb-2 border-b border-gray-700 pb-1">{direction.city}</p>
      <div className="flex flex-col gap-1 text-gray-300">
        <p>State: {direction.state}</p>
        <p>Street: {direction.street}</p>
        <p>Zip: {direction.zip}</p>
        <p>Number: {direction.number}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-gray-100 border border-gray-700 rounded-lg p-4 shadow-md hover:shadow-red-800 transition-shadow duration-300">
      <p className="text-xl font-bold mb-2 border-b border-gray-700 pb-1">{direction.city}</p>
      <div className="flex flex-col gap-1 text-gray-300">
        <p>State: {direction.state}</p>
        <p>Street: {direction.street}</p>
        <p>Zip: {direction.zip}</p>
        <p>Number: {direction.number}</p>
      </div>
    </div>
  );








}

