import React from "react";
import { withShlyuzerLink } from "../../common/helpers";
import { TrashIcon } from "../UI/Icons";
import ScrollContainer from "react-indiana-drag-scroll";
import { ButtonUpload } from "../UI/Buttons";
import * as classnames from "classnames";
import "./index.scss";

const MultipleImageUploader = ({
  onImageUpload,
  onRemoveImage,
  setPreview,
  preview,
  images,
  className,
  placeholder,
  error,
}) => {
  return (
    <div className={classnames("multiple-image-uploader", className)}>
      {placeholder && !preview && (
        <div className="multiple-image-uploader__placeholder">
          {placeholder}
        </div>
      )}
      {preview && (
        <div className="multiple-image-uploader__preview">
          <img
            src={
              typeof preview.file === "string"
                ? withShlyuzerLink(preview.file)
                : ""
            }
            alt="preview"
          />
          <button
            type="button"
            onClick={() => onRemoveImage(preview.id)}
            className="multiple-image-uploader__preview-remove"
          >
            <TrashIcon />
          </button>
        </div>
      )}
      <div className="multiple-image-uploader__images">
        <ScrollContainer className="multiple-image-uploader__images-list-wrap">
          <div className="multiple-image-uploader__images-list">
            <ButtonUpload
              name="uploads"
              multiple
              onChange={onImageUpload}
              error={error}
              className="multiple-image-uploader__images-upload"
            />
            {images.map((src) => (
              <div
                key={src.id}
                className={classnames(
                  "multiple-image-uploader__images-item",
                  preview &&
                    ((preview.id && preview.id === src.id) ||
                      preview.file === src.file) &&
                    "active"
                )}
                onClick={() => setPreview(src)}
              >
                <img
                  src={
                    typeof src.file === "string"
                      ? withShlyuzerLink(src.file)
                      : ""
                  }
                  alt=""
                />
              </div>
            ))}
            <div className="multiple-image-uploader__images-mock" />
          </div>
        </ScrollContainer>
      </div>
    </div>
  );
};

export default MultipleImageUploader;
