import React from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import Lottie from 'react-lottie';

const AnimatedInfoIcon = () => {
  const [jsonData, setJsonData] = useState();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    import('../../../assets/animations/Information_Blue.json').then(data => {
      if (mounted.current) {
        setJsonData(data);
      }
    });

    return () => (mounted.current = false);
  }, []);

  return (
    <Lottie
      options={{
        loop: true,
        autoplay: true,
        animationData: jsonData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      }}
      width={18}
      height={18}
      style={{
        margin: 0,
      }}
    />
  );
};

export default AnimatedInfoIcon;
