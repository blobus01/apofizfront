import React, { useEffect, useRef, useState } from "react";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import "./index.scss";
import axios from "axios-api";
import { ArrowRight, PauseIcon, PlayIcon } from "./icons";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import Preloader from "@components/Preloader";
import Notify from "@components/Notification";
import Loader from "@components/UI/Loader";

const ChoiceVoices = ({
  isOpen,
  onClose,
  voices,
  setVoices,
  assistantData,
  onVoiceUpdated, // 👈
}) => {
  const [choiceVoiceId, setChoiceVoiceId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const params = useParams();

  const fetchVoiceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/elevenlabs/voices/`);
      setVoices(response.data);
    } catch (error) {
      console.log("ERROR FROM VOICES", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchVoiceData();
  }, [isOpen]);

  const handlePlay = (voice) => {
    if (playingVoiceId === voice.voice_id) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingVoiceId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(voice.preview_url);
    audioRef.current = audio;

    audio.play();
    setPlayingVoiceId(voice.voice_id);

    audio.onended = () => setPlayingVoiceId(null);
  };

  const handleSelectVoice = (voice) => {
    setSelectedVoice(voice);
  };

  const handleChoice = async () => {
    if (!selectedVoice) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.put(`/assistant/${params.assistant}/ai-prompt/`, {
        ai_voice: selectedVoice.voice_id,
        voice_name: selectedVoice.name,
      });

      Notify.success({
        text: translate("Голос успешно изменен!", "ai.successChoice"),
      });

      // 🔥 ОБНОВЛЯЕМ ДАННЫЕ АССИСТЕНТА
      await onVoiceUpdated();

      onClose();
    } catch (error) {
      console.error("ERROR SAVE VOICE", error?.response?.data || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />

      <div className="modal__content">
        <MobileTopHeader
          title={translate("Фильтры", "shop.filters")}
          nextLabel={
            isSubmitting ? (
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                {translate("Сохранение", "app.saving")} <Loader />
              </span>
            ) : (
              translate("Сохранить", "app.save")
            )
          }
          onNext={() => handleChoice()}
          onBack={onClose}
        />

        {loading ? (
          <Preloader />
        ) : (
          <div className="modal__body">
            {voices.map((voice) => {
              const isSelected = selectedVoice
                ? selectedVoice.voice_id === voice.voice_id
                : assistantData?.ai_voice === voice.voice_id;

              return (
                <div
                  key={voice.voice_id}
                  className={`modal__item ${
                    isSelected ? "modal__item--selected" : ""
                  }`}
                  onClick={() => handleSelectVoice(voice)}
                >
                  <div className="modal__item-wrapper-desc">
                    <button
                      className={`modal__item-play ${
                        playingVoiceId === voice.voice_id
                          ? "modal__item-play--active"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(voice);
                      }}
                    >
                      {playingVoiceId === voice.voice_id ? (
                        <PauseIcon />
                      ) : (
                        <PlayIcon />
                      )}
                    </button>

                    <div className="modal__item-info">
                      <h3 className="modal__item-title">{voice.name}</h3>
                      <p className="modal__item-desc">{voice.description}</p>
                    </div>
                  </div>

                  <button
                    className="modal__item-arrow"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowRight />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoiceVoices;
