import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { socket } from "@/socket";
import { store } from "@/store";

export function DrawOfferAlert() {
  function acceptDraw() {
    socket.emit("command", { type: "accept_draw" })
    store.modals.commandMenu = false
  }

  function declineDraw() {
    socket.emit("command", { type: "decline_draw" })
    store.modals.commandMenu = false
  }

  return (
    <div>
      <div>Your opponent offers a draw</div>
      <div
        className="flex items-center justify-between space-x-2 cursor-pointe"
      >
        <div
          className="flex space-x-2 items-center"
          onClick={acceptDraw}
        >
          <FaCheck className="text-check" />
          <div>Accept</div>
        </div>
        <div
          className="flex space-x-2 items-center"
          onClick={declineDraw}
        >
          <RxCross2 className="text-cross" size={20} />
          <div>Decline</div>
        </div>
      </div>
    </div>
  )
}

