import React, { useState } from "react";
import * as classnames from "classnames";
import urlParser from "js-video-url-parser";
import { getYoutubeVideoDetail } from "../../../store/services/commonServices";
import { translate } from "../../../locales/locales";
import "./index.scss";

const YoutubeInputField = ({ onVideoAdd }) => {
  const [data, setData] = useState(null);
  const [value, setValue] = useState("");

  const normalizeYoutubeUrl = (url) => {
    if (!url) return url;

    // shorts
    if (url.includes("youtube.com/shorts/")) {
      const id = url.split("shorts/")[1].split(/[?&]/)[0];
      return `https://www.youtube.com/watch?v=${id}`;
    }

    return url;
  };

  const checkYoutubeLink = (e) => {
    data !== null && setData(null);

    const { value } = e.target;
    setValue(value);

    if (value.length < 10) return;

    const normalizedUrl = normalizeYoutubeUrl(value);
    const video = urlParser.parse(normalizedUrl);

    if (!video || video.provider !== "youtube" || !video.id) {
      return;
    }

    getYoutubeVideoDetail(video.id).then((res) => {
      if (res?.success) {
        setData({
          ...res.data,
          id: `${Date.now()}-${video.id}`,
          link: `https://www.youtube.com/embed/${video.id}`,
        });
      }
    });
  };

  const addVideo = () => {
    onVideoAdd(data);
    setData(null);
    setValue("");
  };

  return (
    <>
      <div className={classnames("youtube-input-field")}>
        <div className="youtube-input-field__group">
          <input
            type="text"
            onChange={checkYoutubeLink}
            value={value}
            className="youtube-input-field__input"
            placeholder={translate("ссылка на youtube", "app.youtubeLink")}
          />
          {data && (
            <button
              type="button"
              className="youtube-input-field__button f-14"
              onClick={addVideo}
            >
              Добавить
            </button>
          )}
        </div>
      </div>
      {value.length > 0 && !data && (
        <p className="youtube-input-field__error">Неверная ссылка на YouTube</p>
      )}
    </>
  );
};

export default YoutubeInputField;
