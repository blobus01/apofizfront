import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";

const AnimatedQr = ({ options, style, ...rest }) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import("../../../assets/animations/qr_scan.json").then((res) =>
      setAnimationData(res)
    );
  }, []);

  return (
    <div style={style}>
      <Lottie
        options={{
          loop: false,
          autoplay: false,

          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
          },
          animationData,
          ...options,
        }}
        {...rest}
      />
    </div>
  );
};

export default AnimatedQr;
