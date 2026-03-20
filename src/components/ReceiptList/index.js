import React from 'react';
import ReceiptCard from "../Cards/ReceiptCard";
import classNames from "classnames";
import "./index.scss"

const ReceiptList = ({data = [], generateProps, className}) => {
  return (
    <div className={classNames('receipt-list', className)}>
      {data.map(item => {
        const props = (generateProps && generateProps(item)) ?? {}

        return (
          <ReceiptCard
            receipt={item}
            {...props}
            className={classNames('receipt-list__item', props.className)}
            key={item.id}
          />
        )
      })}
    </div>
  );
};

export default ReceiptList;