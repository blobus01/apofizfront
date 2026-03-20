import Lottie from "lottie-react";
import callAnimation from "./callAnimation.json";

const CallAnimation = () => {
  return (
    <Lottie
      animationData={callAnimation}
      loop
      autoplay
      style={{ width: "32px", height: "32px",transform: 'scale(1.5)', marginTop: '-5px' }}
      pointerEvents="none" // 🔥 обязательно
    />
  );
};

export default CallAnimation;
