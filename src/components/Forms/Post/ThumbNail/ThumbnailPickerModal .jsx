import React, { useEffect, useRef, useState } from "react";
import axios from "axios-api";
import { useDispatch } from "react-redux";
import { AddThumbNail, CloseThumbNail, SaveThumbNail } from "./icons";
import { setViews } from "@store/actions/commonActions";
import { VIEW_TYPES } from "@components/GlobalLayer";

const ThumbnailPickerModal = ({
  video,
  onClose,
  onSave,
  postID,
  orgID
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  const getVideoSrc = (item) => item?.video_url || item?.video || item?.file;

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onLoadedMetadata = () => {
      setDuration(el.duration || 0);
    };

    el.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);

    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const uploadThumbnailToServer = async (file) => {
    const base64 = await fileToBase64(file);

    const videoUrl = video?.video_url || video?.video || video?.file || "";

    const response = await axios.patch(
      `/organizations/${orgID}/shop/items/${postID}/videos/${video.id}/`,
      {
        thumbnail_base64: base64,
        video_url: videoUrl,
      },
      
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("CONSOLE.log", response);

    return response?.data;
  };

  const saveUploadedThumbnail = async (file, extra = {}) => {
    try {
      setLoading(true);

      const serverData = await uploadThumbnailToServer(file);
      const preview = serverData?.file || URL.createObjectURL(file);

      onSave({
        video_id: serverData?.video_id,
        video_url: serverData?.video_url,
        thumbnail_url: serverData?.thumbnail_url,
        thumbnail_path: serverData?.thumbnail_path,
        video_path: serverData?.video_path,
        original: file,
        source: extra.source || "upload",
        currentTime: extra.currentTime,
      });
    } catch (error) {
      console.error("Thumbnail upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const captureFrame = () => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;

    if (!videoEl || !canvasEl) return;
    if (videoEl.readyState < 2) return;

    const ctx = canvasEl.getContext("2d");
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;

    try {
      ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    } catch (error) {
      console.error("drawImage error:", error);
      return;
    }

    try {
      canvasEl.toBlob(
        async (blob) => {
          if (!blob) return;

          const file = new File([blob], `thumbnail-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          await saveUploadedThumbnail(file, {
            source: "frame",
            currentTime: videoEl.currentTime,
          });
        },
        "image/jpeg",
        0.9,
      );
    } catch (error) {
      console.error("toBlob error:", error);
    }
  };
  const handleAddClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const openCropper = (file) => {
    dispatch(
      setViews({
        type: VIEW_TYPES.image_crop,
        uploads: [file],
        cropConfig: {
          aspect: 4 / 5,
          unit: "%",
          x: 0,
          y: 0,
        },
        onBack: () => {
          dispatch(setViews([]));
        },
        onSave: async (images) => {
          const croppedImage = images?.[0];

          if (!croppedImage?.original) {
            dispatch(setViews([]));
            return;
          }

          dispatch(setViews([]));
          await saveUploadedThumbnail(croppedImage.original, {
            source: "upload",
          });
        },
      }),
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    openCropper(file);
  };

  return (
    <div className="thumbnail-modal" onClick={onClose}>
      <div
        className="thumbnail-modal__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="thumbnail-modal__close"
          onClick={onClose}
          disabled={loading}
        >
          <CloseThumbNail />
        </button>

        <div className="thumbnail-modal__player">
          <video
            ref={videoRef}
            src={getVideoSrc(video)}
            playsInline
            controls
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            onSeeked={(e) => setCurrentTime(e.target.currentTime)}
            onPause={(e) => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="thumbnail-modal__actions">
          <button
            type="button"
            className="thumbnail-modal__btn thumbnail-modal__btn--add"
            onClick={handleAddClick}
            disabled={loading}
          >
            <AddThumbNail />
            {loading ? "Загрузка..." : "Добавить"}
          </button>

          <button
            type="button"
            className="thumbnail-modal__btn thumbnail-modal__btn--save"
            onClick={captureFrame}
            disabled={loading}
          >
            <SaveThumbNail />
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPickerModal;
