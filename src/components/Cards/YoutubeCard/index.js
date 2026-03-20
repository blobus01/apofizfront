import React from 'react';
import OrgAvatar from '@ui/OrgAvatar';
import urlParser from 'js-video-url-parser';
import {RemoveIcon} from '@ui/Icons';
import './index.scss';

const YoutubeCard = ({video, onRemove}) => {
  if (!video?.link) return null; // TODO: Fix upper level

  const parsed = urlParser.parse(video.link);
  const videoID = parsed?.id

  return (
    <div className="youtube-card">
      <div className="youtube-card__left">
        {videoID && parsed.provider === 'youtube' && (
          <OrgAvatar
            alt="Some"
            size={44}
            src={getYoutubeVideoThumbnail(videoID)}
            borderRadius={7}
            className="youtube-card__image"
          />
        )}
        <div className="youtube-card__title f-17 f-500 tl">{video.link}</div>
      </div>
      <button className="youtube-card__remove" type="button" onClick={onRemove}>
        <RemoveIcon/>
      </button>
    </div>
  );
};

function getYoutubeVideoThumbnail(videoID, version='0') {
  return `https://img.youtube.com/vi/${videoID}/${version}.jpg`
}

export default YoutubeCard;