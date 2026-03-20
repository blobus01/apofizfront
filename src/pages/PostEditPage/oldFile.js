// import React, { Component } from "react";
// import { connect } from "react-redux";
// import Preloader from "@components/Preloader";
// import {
//   deletePost,
//   getPostDetail,
//   updatePost,
// } from "@store/services/postServices";
// import {
//   uploadImageFromURL,
//   uploadVideoFromUrl,
//   uploadWatermarkedImage,
// } from "@store/services/commonServices";
// import PostEditForm from "@components/Forms/Post/PostEditForm";
// import { getOrganizationDetail } from "@store/services/organizationServices";
// import { notifyQueryResult } from "@common/helpers";
// import { translate } from "@locales/locales";
// import DialogContext from "@components/UI/Dialog/DialogContext";
// import {
//   clearOrganizationCategoryCache,
//   getOrganizationPosts,
//   setOrganizationPostsState,
// } from "@store/actions/organizationActions";
// import { UPDATE_POST_IN_CACHE } from "@store/actionTypes/postTypes";
// import { updatePostInCache } from "@store/actions/postActions";

// class PostEditPage extends Component {
//   constructor(props) {
//     super(props);
//     this.orgID = props.match.params.id;
//     this.postID = props.match.params.postID;
//     this.state = {
//       loading: true,
//       post: null,
//       orgCurrency: null,
//       loadingEditPost: false,
//     };
//   }

//   componentDidMount() {
//     getPostDetail(this.postID)
//       .then((res) => {
//         if (res && res.success) {
//           getOrganizationDetail(res.data.organization.id).then((response) => {
//             if (response && response.success) {
//               const canEdit = response.data.permissions.can_edit_organization;
//               const parsedPost = canEdit && {
//                 ...res.data,
//                 images: [
//                   ...res.data.images,
//                   ...res.data.instagram_data.images.map((image, index) => ({
//                     id: `image_${index}`,
//                     ...image,
//                   })),
//                 ],
//                 videos: [
//                   ...res.data.videos,
//                   ...res.data.instagram_data.videos.map((video, index) => ({
//                     id: `video_${index}`,
//                     ...video,
//                   })),
//                 ],
//               };
//               parsedPost
//                 ? this.setState((prevState) => ({
//                     ...prevState,
//                     post: parsedPost,
//                     loading: false,
//                     orgCurrency: response.data.currency,
//                   }))
//                 : this.props.history.push(`/organizations/${this.orgID}/`);
//             }
//           });
//         }
//       })
//       .finally(() =>
//         this.setState((prevState) => ({ ...prevState, loading: false })),
//       );
//   }

//   onRemove = async () => {
//     const { post } = this.state;
//     const { history, clearPosts, posts, setPostsState } = this.props;

//     try {
//       await this.context.dialog.confirm({
//         title: translate("Удаление", "app.deletion"),
//         description: translate("", "dialog.deletePost"),
//         confirmTitle: (
//           <span style={{ color: "#D72C20" }}>
//             {translate("Удалить", "app.delete")}
//           </span>
//         ),
//         cancelTitle: (
//           <span style={{ color: "#4285F4" }}>
//             {translate("Отмена", "app.cancellation")}
//           </span>
//         ),
//       });

//       if (posts && posts.list) {
//         const newPostsList = posts.list.filter((item) => item.id !== post.id);

//         setPostsState({
//           posts: {
//             ...posts,
//             list: newPostsList,

//             total_count: (posts.total_count || 1) - 1,
//           },
//         });
//       }

//       if (clearPosts) {
//         clearPosts();
//       }

//       history.push(`/organizations/${this.orgID}`);

//       deletePost(post.id).catch((err) => {
//         console.error("Ошибка при удалении поста на сервере:", err);
//       });
//     } catch (e) {}
//   };

//   onSubmit = async (values) => {
//     if (this.state.loadingEditPost) return;

//     this.setState((prevState) => ({
//       ...prevState,
//       loadingEditPost: true,
//     }));

//     const { history } = this.props;
//     const { post } = this.state;
//     const {
//       title,
//       description,
//       cost,
//       article,
//       discount,
//       instagram,
//       preview,
//       images,
//       videos,
//       youtube,
//       minimumPurchase,
//       selectedSubcategory,
//     } = values;

//     // Базовый ID превью (может быть временным строковым ID)
//     let mainImageID = preview && preview.id;

//     // --- ПОДГОТОВКА PAYLOAD (Синхронная часть) ---
//     const payload = {
//       article,
//       name: title,
//       description,
//       organization: this.orgID,
//       youtube_links: youtube ? youtube.map((video) => video.link) : [],
//       images: [], // Заполним позже
//       videos: [], // Заполним позже
//       price: cost === "" || isNaN(cost) ? null : Number(cost),
//       discount: discount && !isNaN(Number(discount)) ? Number(discount) : 0,
//       minimum_purchase:
//         minimumPurchase && !isNaN(Number(minimumPurchase))
//           ? Number(minimumPurchase)
//           : undefined,
//       instagram_link: instagram || undefined,
//       subcategory: selectedSubcategory ? selectedSubcategory.id : undefined,
//       // subcategory:
//       //   values.selectedSubcategories.length > 0
//       //     ? values.selectedSubcategories.map((s) => s.id)
//       //     : undefined,
//     };

//     // Сохраняем старые данные инстаграма, если они были
//     if (post && post.instagram_data) {
//       payload.instagram_data = {
//         images: [...post.instagram_data.images],
//         videos: [...post.instagram_data.videos],
//       };
//     }

//     // --- АСИНХРОННАЯ ЗАГРУЗКА ФАЙЛОВ ---

//     // 2. Функция обработки изображений
//     const processImages = async () => {
//       // Разделяем на старые (числа) и новые (строки/файлы)
//       const oldImages = [];
//       const newImagesToUpload = [];

//       images.forEach((img) => {
//         if (typeof img.id === "number") {
//           oldImages.push(img.id);
//         } else if (typeof img.id === "string") {
//           // Исправление ID как в оригинальном коде
//           newImagesToUpload.push({
//             ...img,
//             id: img.id.replace("video", "image"),
//           });
//         }
//       });

//       let uploadedIds = [];

//       // Если есть новые картинки — грузим их
//       if (newImagesToUpload.length > 0) {
//         const uploadPromises = newImagesToUpload.map((item) =>
//           item.id.includes("image")
//             ? uploadImageFromURL(item.file, true, item.id)
//             : uploadWatermarkedImage(item.original, item.id),
//         );

//         const results = await Promise.all(uploadPromises);

//         results.forEach((res) => {
//           if (res && res.success) {
//             const newId = res.data.id;
//             const tempId = res.data.tempID;

//             uploadedIds.push(newId);

//             // Если загруженная картинка была выбрана как главная (по временному ID)
//             // обновляем mainImageID на реальный ID с сервера
//             if (tempId === mainImageID) {
//               mainImageID = newId;
//             }
//           }
//         });
//       }

//       // Собираем итоговый массив ID картинок
//       const allImageIds = [...oldImages, ...uploadedIds];

//       // Ставим главную картинку первой
//       if (typeof mainImageID === "number") {
//         return [mainImageID, ...allImageIds.filter((id) => id !== mainImageID)];
//       }
//       return allImageIds;
//     };

//     // 3. Функция обработки видео
//     const processVideos = async () => {
//       if (!videos || videos.length === 0) return [];

//       const uploadPromises = videos.map((item) =>
//         uploadVideoFromUrl({
//           thumbnail_url: item.thumbnail,
//           video_url: item.video_url || item.video,
//         }),
//       );

//       const results = await Promise.all(uploadPromises);
//       const videoIds = [];

//       results.forEach((res) => {
//         if (res && res.success) {
//           videoIds.push(res.data.id);
//         }
//       });

//       console.log("VIDEO PREVIEWS", results);
//       return videoIds;
//     };

//     try {
//       // 4. ЗАПУСКАЕМ ОБЕ ЗАГРУЗКИ ПАРАЛЛЕЛЬНО!
//       // Это главное ускорение: видео не ждут картинки, картинки не ждут видео.
//       const [finalImages, finalVideos] = await Promise.all([
//         processImages(),
//         processVideos(),
//       ]);

//       payload.images = finalImages;
//       payload.videos = finalVideos;

//       // 5. Отправляем обновление поста
//       await notifyQueryResult(updatePost(this.postID, payload), {
//         successMsg: translate(
//           "Пост успешно обновлен",
//           "notify.updatePostSuccess",
//         ),
//         errorMsg: translate("Что-то пошло не так", "app.fail"),

//         onSuccess: (res) => {
//           const updatedData = {
//             ...res.data,
//             updated_at: res.data.updated_at || new Date().toISOString(), // Гарантируем наличие свежей даты
//           };

//           this.props.refreshPosts(this.orgID);

//           this.props.updatePostInCache(this.postID, updatedData);
//           history.push(`/organizations/${this.orgID}`);
//         },

//         onFailure: () => {
//           this.setState((prevState) => ({
//             ...prevState,
//             loadingEditPost: false,
//           }));
//         },
//       });
//     } catch (error) {
//       console.error("Error updating post:", error);
//       this.setState((prevState) => ({
//         ...prevState,
//         loadingEditPost: false,
//       }));
//     }
//   };

//   render() {
//     const { post, orgCurrency, loading, loadingEditPost } = this.state;

//     console.log("POSTS", post);

//     return (
//       <div className="post-edit-page">
//         {loading ? (
//           <Preloader />
//         ) : post ? (
//           <PostEditForm
//             history={this.props.history}
//             orgID={this.orgID}
//             currency={orgCurrency}
//             onSubmit={this.onSubmit}
//             onRemove={this.onRemove}
//             loadingEditPost={loadingEditPost}
//             post={post}
//           />
//         ) : null}
//       </div>
//     );
//   }
// }

// PostEditPage.contextType = DialogContext;

// const mapStateToProps = (state) => ({
//   orgDetail: state.organizationStore.orgDetail,
//   posts: state.postsStore.organization.posts,
// });

// const mapDispatchToProps = (dispatch) => ({
//   getOrganizationDetail: (id) => dispatch(getOrganizationDetail(id)),
//   refreshPosts: (orgId) =>
//     dispatch(getOrganizationPosts(orgId, { page: 1, limit: 16 })),
//   clearPosts: () => dispatch(clearOrganizationCategoryCache()),
//   setPostsState: (state) => dispatch(setOrganizationPostsState(state)),
//   updatePostInCache: (postId, updates) =>
//     dispatch(updatePostInCache(postId, updates)),
// });
// export default connect(mapStateToProps, mapDispatchToProps)(PostEditPage);
