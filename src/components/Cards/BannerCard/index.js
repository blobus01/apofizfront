import React from "react";
import * as classnames from "classnames";
import OrganizationCard from "../OrganizationCard";
import { Link } from "react-router-dom";
import "./index.scss";

const BannerCard = ({ banner, className }) => {
  const { id, image, linked_organization } = banner;

  return (
    <Link
      to={`banners/${id}`}
      className={classnames("banner-card__wrap", className)}
    >
      <div className="banner-card">
        <img
          src={image && image.file}
          alt={linked_organization.title}
          className="banner-card__image"
        />

        <div className="banner-card__description">
          <OrganizationCard
            title={linked_organization.title}
            image={
              linked_organization.image && linked_organization.image.medium
            }
            onClick={() => null}
            size={44}
            className="banner-card__organization"
          />
        </div>
      </div>
    </Link>
  );
};

export default BannerCard;
