import React, {useEffect, useState} from 'react';
import Lottie from "react-lottie";

const AnimatedBookmarkIcon = ({options, ...rest}) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    import('../../../assets/animations/bookmark_icon.json').then(res => setData(res))
  }, []);

  return (
    <Lottie
      options={{
        loop: false,
        autoplay: true,
        animationData: data,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
        ...options
      }}
      width={24}
      height={24}
      {...rest}
    />
  );
};

export default AnimatedBookmarkIcon;