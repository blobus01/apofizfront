import React, { useEffect, useMemo, useRef, useState } from "react";

import "./index.scss";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getPostDetail } from "@store/services/postServices";
import PageHelmet from "@components/PageHelmet";
import MobileTopHeader from "@components/MobileTopHeader";
import PostFeedCard from "@components/Cards/PostFeedCard";
import { PhoneIcon } from "@components/UI/Icons";

import qs from "qs";
import { setSearchState } from "@store/actions/userActions";

const PostDetailModal = ({ id, setIsModalOpen }) => {
  const history = useHistory();
  const location = useLocation();

  // Локальный стейт
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  // Ref для отслеживания mounted состояния (чтобы не обновлять стейт на размонтированном компоненте)
  const isMounted = useRef(true);
  const dispatch = useDispatch();

  // Получаем user из Redux
  const user = useSelector((state) => state.userStore.user);

  // Сложная логика выборки reduxPostUpdate перенесена в селектор
  const reduxPostUpdate = useSelector((state) => {
    // В кеше может лежать объект { is_liked: true }, без ID внутри.
    const cached = state.postStore.postsCache?.[id];
    const detail = state.postStore.postDetail?.data;

    // Если в postDetail есть данные и ID совпадает — берем их (приоритет).
    // Если нет — берем из кеша обновлений.
    return detail && String(detail.id) === String(id) ? detail : cached;
  }, shallowEqual);

  // componentDidMount + componentWillUnmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Функция скролла к контактам
  const scrollToContacts = (to) => {
    const el = document.getElementById(to);
    // Используем setInterval как в оригинале, чтобы дождаться рендера элемента
    const interval = setInterval(() => {
      const element = document.getElementById(to);
      if (element) {
        element.scrollIntoView({ block: "start", behavior: "smooth" });
        clearInterval(interval);
      }
    }, 1000);

    // Очистка интервала через 5 сек, чтобы не крутился вечно, если элемента нет (безопасность)
    setTimeout(() => clearInterval(interval), 5000);
  };

  // Основной эффект загрузки данных (аналог componentDidMount и componentDidUpdate)
  useEffect(() => {
    dispatch(setSearchState(false));

    const fetchPostDetails = async () => {
      setLoading(true);
      setPost(null);

      const { to, ref } = qs.parse(location.search.replace("?", ""));

      try {
        const res = await getPostDetail(id, ref);

        if (res && res.success && isMounted.current) {
          setPost(res.data);

          if (to === "contacts") {
            scrollToContacts(to);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchPostDetails();
  }, [id, location.search]); // Перезапускаем при смене ID или query params

  // --- ЛОГИКА СЛИЯНИЯ ---
  // Используем useMemo, чтобы не пересчитывать объект при каждом рендере,
  // если входные данные не изменились
  const displayedPost = useMemo(() => {
    if (!post) return null;
    if (!reduxPostUpdate) return post;

    return {
      ...post,
      ...reduxPostUpdate,
      // Восстанавливаем объекты, если в обновлении их нет (чтобы не сломать верстку)
      organization: reduxPostUpdate.organization || post.organization,
      images: reduxPostUpdate.images || post.images,
      instagram_data: reduxPostUpdate.instagram_data || post.instagram_data,
    };
  }, [post, reduxPostUpdate]);

  // Вычисление SEO картинки
  const imageSEO = useMemo(() => {
    if (!displayedPost) return null;

    let img =
      displayedPost?.images?.[0]?.medium ||
      displayedPost?.instagram_data?.images?.[0]?.medium;

    if (!img && displayedPost?.instagram_data?.videos?.length) {
      img = displayedPost.instagram_data.videos[0].thumbnail;
    }
    return img;
  }, [displayedPost]);

  return (
    <div className="post-detail-modal">
      {displayedPost && (
        <PageHelmet
          title={displayedPost.name}
          description={displayedPost.description}
          image={imageSEO}
          price={displayedPost.price}
          currency={displayedPost?.organization?.currency}
          url={location.pathname}
        />
      )}

      <MobileTopHeader
        title={(displayedPost && displayedPost.name) || ""}
        onBack={() => {
          setIsModalOpen(false);
          dispatch(setSearchState(true));
        }}
        style={{
          borderRadius: "0 0 16px 16px",
          boxShadow: "0 0px 4px rgba(0, 0, 0, 0.25)",
          background: "rgb(255,255,255, 0.8)",
          backdropFilter: "blur(4px)",
        }}
      />

      <div className="post-detail__content" style={{ marginTop: "20px" }}>
        {loading && !displayedPost ? (
          <div className="subscriptions-skeleton__card">
            <div
              className="subscriptions-skeleton__header"
              style={{ padding: 16 }}
            >
              <div className="subscriptions-skeleton__avatar" />
              <div className="subscriptions-skeleton__header-text">
                <div className="subscriptions-skeleton__line w-60" />
                <div className="subscriptions-skeleton__line w-40" />
              </div>
              <div className="subscriptions-skeleton__button-wrapper">
                <div className="subscriptions-skeleton__button-bottom" />
                <div className="subscriptions-skeleton__button" />
              </div>
            </div>

            <div className="subscriptions-skeleton__media" />

            <div
              className="subscriptions-skeleton__content"
              style={{ padding: 16 }}
            >
              <div className="subscriptions-skeleton__line w-90" />
              <div className="subscriptions-skeleton__line w-80" />
              <div className="subscriptions-skeleton__line w-70" />
              <div className="subscriptions-skeleton__line w-50" />
            </div>
          </div>
        ) : displayedPost ? (
          <>
            <PostFeedCard
              post={{
                ...displayedPost,
                is_hidden: false,
              }}
              noPin={true}
              permissions={displayedPost?.organization?.permissions}
              organization={displayedPost?.organization}
              refOrganization={displayedPost?.refOrganization}
              currency={displayedPost?.organization?.currency}
              contacts={displayedPost?.organization?.phone_numbers}
              className="shop-feed-view__card"
              isGuest={!user}
              showDescription
            />
          </>
        ) : (
          <div>Network connection error</div>
        )}

        <div id="contacts">
          {displayedPost &&
            displayedPost.organization &&
            displayedPost.organization.phone_numbers && (
              <div className="post-detail__contacts container">
                {displayedPost.organization.phone_numbers.map((tel) => (
                  <a
                    href={`tel:${tel.phone_number}`}
                    className="post-detail__contact"
                    key={tel.id}
                  >
                    <span className="tl" style={{ fontWeight: "500" }}>
                      {tel.phone_number}
                    </span>
                    <PhoneIcon />
                  </a>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
