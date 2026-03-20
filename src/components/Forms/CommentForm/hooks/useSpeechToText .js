import { useEffect, useRef, useState } from "react";

export const useSpeechToText = () => {
  const recognitionRef = useRef(null);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      console.log("done text", transcript);
      setText(transcript);
    };

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const start = () => recognitionRef.current?.start();
  const stop = () => recognitionRef.current?.stop();

  return { text, listening, start, stop };
};
