import React, {useState} from 'react';
import Placeholder from '../../assets/images/no_image.jpg';

export const ImageWithPlaceholder = props => {
  const [error, setError] = useState(false);
  const placeholder = props.placeholder ? props.placeholder : Placeholder
  return (
    <img alt={props.alt} {...props} src={(!error && props.src) ? props.src : placeholder} onError={() => setError(true)} />
  );
};