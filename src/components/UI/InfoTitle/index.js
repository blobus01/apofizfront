import * as classnames from 'classnames';
import AnimatedInfoIcon from '../../Animated/AnimatedInfoIcon';
import { NoteIcon } from '../Icons';
import './index.scss';

export const InfoTitle = ({ title, className, animated = true, ...other }) => {
  return (
    <div className={classnames('info-title', className)} {...other}>
      {animated ? <AnimatedInfoIcon /> : <NoteIcon className="info-title__icon" />}
      <span className="info-title__text">{title}</span>
    </div>
  );
};
