import React from 'react';
import urlParser from "js-video-url-parser";
import YoutubeCard from "../../../../../Cards/YoutubeCard";
import {RemoveIcon} from "../../../../../UI/Icons";
import OrgAvatar from "../../../../../UI/OrgAvatar";
import linkIcon from "../../../../../../assets/images/link_icon.png";

const LinkCard = ({link, onRemove}) => {
  const parsed = urlParser.parse(link)
  const isYoutubeLink = !!parsed && !!parsed.id && parsed.provider === 'youtube'

  if (isYoutubeLink) {
    return <YoutubeCard
      video={{link}}
      onRemove={onRemove}
    />
  }

  return (
    <div className="resume-form-main-view__link-card">
      <div className="resume-form-main-view__link-card-content">
        <OrgAvatar
          alt="Some"
          size={44}
          src={linkIcon}
          borderRadius={7}
          className="resume-form-main-view__link-card-image"
        />

        <h4 className="resume-form-main-view__link-card-title f-17 f-500 tl">
          {link}
        </h4>
      </div>

      <button className="resume-form-main-view__link-card-title-remove-btn" type="button" onClick={onRemove}>
        <RemoveIcon/>
      </button>
    </div>
  )
    ;
};

export default LinkCard;