import { RxCross2 } from "react-icons/rx";
import { FaRegClock } from "react-icons/fa6";
import { BsStarHalf } from "react-icons/bs";
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { socket } from "@/socket";

export default function OfferDraw() {
  const snap = useSnapshot(store);

  function offerDraw() {
    socket.emit("command", { type: "offer_draw" })
  }

  function cancelDrawOffer() {
    socket.emit("command", { type: "cancel_draw_offer" })
  }

  function Default() {
    return (
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={offerDraw}
      >
        <BsStarHalf />
        <div>Offer draw</div>
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
          onClick={cancelDrawOffer}
        >
          <RxCross2 className="text-cross" size={20} />
          <div>Cancel</div>
        </div>
      </div>
    )
  }


  return (
    <div className="w-full">
      {!snap.me?.offers.draw && <Default />}
      {snap.me?.offers.draw && <Wait />}
    </div>
  );
}

