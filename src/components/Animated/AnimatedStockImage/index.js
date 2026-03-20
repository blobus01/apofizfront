import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import Lottie from 'react-lottie';

const AnimatedStockImage = () => {
  const [jsonData, setJsonData] = useState();

  useEffect(() => {
    import('../../../assets/animations/Stock_animation.json').then(data => setJsonData(data));
  }, []);

  return (
    <Lottie
      options={{
        loop: false,
        autoplay: true,
        animationData: jsonData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      }}
      width={225}
      height={305}
    />
  );
};

export default AnimatedStockImage;
