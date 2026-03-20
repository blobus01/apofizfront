import Lottie from "lottie-react";
import waveJson from "../voiceWave.json";

const VoiceWave = () => (
  <Lottie
    animationData={waveJson}
    loop
    autoplay
    style={{ width: 24, height: 24 }}
    pointerEvents="none" // 🔥 критично
  />
);

export default VoiceWave;
