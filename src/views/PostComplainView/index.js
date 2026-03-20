import React from 'react';
import {Formik} from 'formik';
import MobileTopHeader from '../../components/MobileTopHeader';
import MessageTextarea from '../../components/UI/TextareaMessage';
import Button from '../../components/UI/Button';
import {DoneIcon} from '../../components/UI/Icons';
import {complainAboutPost} from '../../store/services/postServices';
import {translate} from '../../locales/locales';
import {injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import './index.scss';

const COMPLAIN_TYPES = [
  'Плохое качество фото',
  'Описание не соответсвует фото',
  'Указана неверная цена',
  'Фото содержит насилие или порно',
];

const TRANSLATIONS = [
  'complain.badQuality',
  'complain.notAsDescribed',
  'complain.incorrectPrice',
  'complain.hasBadImage',
];

class PostComplainView extends React.Component {
  onSubmit = values => {
    const payload = {
      item: this.props.post.id,
      reason: values.complains.join(', ') + `  Text: ${values.text}`,
    }
    complainAboutPost(payload).then(res => res && res.success && this.props.onBack());
  }

  render() {
    const {onBack, intl} = this.props;

    return (
      <Formik
        onSubmit={this.onSubmit}
        initialValues={{
          complains: [],
          text: '',
        }}
      >
        {({ values, setFieldValue, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
          <form className="post-complain-form" onSubmit={handleSubmit}>
            <MobileTopHeader
              title={translate("Товар", "shop.product")}
              submitLabel={translate("Отправить", "app.send")}
              onBack={onBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            <div className="post-complain-form__content">
              <div className="container">
                <ul className="post-complain-form__list">
                  {COMPLAIN_TYPES.map((type, idx) => (
                    <li
                      key={idx}
                      className="post-complain-form__list-item"
                      onClick={() => {
                        values.complains.includes(type)
                          ? setFieldValue('complains', values.complains.filter(item => item !== type))
                          : setFieldValue('complains', [...values.complains, type])}
                      }
                    >
                      <span className="f-15">{translate(type, TRANSLATIONS[idx])}</span>
                      {values.complains.includes(type) && <DoneIcon />}
                    </li>
                  ))}
                </ul>
                <MessageTextarea
                  placeholder={intl.formatMessage({ id: "complain.description", defaultMessage: "Описание жалобы"})}
                  name="text"
                  value={values.text}
                  onChange={handleChange}
                  error={errors.text && touched.text && errors.text}
                  className="post-complain-form__textarea"
                />

                <Button
                  type="submit"
                  label={translate("Отправить", "app.send")}
                  onSubmit={handleSubmit}
                  className="post-complain-form__submit"
                />
              </div>
            </div>
          </form>
        )}
      </Formik>
    );
  }
}

PostComplainView.propTypes = {
  onBack: PropTypes.func.isRequired,
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
};

export default injectIntl(PostComplainView);