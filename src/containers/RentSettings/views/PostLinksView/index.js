import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {
  addItemLinkLocally,
  addShopItemsLinks,
  getItemByLink,
  getItemLinkSet,
  removeItemLinkLocally
} from "../../../../store/actions/stockActions";
import Notify from "../../../../components/Notification";
import {translate} from "../../../../locales/locales";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import "./index.scss"
import {Formik} from "formik";
import * as Yup from "yup";
import config from "../../../../config";
import {InputTextField} from "../../../../components/UI/InputTextField";
import BaseButton from "../../../../components/UI/BaseButton";
import classNames from "classnames";
import LinkItem from "../../../../components/LinkItem";
import {useTransition} from "react-spring";
import * as classnames from "classnames";
import Preloader from "../../../../components/Preloader";

const VALIDATION_SCHEMA = Yup.object({
  link: Yup.string()
    .trim()
    .matches(`^${config.domain}\/p/\(\\d+)\/?`, translate('Ссылка не корректна', 'notify.linkIncorrect'))
    .required(translate('Введите ссылку на товар c Apofiz.com', 'notify.specifyTheLinkFromApofiz'))
})

const Links = ({postID, onBack, onSubmit}) => {
  const dispatch = useDispatch()

  const isFirstMount = useRef(true);

  const {loading, data: links} = useSelector(state => state.stockStore.links)
  const linksWithTransitions = useTransition(links, link => link.id, {
    from: { position: 'relative', left: '100%' },
    enter: { left: '0%' },
    leave: { left: '100%' },

    delay: 200,
    config: {
      duration: 200,
      delay: 400,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getItemLinkSet(postID)).then(res => {
      if (!res.success) {
        Notify.error({
          text: translate('Что-то пошло не так', 'app.fail')
        })
      }
      isFirstMount.current = false;
    })
  }, [dispatch, postID]);

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const res = await dispatch(
      addShopItemsLinks(postID, {
        shop_items_link_set: links.map(link => link.link),
      })
    )
    if (res && res.success) {
      onSubmit()
    }
    setIsSubmitting(false)
  }

  const handleLinkAdding = async ({link}, {setFieldError}) => {
    const res = await dispatch(getItemByLink(link));

    if (res.success) {
      if (links.find(link => link.id === res.data.id)) {
        return setFieldError('link', translate('Ссылка уже существует', 'notify.linkAlreadyExist'))
      }

      dispatch(addItemLinkLocally({...res.data, link}))
    }
  }

  const handleLinkDeletion = id => {
    dispatch(removeItemLinkLocally(id))
  }

  return (
    <div className="post-links-view">
      <MobileTopHeader
        title={translate('Связи с арендой', 'rent.connectionsWithRent')}
        onBack={onBack}
        onNext={handleSubmit}
        disabled={isSubmitting}
        nextLabel={translate('Готово', 'app.done')}
        style={{
          marginBottom: 30
        }}
      />
      <div className="container">
        <div className="links-view__desc f-14">
          <p>
            <b>{translate('Примечание', 'printer.note')}</b>
            <i>

              {translate(
                'Добавляйте ссылки на товары и создавайте готовые луки или товары на разные цвета. Ссылки доступны только на товары с ресурса',
                'stock.createLinks'
              )}
            </i>
          </p>
          <b>{translate('Пример ссылки:', 'stock.linkExample')}</b>{' '}
          <span className="links-view__link-example">https://apofiz.com/p/1234?ref=1234</span>
        </div>

        <h3
          className="links-view__form-title f-20 f-500">{translate('Добавление ссылок на товары', 'stock.addingLinks')}</h3>

        <Formik validationSchema={VALIDATION_SCHEMA} initialValues={{link: ''}} onSubmit={handleLinkAdding}>
          {({values, touched, errors, handleSubmit, handleChange}) => {
            const err = errors.link && touched.link && errors.link
            return (
              <form onSubmit={handleSubmit} style={{marginBottom: 16}}>
                <div className={classNames("post-links-view__input-box", err && 'post-links-view__input-box--error')}>
                  <InputTextField
                    name="link"
                    value={values.link}
                    onChange={handleChange}
                    placeholder={translate('ссылка на товар Apofiz.com', 'app.linkToApofizPost')}
                    className="post-links-view__input-link"
                  />
                  <BaseButton variant="text" className="text-submit-button" type="submit">
                    Add
                  </BaseButton>
                </div>
                <p className="post-links-view__input-box-error">{err}</p>
              </form>
            )
          }}
        </Formik>


        {loading && !links.length ? (
          <Preloader />
        ) : (
          <div className={classnames('links-view__list', linksWithTransitions.length !== 0 && 'links-view__list_not-empty')}>
            {linksWithTransitions.map(link => {
              return (
                <LinkItem
                  link={link.item}
                  onDelete={handleLinkDeletion}
                  className="links-view__list-item"
                  style={isFirstMount.current ? null : link.props}
                  key={link.item.id}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Links;