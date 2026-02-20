import VideoPlayer from "./VideoPlayer";

// Responsive grid that adapts columns based on participant count.
// Uses explicit grid sizing to prevent any overlap or overflow.
export default function VideoGrid({ localStream, localUsername, peers }) {
  const totalParticipants = (localStream ? 1 : 0) + peers.length;

  // Return Tailwind grid-cols classes based on total count.
  // Single source of truth — no conflicting flex/grid.
  const getGridClass = () => {
    switch (true) {
      case totalParticipants <= 1:
        return "grid-cols-1 max-w-4xl";
      case totalParticipants === 2:
        return "grid-cols-1 sm:grid-cols-2 max-w-5xl";
      case totalParticipants <= 4:
        return "grid-cols-1 sm:grid-cols-2 max-w-6xl";
      case totalParticipants <= 6:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl";
      case totalParticipants <= 9:
        return "grid-cols-2 sm:grid-cols-3 max-w-7xl";
      default:
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-7xl";
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-6">
      <div
        className={`grid gap-3 sm:gap-4 mx-auto ${getGridClass()}`}
      >
        {/* Local video tile */}
        {localStream && (
          <VideoTile>
            <VideoPlayer
              stream={localStream}
              muted={true}
              username={localUsername}
              isLocal={true}
            />
          </VideoTile>
        )}

        {/* Remote peer tiles */}
        {peers.map((peerObj) => (
          <VideoTile key={peerObj.socketId}>
            <VideoPlayer
              stream={peerObj.stream}
              username={peerObj.username || "Guest"}
              isLocal={false}
            />
          </VideoTile>
        ))}
      </div>
    </div>
  );
}

// Wrapper that enforces 16:9 aspect ratio and prevents layout overflow
function VideoTile({ children }) {
  return (
    <div className="relative w-full aspect-video">
      {children}
    </div>
  );
}
