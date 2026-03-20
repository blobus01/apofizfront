import React from 'react';
import AnimatedCrossIcon from "../../../Animated/AnimatedCrossIcon";
import {translate} from "../../../../locales/locales";

const DeletedFromCompilationToast = () => {
  return (
    <div className="post-compilation-menu__deleted-from-compilation-toast dfc justify-center">
      <div className="post-compilation-menu__deleted-from-compilation-toast-content dfc">
        <AnimatedCrossIcon className="post-compilation-menu__deleted-from-compilation-toast-animation" width={32} height={32} />
        {translate('Удалено из подборки', 'notify.deleteFromCompilationSuccess')}
      </div>
    </div>
  );
};

export default DeletedFromCompilationToast;