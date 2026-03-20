import React, {useEffect} from 'react';
import {useSessionStorage} from "../../../hooks/useStorage";
import Lottie from "react-lottie";

const AnimatedEventIntro = props => {
  const [animationData, setAnimationData] = useSessionStorage('downloadAnimation');

  useEffect(() => {
    if (!animationData) {
      import('../../../assets/animations/event_created.json').then(data => setAnimationData(data))
    }
  }, [animationData, setAnimationData]);

  return (
    <Lottie
      options={{
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      }}
      {...props}
    />
  );
};

export default AnimatedEventIntro;