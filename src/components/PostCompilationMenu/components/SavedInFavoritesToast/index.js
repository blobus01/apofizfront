import React from 'react';
import {translate} from "../../../../locales/locales";
import ButtonBookmark from "../../../UI/ButtonBookmark";
import {DoubleCheckmarkIcon} from "../../../UI/Icons";
import AnimatedDoubleCheckmark from "../../../Animated/AnimatedDoubleCheckmark";
import AnimatedBookmarkIcon from "../../../Animated/AnimatedBookmarkIcon";
import AnimatedCrossIcon from "../../../Animated/AnimatedCrossIcon";
import "../../index.scss"

const SavedInFavoritesToast = ({onBookmarkClick, playAnimation, isDeleting}) => {

  let icon = <DoubleCheckmarkIcon className="post-compilation-menu__saved-in-favorites-toast-icon"/>
  if (isDeleting) icon = <AnimatedCrossIcon width={32} height={32} className="post-compilation-menu__saved-in-favorites-toast-icon"/>
  else if (playAnimation) icon = <AnimatedDoubleCheckmark className="post-compilation-menu__saved-in-favorites-toast-icon"/>

  return (
    <div className="post-compilation-menu__saved-in-favorites-toast">
      <div className="post-compilation-menu__saved-in-favorites-toast-content dfc justify-center container">
        {icon}
        <p className="post-compilation-menu__saved-in-favorites-toast-text f-14 f-500">
          {isDeleting ?
            translate('Удалено из избранного', 'compilations.removedFromFavorites') :
            translate('Сохранено в избранном', 'compilations.savedInFavorites')
          }
        </p>
        {isDeleting ? (
          <ButtonBookmark
            isBookmarked={false}
            className="post-compilation-menu__saved-in-favorites-toast-button"
          />
        ) : (
          <button
            type="button"
            className="post-compilation-menu__saved-in-favorites-toast-button post-compilation-menu__saved-in-favorites-toast-button--animated"
            onClick={onBookmarkClick}
          >
            <AnimatedBookmarkIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default SavedInFavoritesToast;