import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { notifyQueryResult } from "../../../../common/helpers";
import { getResumeInfo } from "../../../../store/services/resumeServices";
import Preloader from "../../../Preloader";
import { LOCALES, translate } from "../../../../locales/locales";
import moment from "moment/moment";
import { DATE_FORMAT_DD_MM_YYYY, GENDER } from "../../../../common/constants";
import HorizontalListField, {
  HorizontalListFieldItem,
} from "../../../HorizontalListField";
import RowLink from "../../../UI/RowLink";
import { VIEWS } from "../../../../containers/ResumeDetailInfo/constants";
import { ContactIcon, WebIcon } from "../../../UI/Icons";
import InfoIcon from "../../../UI/Icons/InfoIcon";
import WorkExperienceIcon from "../../../UI/Icons/WorkExperienceIcon";
import EducationExperienceIcon from "../../../UI/Icons/EducationExperienceIcon";
import LoadedDataIcon from "../../../UI/Icons/LoadedDataIcon";
import FemaleIcon from "../../../UI/Icons/FemaleIcon";
import MaleIcon from "../../../UI/Icons/MaleIcon";
import { InputTextField } from "../../../UI/InputTextField";

const ResumeDetail = ({ resume }) => {
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState({
    gender: null,
    full_name: null,
    date_of_birth: null,
    languages: null,
    files: [],
    contact_filled: false,
    social_network_filled: true,
    detail_info_filled: true,
    work_experience_filled: true,
    education_filled: true,
  });
  const [error, setError] = useState(null);

  const locale = useSelector((state) => state.userStore.locale);

  useEffect(() => {
    notifyQueryResult(getResumeInfo(resume.id)).then((res) => {
      if (res && res.success) {
        setDetailData(res.data);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [resume.id]);

  if (loading) return <Preloader />;

  if (error) return null;

  const resumeDetailPageURI = `/resumes/${resume.id}/detail-info/`;

  return (
    <div className="post-feed-card__resume-detail">
      {detailData.gender && (
        <GenderField
          value={detailData.gender}
          className="post-feed-card__resume-detail-field"
        />
      )}

      {resume.name && (
        <InfoField
          label={translate(
            "Запрашиваемая должность",
            "resumes.requestedPosition"
          )}
          value={resume.name}
          className="post-feed-card__resume-detail-field"
        />
      )}

      {detailData.full_name && (
        <InfoField
          label={translate("ФИО", "profile.fullname")}
          value={detailData.full_name}
          className="post-feed-card__resume-detail-field"
        />
      )}

      {detailData.date_of_birth && (
        <InfoField
          label={translate("Дата рождения", "profile.birthday")}
          value={moment(detailData.date_of_birth).format(
            DATE_FORMAT_DD_MM_YYYY
          )}
          className="post-feed-card__resume-detail-field"
        />
      )}

      {detailData.languages?.length > 0 && (
        <HorizontalListField
          label={translate("Язык владения", "resumes.detailInfo.language")}
          disabled
          className="post-feed-card__resume-detail-field"
        >
          {detailData.languages?.map((lang) => {
            return (
              <HorizontalListFieldItem
                text={lang.national_language}
                key={lang.national_language}
              />
            );
          })}
        </HorizontalListField>
      )}

      {!!resume.salary_from && (
        <InfoField
          label={translate("Зарплата  от", "resumes.resumeForm.salaryFrom")}
          value={`${resume.salary_from} ${resume.currency}`}
          className="post-feed-card__resume-detail-field"
        />
      )}

      {!!resume.salary_to && (
        <InfoField
          label={translate("Зарплата  до", "resumes.resumeForm.salaryTo")}
          value={`${resume.salary_to} ${resume.currency ?? ""}`}
          className="post-feed-card__resume-detail-field"
        />
      )}

      {!!resume.education.length && (
        <HorizontalListField
          label={translate("Образование", "resumes.resumeForm.education")}
          disabled
          className="post-feed-card__resume-detail-field"
        >
          {resume.education?.map((edu) => {
            return <HorizontalListFieldItem text={edu.name} key={edu.name} />;
          })}
        </HorizontalListField>
      )}

      {!!resume.citizenship?.length && (
        <HorizontalListField
          label={translate("Гражданство", "resumes.resumeForm.nationalities")}
          disabled
          className="post-feed-card__resume-detail-field"
        >
          {resume.citizenship?.map((citizenship) => {
            return (
              <HorizontalListFieldItem
                text={
                  locale === LOCALES.en
                    ? citizenship.name
                    : citizenship[`name_${locale}`]
                }
                key={citizenship.name}
              />
            );
          })}
        </HorizontalListField>
      )}

      {!!resume.current_locations?.length && (
        <HorizontalListField
          label={translate(
            "Адрес проживания город или страна",
            "resumes.resumeDetail.addresses"
          )}
          disabled
          className="post-feed-card__resume-detail-field"
        >
          {resume.current_locations?.map((loc) => {
            return (
              <HorizontalListFieldItem
                text={locale === LOCALES.en ? loc.name : loc[`name_${locale}`]}
                key={loc.name}
              />
            );
          })}
        </HorizontalListField>
      )}

      {!!resume.preferred_locations?.length && (
        <HorizontalListField
          label={translate(
            "Город вакансии или страна",
            "resumes.resumeForm.resumeRegions"
          )}
          disabled
          className="post-feed-card__resume-detail-field"
        >
          {resume.preferred_locations?.map((loc) => {
            return (
              <HorizontalListFieldItem
                text={locale === LOCALES.en ? loc.name : loc[`name_${locale}`]}
                key={loc.name}
              />
            );
          })}
        </HorizontalListField>
      )}

      {detailData.contact_filled && (
        <RowLink
          label={translate("Контакты", "app.contacts")}
          to={`${resumeDetailPageURI}?view=${VIEWS.contacts}`}
        >
          <ContactIcon />
        </RowLink>
      )}

      {detailData.social_network_filled && (
        <RowLink
          label={translate("Web / Социальные сети", "app.socialsAndWeb")}
          to={`${resumeDetailPageURI}?view=${VIEWS.socials}`}
        >
          <WebIcon />
        </RowLink>
      )}

      {detailData.detail_info_filled && (
        <RowLink
          label={translate(
            "Информация подробнее",
            "resumes.detailInfo.detailInfo"
          )}
          to={`${resumeDetailPageURI}?view=${VIEWS.detail_info}`}
        >
          <InfoIcon />
        </RowLink>
      )}

      {detailData.work_experience_filled && (
        <RowLink
          label={translate(
            "Стаж работы",
            "resumes.detailInfo.workingExperience"
          )}
          to={`${resumeDetailPageURI}?view=${VIEWS.work_experience}`}
        >
          <WorkExperienceIcon />
        </RowLink>
      )}

      {detailData.education_filled && (
        <RowLink
          label={translate(
            "Стаж образования",
            "resumes.detailInfo.educationExperience"
          )}
          to={`${resumeDetailPageURI}?view=${VIEWS.education_experience}`}
        >
          <EducationExperienceIcon />
        </RowLink>
      )}

      {!!detailData.files?.length && (
        <RowLink
          label={translate(
            "Загруженные данные",
            "resumes.detailInfo.loadedData"
          )}
          to={`${resumeDetailPageURI}?view=${VIEWS.files}`}
        >
          <LoadedDataIcon />
        </RowLink>
      )}
    </div>
  );
};

const GenderField = ({ value = GENDER.not_specified, ...rest }) => {
  let icon = <FemaleIcon fill="#FF0000" />;
  let inputValue = translate("Женщина", "app.gender.female");

  if (value === GENDER.male) {
    inputValue = translate("Мужчина", "app.gender.male");
    icon = <MaleIcon fill="#007AFF" />;
  }

  return (
    <InfoField
      name="gender"
      label={translate("Пол", "app.gender")}
      value={inputValue}
      renderRight={icon}
      {...rest}
    />
  );
};

const InfoField = (props) => {
  return <InputTextField disabled {...props} />;
};

export default ResumeDetail;
