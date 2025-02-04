export function OnlineIndicator({ isOnline }: {
  isOnline: boolean
}) {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12">
      {isOnline ? (
        <circle cx="6" cy="6" r="5" fill="#629924" />
      ) : (
        <circle cx="6" cy="6" r="4" fill="none" stroke="#bababa" strokeWidth="2" />
      )}
    </svg>
  )
}
