import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

export default function Stream() {
  const { streamId } = useParams();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const createPeer = useCallback(() => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc-ice-candidate", {
          streamId,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
      try {
        remoteVideoRef.current.play().catch(() => {});
      } catch (err) {
        console.error("Error playing remote video:", err);
      }
    };

    return peer;
  }, [streamId]);

  useEffect(() => {
    socket.emit("join-stream", { streamId, role: "viewer" });

    if (!peerRef.current) {
      peerRef.current = createPeer();
    }

    socket.on("webrtc-offer", async (data) => {
      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit("webrtc-answer", {
          streamId,
          answer,
          to: data.from,
        });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on("webrtc-ice-candidate", (data) => {
      if (data.candidate) {
        peerRef.current
          ?.addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch((err) =>
            console.error("Error adding ICE candidate:", err)
          );
      }
    });

    return () => {
      socket.off("webrtc-offer");
      socket.off("webrtc-ice-candidate");
    };
  }, [streamId, createPeer]);

  useEffect(() => {
    if (isStreaming) {
      const handlePeerJoined = async ({ socketId, role }) => {
        if (role === "viewer") {
          try {
            const offer = await peerRef.current.createOffer({
              iceRestart: true,
            });
            await peerRef.current.setLocalDescription(offer);
            socket.emit("webrtc-offer", {
              streamId,
              offer,
              to: socketId,
            });
          } catch (err) {
            console.error("Error creating offer:", err);
          }
        }
      };

      const handleAnswer = async (data) => {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      };

      socket.on("peer-joined", handlePeerJoined);
      socket.on("webrtc-answer", handleAnswer);

      return () => {
        socket.off("peer-joined", handlePeerJoined);
        socket.off("webrtc-answer", handleAnswer);
      };
    }
  }, [isStreaming, streamId]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;

      if (!peerRef.current) {
        peerRef.current = createPeer();
      }

      stream.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, stream);
      });

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socket.emit("join-stream", { streamId, role: "streamer" });
      socket.emit("webrtc-offer", { streamId, offer });

      setIsStreaming(true);
      setStatus("Live");
    } catch (err) {
      setError(err.message);
    }
  };

  const stopStream = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.close();

    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;

    setIsStreaming(false);
    setStatus("Stopped");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 font-sans">
      
      {/* LEFT PANEL */}
      <div className="flex-1 space-y-6">
        <h2 className="text-2xl font-bold">Live Stream</h2>

        <div className="p-5 border-2 border-green-500 rounded-lg bg-green-50">
          <p className="font-semibold mb-3">
            Share this link with viewers:
          </p>

          <div className="flex gap-3">
            <input
              value={window.location.href}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleCopy}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
            >
              Copy
            </button>
          </div>

          {copied && (
            <p className="text-green-600 mt-2">✔ Link copied</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={startStream}
            disabled={isStreaming}
            className={`px-4 py-2 rounded-md text-white transition ${
              isStreaming
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Start Streaming
          </button>

          <button
            onClick={stopStream}
            disabled={!isStreaming}
            className={`px-4 py-2 rounded-md text-white transition ${
              !isStreaming
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Stop Streaming
          </button>
        </div>

        <p>
          <strong>Status:</strong> {status}
        </p>

        {error && (
          <p className="text-red-500 font-medium">{error}</p>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          
          <div>
            <h4 className="font-semibold mb-2">Your Video</h4>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-52 h-52 bg-black rounded-lg"
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Remote Video</h4>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-80 h-80 bg-black rounded-lg"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
