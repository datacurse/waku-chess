import { give15seconds } from "@/storeFunctions/commandMenu";
import { FaPlusSquare } from "react-icons/fa";

export default function Give15Seconds() {
  return (
    <div
      className='flex items-center space-x-2'
      onClick={() => give15seconds()}
    >
      <FaPlusSquare />
      <div>Give 15 seconds</div>
    </div>

  );
}


