import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { socket } from "@/socket";
import { store } from "@/store";

export function TakebackOfferAlert() {
  function acceptTakeback() {
    socket.emit("accept a takeback")
    store.modals.commandMenu = false
  }

  function declineTakeback() {
    socket.emit("decline a takeback")
    store.modals.commandMenu = false
  }

  return (
    <div>
      <div>Your opponent proposes a takeback</div>
      <div
        className="flex items-center justify-between space-x-2 cursor-pointe"
      >
        <div
          className="flex space-x-2 items-center"
          onClick={acceptTakeback}
        >
          <FaCheck className="text-check" />
          <div>Accept</div>
        </div>
        <div
          className="flex space-x-2 items-center"
          onClick={declineTakeback}
        >
          <RxCross2 className="text-cross" size={20} />
          <div>Decline</div>
        </div>
      </div>
    </div>
  )
}


