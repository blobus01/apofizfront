import React from "react";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import MobileTopHeader from "../../components/MobileTopHeader";
import Preloader from "../../components/Preloader";
import Compress from "browser-image-compression";
import Notify from "../../components/Notification";
import "react-image-crop/lib/ReactCrop.scss";
import { translate } from "../../locales/locales";
import { setGlobalMenu } from "../../store/actions/commonActions";
import { MENU_TYPES } from "../../components/GlobalMenu";
import { connect } from "react-redux";
import "./index.scss";

const compressOptions = {
  maxWidthOrHeight: 1500, // decrease if image sends too long
  useWebWorker: true,
};

const initialCropConfig = {
  unit: "%",
  aspect: 4 / 5,
  x: 0,
  y: 0,
};

const ASPECT_RATIO_MULTIPLIER = 0.7;

const convertToPercentCrop = (crop, imageWidth, imageHeight) => {
  if (crop.unit === "%") {
    return crop;
  }

  return {
    unit: "%",
    aspect: crop.aspect,
    x: (crop.x / imageWidth) * 100,
    y: (crop.y / imageHeight) * 100,
    width: (crop.width / imageWidth) * 100,
    height: (crop.height / imageHeight) * 100,
  };
};

class ImageCropView extends React.Component {
  constructor(props) {
    super(props);
    const cropConfig = props.cropConfig ?? {};

    this.isSetFirstImage = false;
    this.totalFiles = props.uploads.length;
    this.compressed = [];
    this.outputFile = null;
    this.outputFiles = [];
    this.state = {
      counter: 0,
      loading: true,
      src: null,
      croppedImageUrl: null,
      isAllProceeded: false,
      croppedImages: [],
      crop: {
        ...initialCropConfig,
        ...cropConfig,
      },
    };
  }

  componentDidMount() {
    document.body.style.overflow = "hidden";
    this.startImageCompress(this.props.uploads);
    this.props.selectableAspectRatio && this.openAspectRatioSelectionMenu();
  }

  setAspectRatio = (aspect) => {
    const { state } = this;
    const currentImage = this.imageRef;
    const imageWidth = currentImage.clientWidth;
    const imageHeight = currentImage.clientHeight;

    const crop = makeAspectCrop(
      {
        unit: "px",
        aspect: aspect,
        width:
          Math.min(imageWidth, imageHeight) * aspect * ASPECT_RATIO_MULTIPLIER,
      },
      imageWidth,
      imageHeight
    );

    const percentCrop = convertToPercentCrop(crop, imageWidth, imageHeight);

    void this.makeClientCrop(percentCrop);

    this.setState({
      ...state,
      crop,
    });
  };

  openAspectRatioSelectionMenu = () => {
    this.props.setGlobalMenu({
      type: MENU_TYPES.aspect_ratio_selection_menu,
      menuLabel:
        translate("Выбор соотношения сторон", "hint.aspectRatioSelection") +
        " ?",
      onSubmit: this.setAspectRatio,
      options: {
        hidePageScrollbar: false,
        globalMenuClassName: "image-crop-view__menu",
      },
    });
  };

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
    const cropConfig = this.props.cropConfig ?? {};
    this.outputFile = null;
    this.setState((prevState) => ({
      ...prevState,
      croppedImageUrl: null,
      loading: false,
      isAllProceeded: isLast,
      crop: {
        ...initialCropConfig,
        ...cropConfig,
      },
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
        this.setImage(nextImage, !this.compressed.length);
        return this.openAspectRatioSelectionMenu();
      }
    }
  };

  onSubmit = () => {
    this.onNext();
    !!this.outputFiles.length && this.props.onSave(this.outputFiles);
  };

  onImageLoaded = (image) => {
    this.imageRef = image;

    const ratio = {};
    if (image.naturalWidth === image.naturalHeight) {
      ratio.width = 80;
      ratio.height = 100;
    }

    if (image.naturalWidth > image.naturalHeight) {
      ratio.height = 100;
    }

    if (image.naturalWidth < image.naturalHeight) {
      ratio.width = 100;
    }

    if (this.state.crop.aspect === 1) {
      ratio.width = 80;
      ratio.height = 80;
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
    return this.makeClientCrop(percentCrop);
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
    const { loading, crop, counter, isAllProceeded, src } = this.state;
    const { onBack } = this.props;
    return (
      <div className="image-crop-view">
        <MobileTopHeader
          title={translate("Обрезка фото", "photo.cropping")}
          onBack={() => onBack(this.outputFiles)}
          onNext={isAllProceeded ? this.onSubmit : this.onNext}
          nextLabel={
            isAllProceeded
              ? translate("Сохранить", "app.save")
              : translate("Далее", "app.next")
          }
        />
        <div className="image-crop-view__content">
          {loading ? (
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

const mapDispatchToProps = (dispatch) => ({
  setGlobalMenu: (...args) => dispatch(setGlobalMenu(...args)),
});

export default connect(null, mapDispatchToProps)(ImageCropView);
