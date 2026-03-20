import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import Preloader from "@components/Preloader";
import {
  deletePost,
  getPostDetail,
  updatePost,
} from "@store/services/postServices";
import {
  uploadImageFromURL,
  uploadVideoFromUrl,
  uploadWatermarkedImage,
} from "@store/services/commonServices";
import PostEditForm from "@components/Forms/Post/PostEditForm";
import { getOrganizationDetail } from "@store/services/organizationServices";
import { notifyQueryResult } from "@common/helpers";
import { translate } from "@locales/locales";
import DialogContext from "@components/UI/Dialog/DialogContext";
import {
  clearOrganizationCategoryCache,
  setOrganizationPostsState,
} from "@store/actions/organizationActions";
import { updatePostInCache } from "@store/actions/postActions";

const PostEditPage = () => {
  const { id: orgID, postID } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  // Достаем контекст. В зависимости от реализации провайдера это может быть сам объект или свойство dialog
  const context = useContext(DialogContext);
  const dialog = context?.dialog || context;

  // Redux state
  const posts = useSelector((state) => state.postsStore?.organization?.posts);

  // Local state
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [orgCurrency, setOrgCurrency] = useState(null);
  const [loadingEditPost, setLoadingEditPost] = useState(false);
  const [newThumbNail, setNewThumbNail] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPostDetail(postID)
      .then((res) => {
        if (res?.success && isMounted) {
          getOrganizationDetail(res.data.organization.id).then((response) => {
            if (response?.success && isMounted) {
              const canEdit = response.data.permissions.can_edit_organization;

              if (!canEdit) {
                history.push(`/organizations/${orgID}/`);
                return;
              }

              const parsedPost = {
                ...res.data,
                images: [
                  ...res.data.images,
                  ...(res.data.instagram_data?.images || []).map(
                    (image, index) => ({
                      id: `image_${index}`,
                      ...image,
                    }),
                  ),
                ],
                videos: [
                  ...res.data.videos,
                  ...(res.data.instagram_data?.videos || []).map(
                    (video, index) => ({
                      id: `video_${index}`,
                      ...video,
                    }),
                  ),
                ],
              };

              setPost(parsedPost);
              setOrgCurrency(response.data.currency);
            }
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false; // Предотвращаем утечку памяти при размонтировании
    };
  }, [postID, orgID, history, newThumbNail]);

  const onRemove = async () => {
    try {
      await dialog.confirm({
        title: translate("Удаление", "app.deletion"),
        description: translate("", "dialog.deletePost"),
        confirmTitle: (
          <span style={{ color: "#D72C20" }}>
            {translate("Удалить", "app.delete")}
          </span>
        ),
        cancelTitle: (
          <span style={{ color: "#4285F4" }}>
            {translate("Отмена", "app.cancellation")}
          </span>
        ),
      });

      // Оптимистичное удаление из локального стейта
      if (posts?.list) {
        const newPostsList = posts.list.filter((item) => item.id !== post.id);
        dispatch(
          setOrganizationPostsState({
            posts: {
              ...posts,
              list: newPostsList,
              total_count: Math.max((posts.total_count || 1) - 1, 0),
            },
          }),
        );
      }

      dispatch(clearOrganizationCategoryCache());
      history.push(`/organizations/${orgID}`);

      // Удаляем на сервере в фоне
      deletePost(post.id).catch((err) => {
        console.error("Ошибка при удалении поста на сервере:", err);
      });
    } catch (e) {
      // Пользователь отменил удаление
    }
  };

  const onSubmit = async (values) => {
    if (loadingEditPost) return;
    setLoadingEditPost(true);

    const {
      title,
      description,
      cost,
      article,
      discount,
      instagram,
      preview,
      images,
      videos,
      youtube,
      minimumPurchase,
      selectedSubcategory,
    } = values;

    let mainImageID = preview?.id;

    const payload = {
      article,
      name: title,
      description,
      organization: orgID,
      youtube_links: youtube ? youtube.map((video) => video.link) : [],
      images: [],
      videos: [],
      price: cost === "" || isNaN(cost) ? null : Number(cost),
      discount: discount && !isNaN(Number(discount)) ? Number(discount) : 0,
      minimum_purchase:
        minimumPurchase && !isNaN(Number(minimumPurchase))
          ? Number(minimumPurchase)
          : undefined,
      instagram_link: instagram || undefined,
      subcategory: selectedSubcategory?.id || undefined,
    };

    if (post?.instagram_data) {
      payload.instagram_data = {
        images: [...post.instagram_data.images],
        videos: [...post.instagram_data.videos],
      };
    }

    const processImages = async () => {
      const oldImages = [];
      const newImagesToUpload = [];

      images.forEach((img) => {
        if (typeof img.id === "number") {
          oldImages.push(img.id);
        } else if (typeof img.id === "string") {
          newImagesToUpload.push({
            ...img,
            id: img.id.replace("video", "image"),
          });
        }
      });

      let uploadedIds = [];

      if (newImagesToUpload.length > 0) {
        const uploadPromises = newImagesToUpload.map((item) =>
          item.id.includes("image")
            ? uploadImageFromURL(item.file, true, item.id)
            : uploadWatermarkedImage(item.original, item.id),
        );

        const results = await Promise.all(uploadPromises);

        results.forEach((res) => {
          if (res?.success) {
            const newId = res.data.id;
            uploadedIds.push(newId);
            if (res.data.tempID === mainImageID) {
              mainImageID = newId;
            }
          }
        });
      }

      const allImageIds = [...oldImages, ...uploadedIds];
      if (typeof mainImageID === "number") {
        return [mainImageID, ...allImageIds.filter((id) => id !== mainImageID)];
      }
      return allImageIds;
    };

    const processVideos = async () => {
      if (!videos || videos.length === 0) return [];

      console.log(videos);

      const uploadPromises = videos.map((item) =>
        uploadVideoFromUrl({
          thumbnail_url: item.thumbnail,
          video_url: item.video_url || item.video,
        }),
      );

      const results = await Promise.all(uploadPromises);
      return results.filter((res) => res?.success).map((res) => res.data.id);
    };

    try {
      // Параллельная загрузка медиа-файлов
      const [finalImages, finalVideos] = await Promise.all([
        processImages(),
        processVideos(),
      ]);

      payload.images = finalImages;
      payload.videos = finalVideos;

      await notifyQueryResult(updatePost(postID, payload), {
        successMsg: translate(
          "Пост успешно обновлен",
          "notify.updatePostSuccess",
        ),
        errorMsg: translate("Что-то пошло не так", "app.fail"),
        onSuccess: (res) => {
          const updatedData = {
            ...res.data,
            updated_at: res.data.updated_at || new Date().toISOString(),
          };

          // Оставляем обновление кэша для надежности (чтобы при рендере не мигали старые данные)
          dispatch(updatePostInCache(postID, updatedData));
          dispatch(clearOrganizationCategoryCache());

          // Жесткий редирект с полной перезагрузкой страницы (полностью обновляет все данные на странице организации)
          window.location.href = `/organizations/${orgID}`;
        },
        onFailure: () => {
          setLoadingEditPost(false);
        },
      });
    } catch (error) {
      console.error("Error updating post:", error);
      setLoadingEditPost(false);
    }
  };

  return (
    <div className="post-edit-page">
      {loading ? (
        <Preloader />
      ) : post ? (
        <PostEditForm
          history={history}
          orgID={orgID}
          currency={orgCurrency}
          onSubmit={onSubmit}
          onRemove={onRemove}
          setNewThumbNail={setNewThumbNail}
          loadingEditPost={loadingEditPost}
          post={post}
        />
      ) : null}
    </div>
  );
};

export default PostEditPage;
