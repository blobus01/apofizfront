import React, {Component} from 'react';
import * as Yup from 'yup';
import {injectIntl} from 'react-intl';
import {Formik} from 'formik';
import {connect} from 'react-redux';
import MobileTopHeader from '../../MobileTopHeader';
import {InputTextField} from '../../UI/InputTextField';
import {setViews} from '../../../store/actions/commonActions';
import {ALLOWED_FORMATS, HOTLINK_TYPES} from '../../../common/constants';
import {VIEW_TYPES} from '../../GlobalLayer';
import Button from '../../UI/Button';
import {CONTACT_REGEX, WEBSITE_REGEX} from '../../../common/helpers';
import {translate} from '../../../locales/locales';
import './index.scss';

const getValidationSchema = type => Yup.object().shape({
  file: Yup.object().required(' '),
  link: Yup.string().matches(type === HOTLINK_TYPES.link ? WEBSITE_REGEX : CONTACT_REGEX, ' ').required(' '),
});

class HotlinkForm extends Component {

  onImageUpload = (e, formikBag) => {
    const {values, setValues} = formikBag;
    const image = e.target.files[0];
    if (image && ALLOWED_FORMATS.includes(image.type)) {
      this.props.setViews({
        type: VIEW_TYPES.image_crop,
        onBack: () => this.props.setViews([]),
        onSave: images => {
          setValues({...values, file: images[0]});
          this.props.setViews([]);
        },
        uploads: [image]
      })
    }
  }

  render() {
    const {data, type, onBack, intl, onRemove, onSubmit} = this.props;

    return (
      <Formik
        validationSchema={getValidationSchema(type)}
        onSubmit={onSubmit}
        initialValues={{
          file: data ? data.image : null,
          link: data ? data.content : '',
          type: data && data.link_type
        }}
      >
        {formikBag => {
          const {values, errors, touched, isSubmitting, handleChange, handleSubmit} = formikBag;
          return (
            <form onSubmit={handleSubmit} className="hotlink-form">
              <MobileTopHeader
                title={translate("Быстрая ссылка", "hotlink.hotlink")}
                onSubmit={handleSubmit}
                onBack={onBack}
                submitLabel={isSubmitting
                  ? translate('Сохранение', 'app.saving')
                  : translate('Сохранить', 'app.save')}
                disabled={isSubmitting}
              />
              <div className="hotlink-form__content">
                <div className="container containerMax">
                  {values.file ? (
                    <div className="hotlink-form__preview">
                      <div className="hotlink-form__preview-image">
                        <img
                          src={(values.file && values.file.id) ? values.file.file : values.file}
                          alt="Preview"
                        />
                      </div>
                      <label htmlFor="image" className="hotlink-form__preview-label">{translate("Изменить", "app.change")}</label>
                    </div>
                  ) : (
                    <label htmlFor="image" className="hotlink-form__image-label">
                      <div className="hotlink-form__image-content">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 10H34V24H38V10C38 7.794 36.206 6 34 6H8C5.794 6 4 7.794 4 10V34C4 36.206 5.794 38 8 38H24V34H8V10Z" fill="#818C99"/>
                          <path d="M16 22L10 30H32L24 18L18 26L16 22Z" fill="#818C99"/>
                          <path d="M38 28H34V34H28V38H34V44H38V38H44V34H38V28Z" fill="#818C99"/>
                        </svg>
                        <p className="f-14 f-400">{translate("Загрузить изображение", "app.uploadImage")}</p>
                        <p className="f-14 f-400">{translate("Рекомендуемый размер 4*5", "app.recommendedSize45")}</p>
                      </div>
                    </label>
                  )}

                  <input
                    id="image"
                    name="image"
                    type="file"
                    onChange={e => this.onImageUpload(e, formikBag)}
                    className="hotlink-form__image-input"
                  />

                  <h1 className="hotlink-form__title f-20 f-500">
                    {type === HOTLINK_TYPES.link
                      ? translate("Добавить ссылку", "hotlink.addLink")
                      : translate("Добавить телефон или почту", "hotlink.addContactOrEmail")}
                  </h1>

                  <InputTextField
                    name="link"
                    onChange={handleChange}
                    value={values.link}
                    placeholder={type === HOTLINK_TYPES.link
                      ? intl.formatMessage({ id: 'hotlink.linkPlaceholder', defaultMessage: "https://link или http://link" })
                      : intl.formatMessage({ id: 'hotlink.contactPlaceholder', defaultMessage: "+ Номер телефона или @почта" })}
                    className="hotlink-form__input"
                    error={errors.link && touched.link && errors.link}
                  />

                  <p className="hotlink-form__note f-14 f-400">
                    {type === HOTLINK_TYPES.link ? (
                      <>
                        <b>{translate("Примечание:", "printer.note")}</b> <i>{translate("Добавляйте любые ссылки как на внешние ресурсы так и организации и товары с ресурса Apofiz.com", "hotlink.linkNote")}</i>
                      </>
                    ) : (
                      <>
                        <b>{translate("Примечание:", "printer.note")}</b> <i>{translate("Добавляйте любые номера телефонов используя  + (код страны) (номер телефона) или электронную почту (example@mail.com)", "hotlink.contactNote")}</i>
                      </>
                    )}
                  </p>
                </div>

                <div className="container containerMax">
                  {data ? (
                    <Button
                      type="button"
                      label={translate("Удалить", "app.delete")}
                      onClick={onRemove}
                      className="hotlink-form__delete button-danger"
                    />
                  ) : (
                    <Button
                      type="submit"
                      label={translate("Создать", "app.create")}
                      onSubmit={handleSubmit}
                      disabled={isSubmitting || !values.file || !values.link}
                      className="hotlink-form__submit"
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

export default connect(null, mapDispatchToProps)(injectIntl(HotlinkForm));