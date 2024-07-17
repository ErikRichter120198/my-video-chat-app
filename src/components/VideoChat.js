import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
const socket = io("http://localhost:3000", {
  withCredentials: true,
});
const VideoChat = () => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [peerConnection, setPeerConnection] = useState(null);
  const [roomID, setRoomID] = useState("");
  const [inRoom, setInRoom] = useState(false);
  useEffect(() => {
    if (inRoom) {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      setPeerConnection(pc);
      socket.emit('join', roomID);
      socket.on("offer", async (offer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", answer, roomID);
      });
      socket.on("answer", async (answer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });
      socket.on("candidate", async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      });
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", event.candidate, roomID);
        }
      };
      pc.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localVideoRef.current.srcObject = stream;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", offer, roomID);
        } catch (err) {
          console.error("Error accessing media devices.", err);
        }
      };
      startStream();
      return () => {
        pc.close();
        socket.off("offer");
        socket.off("answer");
        socket.off("candidate");
      };
    }
  }, [inRoom, roomID]);
  const joinRoom = () => {
    if (roomID) {
      setInRoom(true);
    }
  };
  return (
    <div>
      {!inRoom ? (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <video ref={localVideoRef} autoPlay playsInline muted></video>
          <video ref={remoteVideoRef} autoPlay playsInline></video>
          <div>Room ID: {roomID}</div>
        </div>
      )}
    </div>
  );
};
export default VideoChat;