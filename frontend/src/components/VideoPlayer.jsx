import { useEffect, useState } from 'react';

import api from '../services/api.js';

function VideoPlayer({ lessonId, src, onEnded }) {
  const [activeSrc, setActiveSrc] = useState(src);

  useEffect(() => {
    setActiveSrc(src);
  }, [lessonId, src]);

  useEffect(() => {
    if (!lessonId) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      api
        .get(`/lessons/${lessonId}/stream`)
        .then((response) => {
          setActiveSrc(response.data.streamUrl);
        })
        .catch(() => {
        });
    }, 12 * 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [lessonId]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video
        key={activeSrc}
        src={activeSrc}
        controls
        controlsList="nodownload"
        onContextMenu={(event) => event.preventDefault()}
        onEnded={onEnded}
        className="h-full w-full object-contain"
        autoPlay
      />
    </div>
  );
}

export default VideoPlayer;