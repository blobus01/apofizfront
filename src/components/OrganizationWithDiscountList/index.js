import React from 'react';
import OrganizationDscCard from "../Cards/OrganizationDscCard";
import classNames from "classnames";
import {item} from "./index.module.scss"

const OrganizationWithDiscountList = ({data = [], generateProps, ...rest}) => {

  if (!data.length) return null

  return (
    <div {...rest}>
      {data.map(org => {
        const props = (generateProps && generateProps(org)) ?? {}

        return (
          <OrganizationDscCard
            organization={org}
            className={classNames(item, props.className)}
            key={org.id}
            {...props}
          />
        )
      })}
    </div>
  );
};

export default OrganizationWithDiscountList;