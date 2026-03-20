import React, {useEffect, useRef} from 'react';
import {Formik} from "formik";
import * as Yup from "yup";
import {ERROR_MESSAGES} from "../../common/messages";
import {InputTextField} from "../UI/InputTextField";
import {translate} from "../../locales/locales";
import {useDispatch, useSelector} from "react-redux";
import {getPost} from "../../store/actions/postActions";
import {ImageWithPlaceholder} from "../ImageWithPlaceholder";
import classNames from "classnames";
import Notify from "../Notification";
import SavedInCompilationSuccessToast from "../Toasts/SavedInCompilationSuccessToast";
import {createCollection} from "../../store/services/collectionServices";
import PlaceholderImage from "../PlaceholderImage";
import {getPostImage} from "../../common/helpers";
import "./index.scss"

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup
    .string()
    .min(1, null)
    .max(100, ERROR_MESSAGES.max_message_limit)
    .required(null)
})

const PostCompilationCreateMenu = ({onClose, postID}) => {
  const dispatch = useDispatch()
  const { data: postDetail } = useSelector(state => state.postStore.postDetail);
  const titleRef = useRef(null);

  useEffect(() => {
    dispatch(getPost(postID))
  }, [dispatch, postID]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus()
    }
  }, []);

  const handleSubmit = async values => {
    const res = await createCollection({
      name: values.title,
      items: postID,
      is_bookmarked: true
    })
    if (res.success) {
      Notify.custom(<SavedInCompilationSuccessToast />, {
        className: 'toastify-toast-reset',
      })
      onClose()
    } else {
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      console.error(res.error)
    }
  }

  const postImage = getPostImage(postDetail, 'small')

  return (
    <div className="post-compilation-create-menu container">
      <Formik
        initialValues={{
          title: ''
        }}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({values: {title}, handleChange, isSubmitting, handleSubmit, errors}) => {
          const errorsCount = Object.keys(errors).length
          return (
            <form onSubmit={handleSubmit} className="post-compilation-create-menu__form">
              {postDetail && postDetail?.id === postID && postImage ? (
                <ImageWithPlaceholder
                  src={postImage}
                  alt={postDetail.name}
                  width={74}
                  height={74}
                  className="post-compilation-create-menu__image"
                />
              ) : (
                <PlaceholderImage wrapperProps={{className: 'post-compilation-create-menu__placeholder-image'}}  />
              )}
              <InputTextField
                name="title"
                value={title}
                onChange={handleChange}
                className="post-compilation-create-menu__title"
                error={errors.title}
                ref={titleRef}
              />
              <button
                type="submit"
                disabled={title.length === 0 || errorsCount > 0 || isSubmitting}
                className={classNames(
                  "post-compilation-create-menu__add-btn f-18 f-500",
                  (title.length === 0 || errorsCount > 0) && 'post-compilation-create-menu__add-btn--grey'
                )}
              >
                {translate('Добавить', 'app.add')}
                {isSubmitting && (
                  <LoadingIcon
                    className="post-compilation-create-menu__add-btn-loader"
                  />
                )}
              </button>
            </form>
          )
        }}
      </Formik>
    </div>
  );
};

const LoadingIcon = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="#4285F4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 6V3m4.25 4.75L18.4 5.6M18 12h3m-4.75 4.25l2.15 2.15M12 18v3m-4.25-4.75L5.6 18.4M6 12H3m4.75-4.25L5.6 5.6"
    ></path>
  </svg>
)

export default PostCompilationCreateMenu;