'use client';

import { useState, useRef } from 'react';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function VideoPlayer({
  src = '/video.mp4',
  poster = '/placeholder.jpg',
  title = 'Vídeo Institucional COIMMA',
  description = 'Conheça nossa história, missão e compromisso com a excelência em equipamentos para pecuária.',
  className = ''
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    setShowControls(false);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Video Container */}
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
        <div className="aspect-video relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={poster}
            preload="metadata"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={src} type="video/mp4" />
            Seu navegador não suporta o elemento de vídeo.
          </video>
        </div>
      </div>

      {/* Video Caption */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Clique para assistir ao nosso vídeo institucional
        </p>
      </div>
    </div>
  );
}
