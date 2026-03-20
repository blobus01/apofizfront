import React, {Component} from 'react';
import * as Yup from 'yup';
import {Formik} from 'formik';
import {connect} from 'react-redux';
import {injectIntl} from 'react-intl';
import MobileTopHeader from '../../MobileTopHeader';
import {InputTextField} from '../../UI/InputTextField';
import {ALLOWED_FORMATS} from '../../../common/constants';
import Button from '../../UI/Button';
import {VIEW_TYPES} from '../../GlobalLayer';
import {setViews} from '../../../store/actions/commonActions';
import {validateForNumber} from '../../../common/helpers';
import UserCard from '../../Cards/UserCard';
import {translate} from '../../../locales/locales';
import {prettyDate} from '../../../common/utils';
import OrganizationCard from '../../Cards/OrganizationCard';
import {PromotionIcon} from '../../UI/Icons';
import './index.scss';

const VALIDATION_SCHEMA = Yup.object().shape({
  file: Yup.object().required(' '),
});

class PromotionForm extends Component {

  onImageUpload = (e, formikBag) => {
    const {values, setValues} = formikBag;
    const image = e.target.files[0];
    if (image && ALLOWED_FORMATS.includes(image.type)) {
      this.props.setViews({
        type: VIEW_TYPES.image_horizontal_crop,
        onBack: () => this.props.setViews([]),
        onSave: images => {
          setValues({...values, file: images[0]});
          this.props.setViews([]);
        },
        uploads: [image]
      })
    }
  }

  validate = (values) => {
    const errors = {};
    if (Number(values.total) < Number(values.cashback)) {
      errors.total = 'Сумма за всю акцию не может быть меньше суммы кэшбека за подписку'
    }

    if (!(values.total && values.cashback && parseInt(Number(values.total) / Number(values.cashback)))) {
      errors.hasFollowers = true
    }

    return errors;
  };

  render() {
    const {data, organization, intl, onBack, onRemove, onSubmit} = this.props;

    return (
      <Formik
        validate={this.validate}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={onSubmit}
        enableReinitialize
        initialValues={{
          id: data && data.id,
          total: data ? Number(data.total_cashback) : '',
          cashback: data ? Number(data.cashback) : '',
          file: data ? data.image : null
        }}
      >
        {formikBag => {
          const {values, errors, touched, isSubmitting, setFieldValue, handleSubmit} = formikBag;

          return (
            <form onSubmit={handleSubmit} className="promotion-form">
              <MobileTopHeader
                title={data ? translate("Редактировать", "app.toEdit") : translate("Кэшбек за подписку", "promoCashback.cashbackForSubs")}
                onSubmit={data && handleSubmit}
                submitLabel={isSubmitting ?
                  translate('Сохранение', 'app.saving') :
                  translate('Сохранить', 'app.save')
                }
                disabled={isSubmitting}
                onBack={onBack}
              />
              <div className="promotion-form__content">
                <div className="container">
                  {values.file ? (
                    <div className="promotion-form__preview">
                      <div className="promotion-form__preview-image">
                        <img
                          src={(values.file && values.file.id) ? values.file.file : values.file}
                          alt="Preview"
                        />

                        {organization && (
                          <div className="promotion-form__organization">
                            <OrganizationCard
                              key={organization.title}
                              size={24}
                              id={organization.id}
                              title={organization.title}
                              image={organization.image && organization.image.medium}
                            />
                          </div>
                        )}

                        {organization && values.cashback && (
                          <div className="promotion-form__preview-tile">
                            <div className="promotion-form__preview-tile-content">
                              <span className="f-14 f-500">{translate("Кэшбэк за подписку", "promoCashback.cashbackForSubs")} {Number(values.cashback)} {organization.currency}</span>
                              <PromotionIcon  color="#FFF" />
                            </div>
                          </div>
                        )}
                      </div>
                      <label htmlFor="image" className="promotion-form__preview-label">{translate("Изменить", "app.change")}</label>
                    </div>
                  ) : (
                    <label htmlFor="image" className="promotion-form__image-label">
                      <div className="promotion-form__image-content">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 10H34V24H38V10C38 7.794 36.206 6 34 6H8C5.794 6 4 7.794 4 10V34C4 36.206 5.794 38 8 38H24V34H8V10Z" fill="#818C99"/>
                          <path d="M16 22L10 30H32L24 18L18 26L16 22Z" fill="#818C99"/>
                          <path d="M38 28H34V34H28V38H34V44H38V38H44V34H38V28Z" fill="#818C99"/>
                        </svg>
                        <p className="f-14 f-400">{translate("Загрузите изображение", "hint.uploadImage")}</p>
                        <p className="f-12 f-400">{translate("Рекомендуемый размер", "hint.recommendedSize")} 16*9</p>
                        <p className="f-12 f-400"><i>{translate("", "promoCashback.promoAvailability")}Ваша акция станет доступна на главной странице</i></p>
                      </div>
                    </label>
                  )}

                  <input
                    id="image"
                    name="image"
                    type="file"
                    onChange={e => this.onImageUpload(e, formikBag)}
                    className="promotion-form__image-input"
                  />

                  <div className="promotion-form__title f-18 f-500">{translate("Укажите сумму всей акции", "promoCashback.setTotal")}</div>
                  <InputTextField
                    name="total"
                    value={values.total}
                    label={`${intl.formatMessage({ id: "promoCashback.totalForPromo", defaultMessage: "Сумма за всю акцию" })} ${organization ? `(${organization.currency})` : ''}`}
                    className="promotion-form__input"
                    error={errors.total && touched.total && errors.total}
                    onChange={e => {
                      const {isValid, isEmpty, value} = validateForNumber(e.target.value, { isFloat: true, min: 0, max: 1000000000});
                      if (isValid || isEmpty) {
                        setFieldValue('total', value);
                      }
                    }}
                  />

                  {data && data.edit_logs && !!data.edit_logs.length && (
                    <div className="promotion-form__employee">
                      <UserCard
                        avatar={data.edit_logs[0].employee_avatar}
                        fullname={data.edit_logs[0].employee_name}
                        description={data.edit_logs[0].employee_role}
                        withBorder
                      />
                      <p className="promotion-form__date f-13 f-500">
                        {data.edit_logs.length > 1 && translate("Исправлено", "shop.edited")}
                        {data.edit_logs.length > 1
                          ? `: ${prettyDate(data.edit_logs[0].created_at, true)}`
                          : prettyDate(data.edit_logs[0].created_at, true)
                        }
                      </p>
                    </div>
                  )}

                  <div className="promotion-form__title f-18 f-500">{translate("Укажите сумму кэшбэк за подписку", "promoCashback.setCashback")}</div>
                  <InputTextField
                    name="cashback"
                    onChange={e => {
                      const {isValid, isEmpty, value} = validateForNumber(e.target.value, { isFloat: true, min: 0, max: 1000000000});
                      if (isValid || isEmpty) {
                        setFieldValue('cashback', value);
                      }
                    }}
                    value={values.cashback}
                    label={`${intl.formatMessage({ id: "promoCashback.totalForSubs", defaultMessage: "Сумма за подписку" })} ${organization ? `(${organization.currency})` : ''}`}
                    className="promotion-form__input"
                    error={errors.cashback && touched.cashback && errors.cashback}
                  />

                  <div className="promotion-form__title f-18 f-500">{translate("Калькулятор подпичиков за кэшбэк", "promoCashback.followerCalculator")}</div>
                  <InputTextField
                    name="followers"
                    onChange={() => null}
                    value={(values.total && values.cashback && parseInt(Number(values.total) / Number(values.cashback))) ? parseInt(Number(values.total) / Number(values.cashback)) : ''}
                    label={intl.formatMessage({ id: "promoCashback.followersCount", defaultMessage: "Количество подписчиков" })}
                    className="promotion-form__input followers"
                  />

                  <div className="promotion-form__warning">
                    <div className="promotion-form__warning-title"><b>{translate("Внимание", "app.warning")}:</b></div>
                    <ol className="promotion-form__warning-list">
                      <li>{translate("Акция кэшбэк за подписку, доступна при наличии суммы всей акции. Сумму всегда можно изменить или отменить проведение акции удалив средства.", "promoCashback.noteOne")}</li>
                      <li>{translate("Сумму кэшбэк за подписку всегда можно изменить, но при этом нельзя поставить ноль.", "promoCashback.noteTwo")}</li>
                      <li>{translate("Статистику по подпискам вы можете посмотреть в подписках организации.", "promoCashback.noteThree")}</li>
                    </ol>
                  </div>
                </div>

                <div className="container">
                  {data ? (
                    <Button
                      type="button"
                      label={translate("Удалить", "app.delete")}
                      onClick={onRemove}
                      className="promotion-form__delete button-danger"
                    />
                  ) : (
                    <Button
                      type="submit"
                      label={translate("Создать", "app.create")}
                      onSubmit={handleSubmit}
                      disabled={isSubmitting || !(values.total && values.cashback && values.file)}
                      className="promotion-form__submit"
                    />
                  )}
                </div>
              </div>
            </form>
          )
        }}
      </Formik>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setViews: view => dispatch(setViews(view)),
});

export default connect(null, mapDispatchToProps)(injectIntl(PromotionForm));