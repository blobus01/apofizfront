import React from "react";
import ReactCrop from "react-image-crop";
import MobileTopHeader from "../../components/MobileTopHeader";
import Preloader from "../../components/Preloader";
import Compress from "browser-image-compression";
import Notify from "../../components/Notification";
import "react-image-crop/lib/ReactCrop.scss";
import "./index.scss";

const compressOptions = {
  maxWidthOrHeight: 1000,
  useWebWorker: true,
};

const initialCropConfig = {
  unit: "%",
  aspect: 16 / 9,
  x: 0,
  y: 0,
};

class ImageHorizontalCropView extends React.Component {
  constructor(props) {
    super(props);
    this.isSetFirstImage = false;
    this.totalFiles = props.uploads.length;
    this.compressed = [];
    this.outputFile = null;
    this.outputFiles = [];
    this.state = {
      counter: 0,
      loading: true,
      saving: false,
      src: null,
      croppedImageUrl: null,
      isAllProceeded: false,
      croppedImages: [],
      crop: initialCropConfig,
    };
  }

  componentDidMount() {
    this.startImageCompress(this.props.uploads);
  }

  startImageCompress = (uploads) => {
    new Array(uploads.length).fill("-").forEach((mock, index) => {
      Compress(uploads[index], compressOptions)
        .then((compressedBlob) => {
          Compress.getDataUrlFromFile(compressedBlob).then((dataURL) => {
            if (!this.isSetFirstImage) {
              return this.setImage(dataURL, uploads.length === 1);
            }
            this.compressed.push(dataURL);
          });
        })
        .catch(() => {
          console.warn("Compress ERROR:", index);
        })
        .finally(() =>
          this.setState((prevState) => ({
            ...prevState,
            counter: prevState.counter + 1,
          }))
        );
    });
  };

  setImage = (src, isLast) => {
    if (!this.isSetFirstImage) {
      this.isSetFirstImage = true;
    }

    // Clear before and set new image
    this.outputFile = null;
    this.setState((prevState) => ({
      ...prevState,
      croppedImageUrl: null,
      loading: false,
      isAllProceeded: isLast,
      crop: initialCropConfig,
      src,
    }));
  };

  onNext = () => {
    const { croppedImageUrl } = this.state;
    if (!croppedImageUrl) {
      return Notify.info({ text: "Выделите область" });
    }

    if (croppedImageUrl && this.outputFile) {
      this.outputFiles.push({
        id: Math.random() + new Date().toISOString(),
        file: URL.createObjectURL(this.outputFile),
        original: this.outputFile,
      });
      const nextImage = this.compressed.shift();
      if (nextImage) {
        return this.setImage(nextImage, !this.compressed.length);
      }
    }
  };

  onSubmit = () => {
    this.onNext();
    if (this.outputFiles.length) {
      this.setState({ saving: true });
      // Use setTimeout to ensure the state update happens before calling onSave
      setTimeout(() => {
        this.props.onSave(this.outputFiles);
      }, 100);
    }
  };

  onImageLoaded = (image) => {
    this.imageRef = image;

    const ratio = {};
    if (image.naturalWidth === image.naturalHeight) {
      ratio.width = 100;
      ratio.height = 56.25;
    }

    if (image.naturalWidth > image.naturalHeight) {
      ratio.height = 100;
    }

    if (image.naturalWidth < image.naturalHeight) {
      ratio.width = 100;
    }

    this.setState((prevState) => ({
      ...prevState,
      crop: {
        ...prevState.crop,
        ...ratio,
      },
    }));

    return false;
  };

  onCropComplete = (crop, percentCrop) => {
    this.makeClientCrop(percentCrop);
  };

  onCropChange = (crop, percentCrop) => {
    this.setState({ crop: percentCrop });
  };

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        `${new Date().toISOString()}.jpg`
      );
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const canvasWidth = (image.naturalWidth * crop.width) / 100;
    const canvasHeight = (image.naturalHeight * crop.height) / 100;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      (image.naturalWidth * crop.x) / 100,
      (image.naturalHeight * crop.y) / 100,
      canvasWidth,
      canvasHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          return console.error("Canvas is empty");
        }
        blob.name = fileName;
        blob.lastModifiedDate = new Date();
        let file = new File([blob], fileName, { type: "image/jpg" });
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        this.outputFile = file;
        resolve(this.fileUrl);
      }, "image/jpg");
    });
  }

  render() {
    const { loading, saving, crop, counter, isAllProceeded, src } = this.state;
    const { onBack } = this.props;
    return (
      <div className="image-crop-view">
        <MobileTopHeader
          title="Обрезка фото"
          onBack={() => onBack(this.outputFiles)}
          onNext={isAllProceeded ? this.onSubmit : this.onNext}
          nextLabel={isAllProceeded ? "Сохранить" : "Далее"}
        />
        <div className="image-crop-view__content">
          {loading || saving ? (
            <Preloader className="image-crop-view__preloader" />
          ) : (
            src && (
              <ReactCrop
                src={src}
                crop={crop}
                minWidth={50}
                ruleOfThirds
                onImageLoaded={this.onImageLoaded}
                onComplete={this.onCropComplete}
                onChange={this.onCropChange}
              />
            )
          )}
          {saving && (
            <div className="image-crop-view__saving-overlay">
              <p>Сохранение...</p>
            </div>
          )}
          <p
            style={{ color: "lightgrey", fontSize: "10px", textAlign: "right" }}
          >
            Proceeded: {counter}/{this.totalFiles}
          </p>
        </div>
      </div>
    );
  }
}

export default ImageHorizontalCropView;
