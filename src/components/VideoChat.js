// VideoChat.js (Frontend)

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Verbindung zum Socket.IO-Server herstellen

const VideoChat = () => {
  const localVideoRef = useRef();
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [peers, setPeers] = useState({});

  useEffect(() => {
    const room = "some-room"; // Raumname, um Benutzer zu gruppieren

    
const socket = io.connect('https://3.67.71.115:5000', {
  secure: true, // Stellt sicher, dass HTTPS verwendet wird
});

    // Initialisierung des lokalen Medienstreams
    const initMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localVideoRef.current.srcObject = stream;

        // Client tritt dem Raum bei
        socket.emit("join", room);

        // Angebot erhalten
        socket.on("offer", async (id, description) => {
          const peerConnection = new RTCPeerConnection();
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("candidate", room, event.candidate);
            }
          };
          peerConnection.ontrack = (event) => {
            setRemoteStreams((prevStreams) => [
              ...prevStreams,
              { id, stream: event.streams[0] },
            ]);
          };
          await peerConnection.setRemoteDescription(description);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit("answer", answer);
          peers[id] = peerConnection;
          setPeers(peers);
        });

        // Antwort erhalten
        socket.on("answer", async (id, description) => {
          await peers[id].setRemoteDescription(description);
        });

        // ICE-Kandidat erhalten
        socket.on("candidate", async (id, candidate) => {
          await peers[id].addIceCandidate(candidate);
        });

        // Benutzer getrennt
        socket.on("user-disconnected", (id) => {
          if (peers[id]) {
            peers[id].close();
            delete peers[id];
            setRemoteStreams((prevStreams) =>
              prevStreams.filter((stream) => stream.id !== id)
            );
            setPeers(peers);
          }
        });

        // Stream zum neuen Peer hinzufügen
        stream.getTracks().forEach((track) => {
          for (const peerId in peers) {
            peers[peerId].addTrack(track, stream);
          }
        });

      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    initMediaStream();
  }, []);

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted playsInline></video>
      {remoteStreams.map((remoteStream) => (
        <video key={remoteStream.id} autoPlay playsInline srcObject={remoteStream.stream}></video>
      ))}
    </div>
  );
};


export default VideoChat;

