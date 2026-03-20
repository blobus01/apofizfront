import React, {useEffect} from 'react';
import Lottie from "react-lottie";
import {useSessionStorage} from "../../../hooks/useStorage";

const AnimatedDownloadIcon = props => {
  const [downloadAnimationData, setDownloadAnimationData] = useSessionStorage('downloadAnimation');

  useEffect(() => {
    if (!downloadAnimationData) {
      import('../../../assets/animations/animation_download.json').then(data => setDownloadAnimationData(data))
    }
  }, [downloadAnimationData, setDownloadAnimationData]);

  return (
    <Lottie
      options={{
        loop: true,
        autoplay: true,
        animationData: downloadAnimationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      }}
      width={24}
      height={24}
      {...props}
    />
  );
};

export default AnimatedDownloadIcon;