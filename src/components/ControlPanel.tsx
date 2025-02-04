import { IconType } from "react-icons/lib";
import { ReactNode } from "react";
import { TfiMenuAlt } from "react-icons/tfi";
import { TbArrowBackUp } from "react-icons/tb";
import { FaArrowsRotate } from "react-icons/fa6";
import { AiOutlineBackward, AiOutlineForward } from "react-icons/ai";
import { store } from "@/store";
import { nextHistoryMove, openCommandMenuModal, openStartNewGameModal, prevHistoryMove, rotateBoard } from "@/storeFunctions/controlPanel";
import { useSnapshot } from "valtio";
import { cn } from "@udecode/cn"
import { IoLogoGameControllerB } from "react-icons/io";

interface ButtonProps {
  icon: IconType;
  size?: number;
  state?: 'default' | 'active' | 'inactive';
  children?: ReactNode;
  onClick?: () => void;
}

export function Button({
  icon: Icon,
  size = 20,
  state = 'default',
  children,
  onClick
}: ButtonProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 flex justify-center text-timer items-center w-full cursor-pointer transition-colors",
        state === 'default' && "text-text active:bg-bg-dark active:text-text-light",
        state === 'active' && "bg-bg-dark text-text-light",
        state === 'inactive' && "text-text-dark cursor-not-allowed"
      )}
    >
      <Icon size={size} />
      {children}
    </div>
  );
}

export function ControlPanel() {
  const snap = useSnapshot(store);
  const atStart = snap.inspectedMoveIndex === -1;
  const atEnd = snap.inspectedMoveIndex === snap.history.length - 1;
  const showStartNewGameButton = store.history.length < 2 || store.gameSnapshot?.isGameOver

  return (
    <div className="flex justify-between w-full">
      <Button
        icon={FaArrowsRotate}
        onClick={rotateBoard}
        state={snap.isBoardRotated ? 'active' : 'default'}
      />
      <Button icon={TbArrowBackUp} size={30} />
      {showStartNewGameButton ? (
        <Button
          icon={IoLogoGameControllerB}
          onClick={openStartNewGameModal}
        />
      ) : (
        <Button
          icon={TfiMenuAlt}
          onClick={openCommandMenuModal}
        />
      )}
      <Button
        icon={AiOutlineBackward}
        size={30}
        onClick={nextHistoryMove}
        state={atStart ? 'inactive' : 'default'}
      />
      <Button
        icon={AiOutlineForward}
        size={30}
        onClick={prevHistoryMove}
        state={atEnd ? 'inactive' : 'default'}
      />
    </div>
  );
}

