import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import { MeetingHeader, VideoGrid, ControlBar } from "../components/meeting";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

export default function Meeting() {
  const { streamId: roomId } = useParams();
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState(null);
  const [localUsername, setLocalUsername] = useState("You");
  const [peers, setPeers] = useState([]);
  const [copied, setCopied] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const peersRef = useRef({});
  const peerUsernamesRef = useRef({});
  const localStreamRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const localUsernameRef = useRef("You");

  // ── Helper functions (declared before useEffect) ──

  const createPeerConnection = useCallback((targetSocketId, username) => {
    // Close any existing peer connection for this user (handles glare / reconnect)
    if (peersRef.current[targetSocketId]) {
      peersRef.current[targetSocketId].close();
      delete peersRef.current[targetSocketId];
    }

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Store the username for this peer
    if (username) {
      peerUsernamesRef.current[targetSocketId] = username;
    }

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
            {
              socketId: targetSocketId,
              stream: e.streams[0],
              username: peerUsernamesRef.current[targetSocketId] || "Guest",
            },
          ];
        }
        return prev;
      });
    };

    peersRef.current[targetSocketId] = peer;
    return peer;
  }, []);

  const connectToNewUser = useCallback((targetSocketId, stream, username) => {
    // Don't create duplicate connections
    if (peersRef.current[targetSocketId]) return;

    const peer = createPeerConnection(targetSocketId, username);

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
          username: localUsernameRef.current,
        });
      })
      .catch((e) => console.error(e));
  }, [createPeerConnection]);

  const handleReceiveOffer = useCallback(async (offer, callerSocketId, stream, callerUsername) => {
    const peer = createPeerConnection(callerSocketId, callerUsername);

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
      username: localUsernameRef.current,
    });
  }, [createPeerConnection]);

  // ── Main effect ──

  useEffect(() => {
    const startCall = async () => {
      try {
        // Guard: don't acquire media twice on effect re-run
        if (!localStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setLocalStream(stream);
          localStreamRef.current = stream;
        }

        if (!hasJoinedRef.current) {
          socket.emit("join-room", roomId, (response) => {
            if (response?.username) {
              setLocalUsername(response.username);
              localUsernameRef.current = response.username;
            }
          });
          hasJoinedRef.current = true;
        }
      } catch {
        alert("Could not access camera/microphone. Please allow permissions.");
      }
    };

    startCall();

    // Store username only; the new user will send us an offer via "existing-users"
    socket.on("user-connected", (userData) => {
      const { socketId, username } = userData;
      peerUsernamesRef.current[socketId] = username || "Guest";
    });

    // Server sends array of { socketId, username }
    socket.on("existing-users", (users) => {
      users.forEach((userData) => {
        const { socketId, username } = userData;
        peerUsernamesRef.current[socketId] = username || "Guest";
        connectToNewUser(socketId, localStreamRef.current, username);
      });
    });

    socket.on("offer", async (payload) => {
      // Store the caller's username from the offer payload
      if (payload.username) {
        peerUsernamesRef.current[payload.caller] = payload.username;
      }
      await handleReceiveOffer(
        payload.offer,
        payload.caller,
        localStreamRef.current,
        payload.username
      );
    });

    socket.on("answer", (payload) => {
      // Store the answerer's username from the answer payload
      if (payload.username) {
        peerUsernamesRef.current[payload.caller] = payload.username;
        // Update existing peer entry with username
        setPeers((prev) =>
          prev.map((p) =>
            p.socketId === payload.caller
              ? { ...p, username: payload.username }
              : p
          )
        );
      }
      const peer = peersRef.current[payload.caller];
      if (peer && peer.signalingState === "have-local-offer") {
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

    // Server now sends { socketId, username }
    socket.on("user-disconnected", (userData) => {
      const disconnectedId = typeof userData === "string" ? userData : userData.socketId;
      if (peersRef.current[disconnectedId]) {
        peersRef.current[disconnectedId].close();
        delete peersRef.current[disconnectedId];
      }
      delete peerUsernamesRef.current[disconnectedId];
      setPeers((prev) =>
        prev.filter((p) => p.socketId !== disconnectedId)
      );
    });

    return () => {
      socket.off("user-connected");
      socket.off("existing-users");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
      // Clean up all peer connections
      Object.values(peersRef.current).forEach((p) => p.close());
      peersRef.current = {};
      peerUsernamesRef.current = {};
    };
  }, [roomId]);

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
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* HEADER */}
      <MeetingHeader
        roomId={roomId}
        participantCount={1 + peers.length}
      />

      {/* VIDEO GRID */}
      <VideoGrid localStream={localStream} localUsername={localUsername} peers={peers} />

      {/* CONTROL BAR */}
      <ControlBar
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        copied={copied}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onCopy={handleCopy}
        onLeave={leaveCall}
      />
    </div>
  );
}
