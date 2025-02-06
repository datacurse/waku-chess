import { RxCross2 } from "react-icons/rx";
import { FaRegClock } from "react-icons/fa6";
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { socket } from "@/socket";
import { TbArrowBackUp } from "react-icons/tb";

export default function OfferTakeback() {
  const snap = useSnapshot(store);

  function offerTakeback() {
    socket.emit("command", { type: "propose_takeback" })
  }

  function cancelTakebackOffer() {
    socket.emit("command", { type: "cancel_takeback_offer" })
  }

  function Default() {
    return (
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={offerTakeback}
      >
        <TbArrowBackUp size={16} />
        <div>Offer takeback</div>
      </div>
    )
  }

  function Wait() {
    return (
      <div
        className="flex items-center justify-between space-x-2 cursor-pointe"
      >
        <div className="flex space-x-2 items-center">
          <FaRegClock className="" />
          <div>Waiting...</div>
        </div>
        <div
          className="flex space-x-2 items-center"
          onClick={cancelTakebackOffer}
        >
          <RxCross2 className="text-cross" size={20} />
          <div>Cancel</div>
        </div>
      </div>
    )
  }


  return (
    <div className="w-full">
      {!snap.me?.offers.takeback && <Default />}
      {snap.me?.offers.takeback && <Wait />}
    </div>
  );
}


