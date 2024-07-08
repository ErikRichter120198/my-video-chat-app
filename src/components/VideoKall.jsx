import React from 'react';
import VideoChat from './VideoChat';




function VideoKall() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>KonferenzRaum</h1>
      </header>
      <div className="video-container">
        <VideoChat />
      </div>
    </div>
  );
}

export default VideoKall;
