import ImageCropView from "@views/ImageCropView";
import React from "react";

const ImageThemeCropView = (props) => {
  return (
    <ImageCropView
      {...props}
      cropConfig={{
        aspect: 9 / 16,
        outputWidth: 1080,
        outputHeight: 1920,
      }}
    />
  );
};

export default ImageThemeCropView;
