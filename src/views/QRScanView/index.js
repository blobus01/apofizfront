import React from 'react';
import QrReader from 'react-qr-reader'
import SearchInputQR from '../../components/UI/SearchInputQR';
import {BackArrow} from '../../components/UI/Icons';
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../components/UI/WideButton";
import {translate} from "../../locales/locales";
import {QR_PREFIX} from "../../common/constants";
import './index.scss';

// TODO: use containers/ScanView instead
const QRScanView = ({
                      onBack,
                      onScan,
                      onScanError,
                      onInputSubmit,
                      inputPlaceholder,
                      showNoIDButton = false,
                      button,
                      delay = 300
                    }) => {
  const [text, setText] = React.useState('');

  const onChange = e => {
    setText(e.target.value);
  };

  return (
    <div className="qr-scan-view">
      <div className="qr-scan-view__top">
        <div className="container">
          {onBack && (
            <button type="button" onClick={onBack} className="qr-scan-view__top-back">
              <BackArrow/>
            </button>
          )}
        </div>
      </div>

      <div className="qr-scan-view__reader-container">
        <div className="container">
          <QrReader
            delay={delay}
            onError={onScanError}
            onScan={onScan}
            facingMode="environment"
            className="qr-scan-view__reader"
          />
        </div>
      </div>

      {onInputSubmit && (
        <div className="qr-scan-view__bottom" >
          <div className="container">
            {showNoIDButton && (
              <WideButton
                variant={WIDE_BUTTON_VARIANTS.ACCEPT}
                style={{
                  marginBottom: 15
                }}
                onClick={() => onScan(QR_PREFIX + ' 1')}
              >
                {translate('Нет QR и ID', 'shop.noQRAndID')}
              </WideButton>
            )}
            {button && (
              <WideButton
                style={{
                  marginBottom: 15
                }}
                {...button}
              />
            )}

            <SearchInputQR
              name="id"
              value={text}
              onChange={onChange}
              placeholder={inputPlaceholder}
              onSubmit={() => onInputSubmit(text)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanView;