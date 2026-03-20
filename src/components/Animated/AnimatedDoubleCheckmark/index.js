import React, {useEffect, useState} from 'react';
import Lottie from "react-lottie";

const AnimatedDoubleCheckmark = ({style, options, className, ...rest}) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import('../../../assets/animations/added_in_compilation.json').then(res => setAnimationData(res))
  }, []);

  return (
    <div className={className}>
      <Lottie
        options={{
          loop: false,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
          },
          ...options,
          animationData: animationData,
        }}
        isClickToPauseDisabled
        isStopped={false}
        width={25}
        height={25}
        style={{margin: 'initial', ...style}}
        {...rest}
      />
    </div>
  );
};

export default AnimatedDoubleCheckmark;