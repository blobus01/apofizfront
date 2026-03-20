import React, {useCallback, useState} from 'react';
import DialogContext from "./DialogContext";
import Dialog from "./Dialog";
import {translate} from "../../../locales/locales";

const DialogProvider = ({children}) => {
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [alertDialog, setAlertDialog] = useState(null);

  const handleConfirmDialogClose = (isOk) => {
    setConfirmDialog(prev => ({...prev, open: false}));

    return isOk ? confirmDialog.resolve() : confirmDialog.reject();
  };

  const handleAlertDialogClose = () => {
    setAlertDialog(prev => ({...prev, open: false}));

    return alertDialog.resolve();
  }

  const confirm = useCallback((options) => {
    return new Promise((resolve, reject) => {
      setConfirmDialog({options, resolve, reject, open: true});
    });
  }, []);

  const alert = useCallback((options) => {
    return new Promise((resolve, reject) => {
      setAlertDialog({options, resolve, reject, open: true});
    });
  }, []);

  return (
    <DialogContext.Provider value={{dialog: {confirm, alert}}}>
      {confirmDialog && (
        <Dialog
          className={confirmDialog.options.className}
          title={confirmDialog.options.title}
          description={confirmDialog.options.description}
          open={confirmDialog.open}
          buttons={[
            {onClick: () => handleConfirmDialogClose(true), variant: 'confirm', title: confirmDialog.options.confirmTitle || 'OK'},
            {onClick: () => handleConfirmDialogClose(false), variant: 'cancel', title: confirmDialog.options.cancelTitle || translate("Отмена", "app.cancellation")},
          ]}
        />
      )}
      {alertDialog && (
        <Dialog
          title={alertDialog.options.title}
          description={alertDialog.options.description}
          open={alertDialog.open}
          buttons={[
            {onClick: handleAlertDialogClose, variant: 'confirm', title: alertDialog.options.confirmTitle || 'OK'},
          ]}
        />
      )}

      {children}
    </DialogContext.Provider>
  );
};

export default React.memo(DialogProvider);