import React, {useEffect, useState} from 'react';
import Lottie from "react-lottie";

const AnimatedDocs = ({options, ...rest}) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import('../../../assets/animations/docs_ok.json').then(res => setAnimationData(res))
  }, []);

  return (
    <Lottie
      options={{
        loop: false,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
        ...options,
        animationData,
      }}
      isClickToPauseDisabled
      {...rest}
    />
  );
};

export default AnimatedDocs;