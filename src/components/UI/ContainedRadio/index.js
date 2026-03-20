import React from 'react';
import * as classnames from "classnames";
import './index.scss'

const ContainedRadio = ({onChange, checked, label, className, ...rest}) => {
  return (
    <label className={classnames("contained-radio f-16", className)}>
      <span>{label}</span>
      <input type="radio" onChange={onChange} name="type" checked={checked} {...rest} />
      <div className="contained-radio__checkbox">
        <svg className="contained-radio__checkbox-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4.58984 11.0371C4.94727 11.0371 5.22266 10.8965 5.41602 10.6094L10.9004 2.14844C11.0352 1.9375 11.0938 1.74414 11.0938 1.5625C11.0938 1.08203 10.7422 0.736328 10.25 0.736328C9.91602 0.736328 9.70508 0.853516 9.5 1.18164L4.56641 8.98633L2.04688 5.81055C1.85352 5.57031 1.64258 5.45898 1.34961 5.45898C0.851562 5.45898 0.494141 5.81055 0.494141 6.29688C0.494141 6.50781 0.564453 6.70703 0.746094 6.91797L3.77539 10.6387C4.00391 10.9141 4.25586 11.0371 4.58984 11.0371Z"
            fill="white"/>
        </svg>
      </div>
    </label>
  )
};

export default ContainedRadio;