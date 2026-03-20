import React from "react";
import { translate } from "../../../locales/locales";
import { ImageWithPlaceholder } from "../../ImageWithPlaceholder";
import classNames from "classnames";

import "./index.scss";

const ClientCard = ({ client, className }) => {
  return (
    <div className={classNames("client-card", className)}>
      <div className="client-card__avatar-container">
        <ImageWithPlaceholder
          src={client.avatar && client.avatar.large}
          alt={client.full_name}
          className="client-card__avatar"
        />
      </div>
      <div className="client-card__info">
        <div className="client-card__info-id f-14 f-600">ID {client.id}</div>
        <div className="client-card__info-name f-17 f-600">
          {client.full_name}
        </div>
        <div className="client-card__info-role f-16 f-600">
          {client.role ? client.role : translate("Клиент", "delivery.client")}
        </div>
        {client.phone_number && (
          <a
            href={`tel:${client.phone_number}`}
            className="client-card__info-phone f-14 f-600"
          >
            {client.phone_number}
          </a>
        )}
      </div>
    </div>
  );
};

export default ClientCard;
