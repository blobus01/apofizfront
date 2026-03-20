import { useRef } from "react";

export const useSpeechToText = ({ onResult }) => {
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  const createRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      if (!shouldListenRef.current) return;

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      onResult?.({
        interim: interim.trim(),
        final: final.trim(),
      });
    };

    recognition.onend = () => {
      // браузер реально остановился
      recognitionRef.current = null;
    };

    return recognition;
  };

  const start = () => {
    if (shouldListenRef.current) return;

    shouldListenRef.current = true;

    recognitionRef.current = createRecognition();
    recognitionRef.current?.start();
  };

  const stop = () => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  return { start, stop };
};
