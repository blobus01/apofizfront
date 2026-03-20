import Lottie from "lottie-react";
import waveAnimation from "./soundWave.json";

const LottiePreview = () => {
  return (
    <div style={{ width: '24px', height: '24px', position: 'relative', bottom: '-3px' }}>
      <Lottie animationData={waveAnimation} loop autoplay />
    </div>
  );
};

export default LottiePreview;
