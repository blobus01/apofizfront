// src/components/Cards/YoutubeVideoCard/index.js
import React, { useState, useCallback } from "react";
import "./index.scss";
import { ReactComponent as YoutubePlayIcon } from "@/assets/icons/icon_youtube.svg";

const YoutubeVideoCard = ({ embedUrl, onClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Обновленная функция для обработки всех возможных форматов URL
  const getVideoIdFromEmbedUrl = (url) => {
    if (!url) return null;

    try {
      // Создаем URL объект для корректной обработки URL
      const urlObj = new URL(url);

      // Обработка embed URL (https://www.youtube.com/embed/VIDEO_ID)
      if (urlObj.pathname.startsWith("/embed/")) {
        return urlObj.pathname.split("/")[2];
      }

      // Обработка watch URL (https://www.youtube.com/watch?v=VIDEO_ID)
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }

      // Обработка коротких URL (https://youtu.be/VIDEO_ID)
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname?.slice(1);
      }

      // Если URL не соответствует ни одному из форматов, пробуем найти ID через регулярные выражения
      const patterns = [
        /(?:embed\/|v=|youtu\.be\/)([^&\n?#]+)/, // Общий паттерн для всех форматов
        /youtube\.com\/watch\?v=([^&\n?#]+)/, // Формат watch
        /youtube\.com\/embed\/([^&\n?#]+)/, // Формат embed
        /youtu\.be\/([^&\n?#]+)/, // Формат короткой ссылки
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return null;
    }
  };

  const videoId = getVideoIdFromEmbedUrl(embedUrl);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  const handlePlayClick = useCallback(() => {
    setIsPlaying(true);
  }, []);

  if (!videoId) {
    return null;
  }

  return (
    <div className="youtube-video-card">
      {isPlaying ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
          className="youtube-video-card__iframe"
        ></iframe>
      ) : (
        <div
          className="youtube-video-card__thumbnail"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
          onClick={onClick}
        >
          <div className="youtube-video-card__overlay">
            <YoutubePlayIcon className="youtube-video-card__play-icon" />
          </div>
        </div>
      )}
    </div>
  );
};

export default YoutubeVideoCard;
