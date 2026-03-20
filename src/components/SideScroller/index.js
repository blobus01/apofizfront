import React, {useEffect, useRef} from 'react';
import {translate} from '../../locales/locales';
import './index.scss';

const SideScroller = () => {
  const position = useRef(0);

  useEffect(() => {
    const el = document.getElementById('scroller');
    const onScroll = () => {
      position.current = window.pageYOffset;
      if (position.current > 0) {
        return el && el.classList.add('visible');
      }
      el && el.classList.remove('visible');
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onClick = () => {
    position.current = 0;
    window.scroll({top: position});
  };

  return (
    <div className="side-scroller" id="scroller" onClick={onClick}>
      <div className="side-scroller__text dfc">
        <span className="f-14 f-400">{translate("Наверх", "app.up")}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.43526 3.64502L1.83826 7.75577C1.41376 8.24102 1.75876 9.00002 2.40301 9.00002H9.59701C9.74119 9.00014 9.88236 8.9587 10.0036 8.88066C10.1248 8.80262 10.221 8.69129 10.2806 8.56C10.3402 8.42871 10.3607 8.28302 10.3396 8.14038C10.3185 7.99775 10.2568 7.86421 10.1618 7.75577L6.56476 3.64577C6.49436 3.56521 6.40755 3.50065 6.31014 3.45641C6.21273 3.41217 6.10699 3.38928 6.00001 3.38928C5.89303 3.38928 5.78728 3.41217 5.68988 3.45641C5.59247 3.50065 5.50565 3.56521 5.43526 3.64577V3.64502Z" fill="#2F80ED"/>
        </svg>
      </div>
    </div>
  );
};

export default SideScroller;