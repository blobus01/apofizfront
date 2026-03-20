import React, {useLayoutEffect, useRef, useState} from 'react';
import {ImageWithPlaceholder} from "../../../ImageWithPlaceholder";
import classNames from "classnames";
import Truncate from "react-truncate";
import AnimatedDoubleCheckmark from "../../../Animated/AnimatedDoubleCheckmark";
import PlaceholderImage from "../../../PlaceholderImage";
import {getPostImage} from "../../../../common/helpers";
import {DoubleCheckmarkIcon} from "../../../UI/Icons";
import AnimatedCrossIcon from "../../../Animated/AnimatedCrossIcon";
import "./index.scss"

const SelectableCompilationItem = ({compilation, selected, onClick, className}) => {
  const prevSelectedState = useRef(selected)
  const [getSelected, setGetSelected] = useState(false);
  const [getUnselected, setGetUnselected] = useState(false);

  const postImage = getPostImage(compilation.image, 'small')

  useLayoutEffect(() => {
    if (selected && selected !== prevSelectedState.current) {
      setGetSelected(true)
    } else if (!selected && selected !== prevSelectedState.current) {
      setGetUnselected(true)
    }
  }, [selected]);

  return (
    <div className={classNames('compilation-item', className)} onClick={onClick}>
      <div
        className={classNames("compilation-item__image-wrapper", (selected || getUnselected) && 'compilation-item__image-wrapper--covered')}>
        {postImage ? (
          <ImageWithPlaceholder
            src={postImage}
            alt={compilation.name}
            className="compilation-item__image"
          />
        ) : (
          <PlaceholderImage wrapperProps={{className: 'compilation-item__image'}}  />
        )}
        {selected && !getSelected && (
          <DoubleCheckmarkIcon
            className="compilation-item__icon"
          />
        )}
        {getSelected && (
          <AnimatedDoubleCheckmark
            width="100%"
            height="100%"
            className={classNames('compilation-item__animation')}
          />
        )}
        {getUnselected && (
          <AnimatedCrossIcon
            width="100%"
            height="100%"
            className={classNames('compilation-item__animation')}
          />
        )}

      </div>

      <h5 className="compilation-item__name f-12">
        <Truncate lines={2}>
          {compilation.name}
        </Truncate>
      </h5>
    </div>
  );
};


export default SelectableCompilationItem;