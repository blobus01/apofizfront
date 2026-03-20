import React from 'react';
import PartnerCard from "../Cards/PartnerCard";
import classNames from "classnames";
import "./index.scss"

const PartnerList = ({partners, generateProps, className}) => {
  if (!partners || partners.length === 0) return null

  return (
    <div className={classNames('partner-list', className)}>
      {partners.map(partner => {
        const props = (generateProps && generateProps(partner)) ?? {}
        return (
          <PartnerCard
            key={partner.id}
            partner={partner}
            count={partner.unprocessed_transaction_count}
            {...props}
            className={classNames('partner-list__item', props.className)}
          />
        )
      })}
    </div>
  );
};

export default PartnerList;