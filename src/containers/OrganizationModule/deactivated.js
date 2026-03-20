import React from "react";
import ImagePlaceholder from "../../assets/images/deactivete_org.png";
import { translate } from "@locales/locales";

export const DeactivatedOrgPlaceholder = () => (
  <div className="organization-module-placeholder">
    <p
      dangerouslySetInnerHTML={{
        __html: translate(
          "Данная организация <br />деактивирована...",
          "organization.deactivated"
        ),
      }}
    />
    <img src={ImagePlaceholder} alt="Organization deactivated" />
  </div>
);
