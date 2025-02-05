export function TurnIndicator({ isMoving, isMe, isGameOver }: {
  isMoving: boolean,
  isMe: boolean,
  isGameOver: boolean,
}) {
  return (
    <>
      {!isGameOver && isMoving ? (
        <div className="py-4 px-2 bg-timer text-text font-semibold text-sm">
          <div className="h-5">
            {isMe ? "Your turn" : "Waiting for opponent"}
          </div>
        </div>
      ) : (
        <div className="h-[52px]" />
      )}
    </>
  )
}
