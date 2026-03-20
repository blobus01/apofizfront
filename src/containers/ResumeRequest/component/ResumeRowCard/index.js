import React from 'react';
import {Link} from "react-router-dom";
import Avatar from "../../../../components/UI/Avatar";
import {getPostImage} from "../../../../common/helpers";
import {translate} from "../../../../locales/locales";
import {prettyMoney} from "../../../../common/utils";
import classNames from "classnames";

const ResumeRowCard = ({data, className, to}) => {
  const image = getPostImage(data, 'small')

  return (
    <Link to={to ?? `/p/${data.id}`} className={classNames('resume-row-card', className)}>
      {image && (
        <Avatar
          size={72}
          src={image}
          alt="resume"
          className="resume-row-card__avatar"
        />
      )}

      <div className="resume-row-card__right">
        <p className="resume-row-card__position f-14 f-500">
          {translate('Должность', 'resumes.position')}:
        </p>
        <p className="resume-row-card__name f-15 f-500 tl">
          {data.name}
        </p>
        <p className="resume-row-card__salary">
          {!!data.salary_to && (
            <>
              <span className="resume-row-card__salary-from f-14 f-500">
                {prettyMoney(data.salary_from, false, data.currency).replaceAll("'", '')}
              </span>
              <span className="resume-row-card__salary-separator"/>
            </>
          )}

          {!!data.salary_to ? (
            <span className="resume-row-card__salary-to f-700">
              {prettyMoney(data.salary_to, false, data.currency).replaceAll("'", ' ')}
            </span>
          ) : (
            <span className="resume-row-card__salary-from resume-row-card__salary-from--highlighted f-700">
              {prettyMoney(data.salary_from, false, data.currency).replaceAll("'", ' ')}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
};

export default ResumeRowCard;