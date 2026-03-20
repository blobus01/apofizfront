import React, { Component } from "react";
import * as classnames from "classnames";
import { readURL } from "../../common/helpers";
import { ALLOWED_FORMATS } from "../../common/constants";
import { translate } from "../../locales/locales";
import "./index.scss";

class ImageUploader extends Component {
  async componentDidMount() {
    if (this.props.image) {
      try {
        const url = await readURL(this.props.image);
        this.setState({ ...this.state, previewUrl: url });
      } catch (e) {}
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      file: null,
      previewUrl: props.imageURL,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.imageURL !== this.props.imageURL) {
      this.setState({ ...this.state, previewUrl: this.props.imageURL });
    }
  }

  onChange = (e) => {
    const file = e.target.files[0];
    if (ALLOWED_FORMATS.includes(file.type)) {
      this.props.onChange(file);
    }
    e.target.value = "";
  };

  render() {
    const { className, error } = this.props;

    return (
      <div
        className={classnames(
          "image-uploader",
          error && "image-uploader__error",
          className
        )}
      >
        {this.state.previewUrl && (
          <img
            src={this.state.previewUrl}
            alt="Preview"
            className="image-uploader__image"
          />
        )}
        <label htmlFor="image" className="image-uploader__label f-12 f-500">
          {!this.state.previewUrl &&
            (className === "app-icon" ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.99847 0.900391C9.4458 0.900391 9.80844 1.26302 9.80844 1.71036L9.80844 8.19039L16.2885 8.19044C16.7358 8.19044 17.0984 8.55306 17.0984 9.00039C17.0984 9.44772 16.7358 9.81035 16.2885 9.81035L9.80844 9.80949L9.80844 16.2905C9.80844 16.7378 9.4458 17.1005 8.99847 17.1005C8.55114 17.1005 8.18851 16.7378 8.18851 16.2905L8.18844 9.80949L1.70839 9.81035C1.26107 9.81035 0.898438 9.44772 0.898438 9.00039C0.898438 8.55306 1.26107 8.19044 1.70839 8.19044L8.18844 8.19039L8.18851 1.71036C8.18851 1.26302 8.55114 0.900391 8.99847 0.900391Z"
                  fill={`${error ? "#f93c10" : "#4285F4"}`}
                />
              </svg>
            ) : (
              translate("Добавить Фото", "org.addPhoto")
            ))}
        </label>
        <input
          type="file"
          name="image"
          id="image"
          onChange={this.onChange}
          accept={ALLOWED_FORMATS.join(",")}
        />
      </div>
    );
  }
}

export default ImageUploader;
