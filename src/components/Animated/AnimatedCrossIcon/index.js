import React, {useEffect, useState} from 'react';
import Lottie from "react-lottie";

const AnimatedCrossIcon = ({style, options, delay, className, ...rest}) => {
  const [animationData, setAnimationData] = useState(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    import('../../../assets/animations/cross_icon.json').then(res => setAnimationData(res))
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldPlay(true);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div className={className}>
      <Lottie
        options={{
          loop: false,
          autoplay: false,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
          },
          animationData,
          ...options
        }}
        isStopped={!shouldPlay}
        isPaused={!shouldPlay}
        style={{margin: 'initial', ...style}}
        {...rest}
      />
    </div>
  );
};

export default AnimatedCrossIcon;