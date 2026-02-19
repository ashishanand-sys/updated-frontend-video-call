import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

const socket = io(import.meta.env.VITE_API_URL);

const VideoPlayer = ({ stream, muted = false, label = "User" }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover scale-x-[-1] rounded-lg bg-[#202124]"
      />
      <div className="absolute bottom-2 left-2 text-white bg-black/50 px-3 py-1 rounded text-xs">
        {label}
      </div>
    </div>
  );
};

export default function Meeting() {
  const { streamId: roomId } = useParams();
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const [copied, setCopied] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        localStreamRef.current = stream;

        if (!hasJoinedRef.current) {
          socket.emit("join-room", roomId);
          hasJoinedRef.current = true;
        }
      } catch (err) {
        alert("Could not access camera/microphone. Please allow permissions.");
      }
    };

    startCall();

    socket.on("user-connected", (userSocketId) => {
      connectToNewUser(userSocketId, localStreamRef.current);
    });

    socket.on("offer", async (payload) => {
      await handleReceiveOffer(
        payload.offer,
        payload.caller,
        localStreamRef.current
      );
    });

    socket.on("answer", (payload) => {
      const peer = peersRef.current[payload.caller];
      if (peer) {
        peer
          .setRemoteDescription(new RTCSessionDescription(payload.answer))
          .catch((e) => console.error(e));
      }
    });

    socket.on("ice-candidate", (payload) => {
      const peer = peersRef.current[payload.caller];
      if (peer && payload.candidate) {
        peer
          .addIceCandidate(new RTCIceCandidate(payload.candidate))
          .catch((e) => console.error(e));
      }
    });

    socket.on("user-disconnected", (userSocketId) => {
      if (peersRef.current[userSocketId]) {
        peersRef.current[userSocketId].close();
        delete peersRef.current[userSocketId];
      }
      setPeers((prev) =>
        prev.filter((p) => p.socketId !== userSocketId)
      );
    });

    return () => {
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
    };
  }, [roomId]);

  function createPeerConnection(targetSocketId) {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          target: targetSocketId,
          candidate: e.candidate,
          caller: socket.id,
        });
      }
    };

    peer.ontrack = (e) => {
      setPeers((prev) => {
        if (!prev.find((p) => p.socketId === targetSocketId)) {
          return [
            ...prev,
            { socketId: targetSocketId, stream: e.streams[0] },
          ];
        }
        return prev;
      });
    };

    peersRef.current[targetSocketId] = peer;
    return peer;
  }

  function connectToNewUser(targetSocketId, stream) {
    const peer = createPeerConnection(targetSocketId);

    if (stream) {
      stream.getTracks().forEach((track) =>
        peer.addTrack(track, stream)
      );
    }

    peer
      .createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .then(() => {
        socket.emit("offer", {
          target: targetSocketId,
          caller: socket.id,
          offer: peer.localDescription,
        });
      })
      .catch((e) => console.error(e));
  }

  async function handleReceiveOffer(offer, callerSocketId, stream) {
    const peer = createPeerConnection(callerSocketId);

    if (stream) {
      stream.getTracks().forEach((track) =>
        peer.addTrack(track, stream)
      );
    }

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", {
      target: callerSocketId,
      caller: socket.id,
      answer,
    });
  }

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack =
        localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTrack =
        localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOn(videoTrack.enabled);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveCall = () => {
    socket.disconnect();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) =>
        track.stop()
      );
    }
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="h-full flex flex-col bg-[#202124] text-white">
      {/* HEADER */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <h3 className="text-lg font-semibold">Meeting Room</h3>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">{roomId}</span>

          <button
            onClick={handleCopy}
            className="border border-gray-600 text-blue-400 px-4 py-2 rounded hover:bg-gray-700 transition text-sm"
          >
            {copied ? "Copied!" : "Copy Joining Info"}
          </button>
        </div>
      </div>

      {/* VIDEO GRID */}
      <div className="flex-1 p-6 grid gap-6 overflow-y-auto 
                      grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {localStream && (
          <div className="aspect-video min-h-[200px]">
            <VideoPlayer
              stream={localStream}
              muted={true}
              label="You"
            />
          </div>
        )}

        {peers.map((peerObj) => (
          <div
            key={peerObj.socketId}
            className="aspect-video min-h-[200px]"
          >
            <VideoPlayer
              stream={peerObj.stream}
              label="Participant"
            />
          </div>
        ))}
      </div>

      {/* FOOTER CONTROLS */}
      <div className="px-6 py-5 flex justify-center gap-6 border-t border-gray-700 bg-[#202124]">
        <button
          onClick={toggleMic}
          className={`px-6 py-3 rounded-full font-semibold transition 
            ${isMicOn
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-500 hover:bg-red-600"}`}
        >
          {isMicOn ? "🎙️ Mic On" : "Mic Off"}
        </button>

        <button
          onClick={toggleCam}
          className={`px-6 py-3 rounded-full font-semibold transition 
            ${isCamOn
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-500 hover:bg-red-600"}`}
        >
          {isCamOn ? "📹 Cam On" : "Cam Off"}
        </button>

        <button
          onClick={leaveCall}
          className="px-8 py-3 rounded-full font-semibold bg-red-500 hover:bg-red-600 transition min-w-[120px]"
        >
          📞 End Call
        </button>
      </div>
    </div>
  );
}
