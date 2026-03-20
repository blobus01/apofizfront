import React from 'react';
import "./index.scss"

const ReceiptCardSkeleton = props => {
  return (
    <div className="receipt-card-skeleton row" {...props}>
      <div></div>
      <div></div>
    </div>
  )
}

const ReceiptListSkeleton = ({itemNum = 21}) => {
  return (
    <div>
      {new Array(itemNum).fill(null).map((_, idx) => (
        <ReceiptCardSkeleton key={idx}/>
      ))}
    </div>
  );
};

export default ReceiptListSkeleton;