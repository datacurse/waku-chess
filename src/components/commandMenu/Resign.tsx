import { useState } from "react";
import { GiFlyingFlag } from "react-icons/gi";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { resign } from "@/storeFunctions/commandMenu";

export default function Resign() {
  const [prompt, setPrompt] = useState(false);
  return (
    <div className="w-full">
      {!prompt ? (
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setPrompt(true)}>
          <GiFlyingFlag />
          <div>Resign</div>
        </div>
      ) : (
        <div
          className="flex items-center justify-between space-x-2 cursor-pointe"
        >
          <div className="flex space-x-2 items-center"
            onClick={() => {
              setPrompt(false);
              resign();
            }}
          >
            <FaCheck className="text-check" />
            <div>Resign</div>
          </div>
          <div className="flex space-x-2 items-center"
            onClick={() => setPrompt(false)}
          >
            <RxCross2 className="text-cross" size={20} />
            <div>Cancel</div>
          </div>
        </div>
      )}
    </div>
  );
}

