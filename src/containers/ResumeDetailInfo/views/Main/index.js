import React, { useEffect, useState } from "react";
import DetailInfoForm, { FIELDS } from "../../components/DetailInfoForm";
import { VIEWS } from "../../constants";
import { useHistory } from "react-router-dom";
import EducationExperienceIcon from "@ui/Icons/EducationExperienceIcon";
import { useDispatch, useSelector } from "react-redux";
import {
  getResumeInfo,
  updateResumeInfo,
  uploadResumeFile,
} from "@store/services/resumeServices";
import Notify from "@components/Notification";
import { translate } from "@locales/locales";
import { getFileExtension, notifyQueryResult } from "@common/helpers";
import { setResumeDetailInfoCache } from "@store/actions/postActions";
import InfoIcon from "@ui/Icons/InfoIcon";
import { ContactIcon, WebIcon } from "@ui/Icons";
import RowLink from "@ui/RowLink";
import WorkExperienceIcon from "@ui/Icons/WorkExperienceIcon";
import Preloader from "@components/Preloader";

const Main = ({ onBack, onSubmit, id }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const cache = useSelector((state) => state.postStore.resumeDetailInfoCache);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const uploadFiles = async (files) => {
    const resArr = await Promise.allSettled(
      files.map((file) => {
        if (!(file instanceof File)) return Promise.resolve(file.id);
        const formData = new FormData();
        const fileExtension = getFileExtension(file.name);
        const fileName = file.name
          ?.split(".")[0]
          ?.slice(0, 99 - fileExtension.length);

        formData.append("file", file, `${fileName}.${fileExtension}`);
        return uploadResumeFile(formData, { timeout: 10000 }).then(
          (res) => res && res.success && res.data.id
        );
      })
    );

    return resArr
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);
  };

  const handleSubmit = async (values) => {
    const files = values[FIELDS.files];
    const languages = values[FIELDS.languages].map((lang) => lang.code);
    const uploadedFiles = await uploadFiles(files);

    if (files.length && files.length !== uploadedFiles.length) {
      Notify.error({
        text: translate(
          "Не удалось загрузить все файлы",
          "notify.fileUploadingFailed"
        ),
      });
    }

    await notifyQueryResult(
      updateResumeInfo({
        item: Number(id),
        gender: values[FIELDS.gender],
        full_name: values[FIELDS.full_name],
        date_of_birth: values[FIELDS.birthday] || null,
        languages,
        files: uploadedFiles,
      }),
      { notifySuccessRes: true }
    );

    return onSubmit();
  };

  const handleChange = (values) => {
    dispatch(setResumeDetailInfoCache(values));
  };

  useEffect(() => {
    notifyQueryResult(getResumeInfo(id)).then((res) => {
      if (res && res.success) {
        setData(res.data);
        setLoading(false);
      } else {
        setTimeout(() => history.goBack(), 2000);
      }
    });
  }, [history, id]);

  if (loading) return <Preloader className="resume-detail-info__preloader" />;

  return (
    <div className="resume-detail-info__main-view resume-detail-info__scrollable-view">
      <DetailInfoForm
        initialValues={
          cache
            ? cache
            : {
                [FIELDS.gender]: data.gender || null,
                [FIELDS.full_name]: data.full_name ?? "",
                [FIELDS.birthday]: data.date_of_birth,
                [FIELDS.languages]: data.languages ?? [],
                [FIELDS.files]: data.files,
              }
        }
        onChange={handleChange}
        onSubmit={handleSubmit}
        onBack={onBack}
      >
        <div className="resume-detail-info__main-view-links">
          <RowLink
            label={translate("Контакты", "app.contacts")}
            to={`?view=${VIEWS.contacts}`}
          >
            <WithBadge badge={data.contact_filled && <IconBadge />}>
              <ContactIcon />
            </WithBadge>
          </RowLink>

          <RowLink
            label={translate("Web / Социальные сети", "app.socialsAndWeb")}
            to={`?view=${VIEWS.socials}`}
          >
            <WithBadge badge={data.social_network_filled && <IconBadge />}>
              <WebIcon />
            </WithBadge>
          </RowLink>

          <RowLink
            label={translate(
              "Информация подробнее",
              "resumes.detailInfo.detailInfo"
            )}
            to={`?view=${VIEWS.detail_info}`}
          >
            <WithBadge badge={data.detail_info_filled && <IconBadge />}>
              <InfoIcon />
            </WithBadge>
          </RowLink>

          <RowLink
            label={translate(
              "Стаж работы",
              "resumes.detailInfo.workingExperience"
            )}
            to={`?view=${VIEWS.work_experience}`}
          >
            <WithBadge badge={data.work_experience_filled && <IconBadge />}>
              <WorkExperienceIcon />
            </WithBadge>
          </RowLink>

          <RowLink
            label={translate(
              "Стаж образования",
              "resumes.detailInfo.educationExperience"
            )}
            to={`?view=${VIEWS.education_experience}`}
          >
            <WithBadge badge={data.education_filled && <IconBadge />}>
              <EducationExperienceIcon />
            </WithBadge>
          </RowLink>
        </div>
      </DetailInfoForm>
    </div>
  );
};

const WithBadge = ({ children, badge }) => {
  if (!badge) return children;

  return (
    <div className="resume-detail-info__with-badge">
      {children}
      <div className="resume-detail-info__with-badge-badge">{badge}</div>
    </div>
  );
};

const IconBadge = (props) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={8} cy={8} r={8} fill="#27AE60" />
    <path
      d="M4 9.57876L6.36945 11.8169C6.51625 11.9555 6.69923 12.0191 6.88172 11.995C7.06421 11.9709 7.23272 11.8608 7.35345 11.6868L12 5"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

export default Main;
