import React from 'react';
import {translate} from "../../../../locales/locales";
import AnimatedDoubleCheckmark from "../../../Animated/AnimatedDoubleCheckmark";
import "../../index.scss"

const SavedInCompilationsToast = () => {
  return (
    <div className="post-compilation-menu__saved-in-compilations-toast dfc justify-center">
      <div className="post-compilation-menu__saved-in-compilations-toast-content dfc">
        <AnimatedDoubleCheckmark className="post-compilation-menu__saved-in-compilations-toast-animation"/>
        {translate('Сохранено в подборки', 'notify.postSavedInCompilationsSuccess')}
      </div>
    </div>
  );
};

export default SavedInCompilationsToast;