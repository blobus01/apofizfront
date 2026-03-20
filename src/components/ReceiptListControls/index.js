import React from 'react';
import SavingsBlock from "../UI/SavingsBlock";
import TimeIntervalSelect from "../TimeIntervalSelect";
import ExcelTransactionsDownloader from "../../containers/ExcelTransactionsDownloader";
import DownloadExcelButton from "../DownloadExcelButton";
import classNames from "classnames";
import "./index.scss"

const ReceiptListControls = ({
                               start,
                               end,
                               setStart,
                               setEnd,
                               stats,
                               getExcelFile,
                               className
                             }) => {
  return (
    <div className={classNames('receipt-list-controls', className)}>
      <SavingsBlock
        total={stats && stats.total_spent}
        savings={stats && stats.total_savings}
        currency={stats && stats.currency}
        className="receipt-list-controls__savings-block"
      />
      <div className="receipt-list-controls__receipts-actions">
        <TimeIntervalSelect
          start={start}
          end={end}
          onChange={({start, end}) => {
            setStart(start)
            setEnd(end)
          }}
          className="receipt-list-controls__date-selection-interval"
        />
        <ExcelTransactionsDownloader
          onDownload={() => getExcelFile()}
          render={({download, isDownloading}) => (
            <DownloadExcelButton onClick={download} loading={isDownloading}/>
          )}
        />
      </div>
    </div>
  );
};

export default ReceiptListControls;