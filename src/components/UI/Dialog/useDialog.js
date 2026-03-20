import {useContext} from 'react';
import DialogContext from './DialogContext';

const useDialog = () => {
  const {dialog} = useContext(DialogContext);
  return dialog;
};

export default useDialog;