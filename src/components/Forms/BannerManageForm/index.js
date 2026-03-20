import React from "react";
import { Formik } from "formik";
import MobileTopHeader from "../../MobileTopHeader";
import BannerOrganizationsView from "../../../containers/BannerOrganizationsView";
import { ArrowRight } from "../../UI/Icons";
import OrganizationCard from "../../Cards/OrganizationCard";
import Button from "../../UI/Button";
import * as Yup from "yup";
import { translate } from "../../../locales/locales";
import "./index.scss";

const VALIDATION_SCHEMA = Yup.object({
  image: Yup.mixed(),
  imageURL: Yup.string().required(),
  organization: Yup.object({
    id: Yup.number().required(),
    title: Yup.string().required(),
    image: Yup.mixed(),
  }),
});

const BannerManageForm = ({
  onSubmit,
  onDelete,
  onBack,
  details,
  organization,
}) => {
  return (
    <Formik
      enableReinitialize
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={onSubmit}
      initialValues={{
        image: null,
        imageURL:
          (details &&
            details.data &&
            details.data.image &&
            details.data.image.file) ||
          null,
        organization:
          (details && details.data && details.data.linked_organization) || null,
        step: 0,
      }}
    >
      {({ values, setFieldValue, setValues, handleSubmit }) => (
        <React.Fragment>
          {values.step === 0 && (
            <form onSubmit={handleSubmit} className="banner-manage-form">
              <MobileTopHeader
                title={
                  onDelete
                    ? translate("Баннер", "banners.banner")
                    : translate("Новый баннер", "banners.newBanner")
                }
                onBack={onBack}
              />
              <div className="banner-manage-form__content">
                <div className="container">
                  <label htmlFor="image" className="banner-manage-form__label">
                    {values.imageURL ? (
                      <img
                        src={values.imageURL}
                        alt="Banner"
                        className="banner-manage-form__image"
                      />
                    ) : (
                      <div className="banner-manage-form__upload-info">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.375 0H2.625C1.17525 0 0 1.17525 0 2.625V15.375C0 16.8247 1.17525 18 2.625 18H15.375C16.8247 18 18 16.8247 18 15.375V2.625C18 1.17525 16.8247 0 15.375 0ZM8 13.51L11.1987 9.3883C11.3256 9.22469 11.5612 9.19498 11.7248 9.32196C11.7513 9.34248 11.7748 9.36644 11.7949 9.39321L15.55 14.4C15.6743 14.5657 15.6407 14.8007 15.475 14.925C15.4101 14.9737 15.3311 15 15.25 15H2.76674C2.55963 15 2.39174 14.8321 2.39174 14.625C2.39174 14.5416 2.41954 14.4606 2.47073 14.3948L5.21359 10.8682C5.34074 10.7048 5.57634 10.6753 5.73982 10.8025C5.76122 10.8191 5.78075 10.838 5.79807 10.8589L8 13.51Z"
                            fill="#818C99"
                          />
                        </svg>
                        <p className="f-16 f-600">
                          {translate("Выберите баннер", "banners.chooseBanner")}
                        </p>
                        <p className="f-14">
                          {translate(
                            "Рекомендуемый размер баннера",
                            "banners.recommendation"
                          )}
                        </p>
                        <p>650*296</p>
                      </div>
                    )}

                    <input
                      type="file"
                      name="image"
                      id="image"
                      onChange={(e) => {
                        setValues({
                          ...values,
                          image: e.target.files[0],
                          imageURL: URL.createObjectURL(e.target.files[0]),
                        });
                      }}
                      className="banner-manage-form__input"
                    />
                  </label>

                  <p className="banner-manage-form__org-label f-14">
                    {translate(
                      "Выбрать организацию",
                      "banners.selectOrganization"
                    )}
                  </p>
                  <div
                    className="banner-manage-form__org-select"
                    onClick={() => setFieldValue("step", 1)}
                  >
                    {values.organization ? (
                      <OrganizationCard
                        image={
                          values.organization.image &&
                          values.organization.image.medium
                        }
                        title={values.organization.title}
                        onClick={() => null}
                      />
                    ) : (
                      <p className="banner-manage-form__org-placeholder f-17 f-600">
                        {translate("Организация", "app.organization")}
                      </p>
                    )}
                    <ArrowRight />
                  </div>
                </div>

                <div className="container">
                  <Button
                    type="submit"
                    label={
                      onDelete
                        ? translate("Сохранить", "app.save")
                        : translate("Создать", "app.create")
                    }
                    onSubmit={handleSubmit}
                  />
                  {onDelete && (
                    <button
                      type="button"
                      onClick={onDelete}
                      className="banner-manage-form__remove f-15 f-500"
                    >
                      {translate("Удалить баннер", "banners.remove")}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {values.step === 1 && (
            <BannerOrganizationsView
              onBack={() => setFieldValue("step", 0)}
              onSelect={(value) =>
                setValues({
                  ...values,
                  organization: value,
                  step: 0,
                })
              }
              organization={organization}
            />
          )}
        </React.Fragment>
      )}
    </Formik>
  );
};

export default BannerManageForm;
