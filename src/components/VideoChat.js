// VideoChat.js (Frontend)

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Verbindung zum Socket.IO-Server herstellen

const VideoChat = () => {
  const localVideoRef1 = useRef(); // Ref für lokale Video-Elemente
  const localVideoRef2 = useRef();
  const [isCameraOn1, setIsCameraOn1] = useState(true); // Zustand für Kameraaktivität
  const [isCameraOn2, setIsCameraOn2] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState([]);

  useEffect(() => {
    // Funktion zum Initialisieren der Medienstreams
    const initMediaStream = async () => {
      try {
        const stream1 = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        const stream2 = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        localVideoRef1.current.srcObject = stream1;
        localVideoRef2.current.srcObject = stream2;

        socket.emit("stream", stream1); // Senden des ersten Streams an den Server
        socket.emit("stream", stream2); // Senden des zweiten Streams an den Server

        socket.on("stream", (socketId, remoteStream) => {
          setRemoteStreams((prevStreams) => [
            ...prevStreams,
            { socketId, stream: remoteStream },
          ]);
        });

        socket.on("stopStream", (socketId) => {
          setRemoteStreams((prevStreams) =>
            prevStreams.filter((stream) => stream.socketId !== socketId)
          );
        });
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    initMediaStream();

    return () => {
      socket.emit("stopStream"); // Beenden der Streams beim Verlassen
    };
  }, []);

  const toggleCamera = (cameraNumber) => {
    if (cameraNumber === 1) {
      const updatedCameraStatus1 = !isCameraOn1;
      setIsCameraOn1(updatedCameraStatus1);
      socket.emit("toggleCamera", updatedCameraStatus1);
    } else if (cameraNumber === 2) {
      const updatedCameraStatus2 = !isCameraOn2;
      setIsCameraOn2(updatedCameraStatus2);
      socket.emit("toggleCamera", updatedCameraStatus2);
    }
  };

  return (
    <div>
      <div>
        <video ref={localVideoRef1} autoPlay muted playsInline></video>
        <button onClick={() => toggleCamera(1)}>
          {isCameraOn1 ? "Turn Camera Off 1" : "Turn Camera On 1"}
        </button>
      </div>
      <div>
        <video ref={localVideoRef2} autoPlay muted playsInline></video>
        <button onClick={() => toggleCamera(2)}>
          {isCameraOn2 ? "Turn Camera Off 2" : "Turn Camera On 2"}
        </button>
      </div>
      {remoteStreams.map((remoteStream) => (
        <video key={remoteStream.socketId} autoPlay playsInline>
          <track kind="captions" srcLang="en" />
          Your browser does not support the video tag.
        </video>
      ))}
    </div>
  );
};

export default VideoChat;

