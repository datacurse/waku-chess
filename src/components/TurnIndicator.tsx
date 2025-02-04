export function TurnIndicator({ isMoving, isMe }: {
  isMoving: boolean,
  isMe: boolean
}) {
  return (
    <div className={`py-4 ${isMoving ? 'px-2 bg-timer' : ''} text-text font-semibold text-sm`}>
      <div className="h-5">
        {isMoving && (isMe ? "Your turn" : "Waiting for opponent")}
      </div>
    </div>

  )
}
