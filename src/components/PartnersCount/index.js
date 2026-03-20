import React from 'react';
import {Link} from "react-router-dom";
import * as classnames from 'classnames';
import {abbreviateNumber} from "../../common/utils";
import './index.scss';

const PartnersCount = ({ partners, count, organizationID, className }) => {
  if (!partners || !count) { return null; }

  return (
    <div className={classnames("partners-count", className)}>
      <Link to={`/organizations/${organizationID}/partners`} className="partners-count__group">
        {partners.map(partner => (
          <div key={partner.id} className="partners-count__group-image">
            <img
              src={partner.image && partner.image.medium}
              alt={partner.title}
            />
          </div>
        ))}
      </Link>

      <Link to={`/organizations/${organizationID}/partners`} className="partners-count__count f-12 f-500">
        {abbreviateNumber(count, 1)}
      </Link>
    </div>
  )
};

export default PartnersCount;