import React, {useEffect, useRef, useState} from 'react';
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../UI/WideButton";
import {translate} from "../../../locales/locales";
import classNames from "classnames";
import AnimatedDoubleCheckmark from "../../Animated/AnimatedDoubleCheckmark";
import "./index.scss"

export const ASPECT_RATIOS = {
  one_to_one: 1,
  four_to_five: 4/5,
  four_to_three: 4/3,
}

const AspectRatioSelectionMenu = ({defaultRatio = ASPECT_RATIOS.four_to_five, onSubmit, onClose}) => {
  const [ratio, setRatio] = useState(defaultRatio);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(false);

  const isRatioSelected = r => r === ratio

  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onSubmit(ratio)
      onClose()
    } catch (e) {
      console.error(e)
    }
    finally {
      isMounted.current && setIsSubmitting(false)
    }
  }

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, []);
  
  return (
    <div className="aspect-ratio-selection-menu container">
      <div className="aspect-ratio-selection-menu__aspect-ratios">
        <button
          onClick={() => setRatio(ASPECT_RATIOS.one_to_one)}
          className={
            classNames(
              "aspect-ratio-selection-menu__aspect-ratio-wrap",
              isRatioSelected(ASPECT_RATIOS.one_to_one) && 'aspect-ratio-selection-menu__aspect-ratio-wrap--selected'
            )
          }
        >
          <div
            className="aspect-ratio-selection-menu__aspect-ratio aspect-ratio-selection-menu__aspect-ratio--one-to-one f-12"
          >
            1:1
          </div>
          {isRatioSelected(ASPECT_RATIOS.one_to_one) && <AnimatedDoubleCheckmark width={20}  height={20} className="aspect-ratio-selection-menu__selected-icon" />}
        </button>

        <button
          className={
            classNames(
              "aspect-ratio-selection-menu__aspect-ratio-wrap",
              isRatioSelected(ASPECT_RATIOS.four_to_five) && 'aspect-ratio-selection-menu__aspect-ratio-wrap--selected'
            )
          }
          onClick={() => setRatio(ASPECT_RATIOS.four_to_five)}
        >
          <div
            className="aspect-ratio-selection-menu__aspect-ratio aspect-ratio-selection-menu__aspect-ratio--four-to-five f-12"
          >
            4:5
          </div>
          {isRatioSelected(ASPECT_RATIOS.four_to_five) && <AnimatedDoubleCheckmark width={20}  height={20} className="aspect-ratio-selection-menu__selected-icon" />}
        </button>

        <button
          className={
            classNames(
              "aspect-ratio-selection-menu__aspect-ratio-wrap",
              isRatioSelected(ASPECT_RATIOS.four_to_three) && 'aspect-ratio-selection-menu__aspect-ratio-wrap--selected'
            )
          }
          onClick={() => setRatio(ASPECT_RATIOS.four_to_three)}
        >
          <div
            className="aspect-ratio-selection-menu__aspect-ratio aspect-ratio-selection-menu__aspect-ratio--four-to-three f-12"
          >
            4:3
          </div>
          {isRatioSelected(ASPECT_RATIOS.four_to_three) && <AnimatedDoubleCheckmark width={20} height={20} className="aspect-ratio-selection-menu__selected-icon" />}
        </button>
      </div>
      <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT} onClick={handleSubmit} loading={isSubmitting}>
        {translate('Подтвердить', 'app.submit')}
      </WideButton>
    </div>
  );
};

export default AspectRatioSelectionMenu;