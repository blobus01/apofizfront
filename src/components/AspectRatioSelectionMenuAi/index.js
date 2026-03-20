import React, { useEffect, useRef, useState } from 'react';
import { ASPECT_RATIOS } from './constants'; // или свой путь
import './index.scss';

const AspectRatioSelectionMenuAi = ({ defaultRatio = ASPECT_RATIOS.four_to_five, onSelect, onClose }) => {
  const [ratio, setRatio] = useState(defaultRatio);

  const isMounted = useRef(false);

  const handleClick = (value) => {
    setRatio(value);
    onSelect(value);   // ← сразу выбираем
    onClose();         // ← сразу закрываем меню
  };

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false };
  }, []);

  return (
    <div className="aspect-ratio-selection-menu">
      <button
        onClick={() => handleClick(ASPECT_RATIOS.one_to_one)}
        className="aspect-ratio-selection-menu__aspect-ratio-wrap"
      >
        <div className="aspect-ratio-selection-menu__aspect-ratio aspect-ratio-selection-menu__aspect-ratio--one-to-one f-12">
          1:1
        </div>
      </button>

      <button
        onClick={() => handleClick(ASPECT_RATIOS.four_to_five)}
        className="aspect-ratio-selection-menu__aspect-ratio-wrap"
      >
        <div className="aspect-ratio-selection-menu__aspect-ratio aspect-ratio-selection-menu__aspect-ratio--four-to-five f-12">
          4:5
        </div>
      </button>

      <button
        onClick={() => handleClick(ASPECT_RATIOS.four_to_three)}
        className="aspect-ratio-selection-menu__aspect-ratio-wrap"
      >
        <div className="aspect-ratio-selection-menu__aspect-ratio aspect-ratio-selection-menu__aspect-ratio--four-to-three f-12">
          4:3
        </div>
      </button>
    </div>
  );
};

export default AspectRatioSelectionMenuAi;
