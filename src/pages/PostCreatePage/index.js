import React, { Component } from "react";
import { connect } from "react-redux";
import PostCreateForm from "../../components/Forms/Post/PostCreateForm";
import { createPost } from "../../store/services/postServices";
import {
  uploadImageFromURL,
  uploadVideoFromUrl,
  uploadWatermarkedImage,
} from "../../store/services/commonServices";
import {
  getOrganizationDetail,
  getOrganizationPosts,
} from "../../store/actions/organizationActions";
import { notifyQueryResult } from "../../common/helpers";
import { translate } from "../../locales/locales";
import Preloader from "../../components/Preloader";
import Notify from "../../components/Notification";
import { addOrganizationPost } from "@store/actions/postActions";
import axios from "axios-api";

class PostCreatePage extends Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.id;
    this.state = {
      loadingSavePost: false,
      orgDetail: null,
    };
  }

  componentDidMount() {
    if (this.props.orgDetail.data) {
      this.setState((prevState) => ({
        ...prevState,
        orgDetail: this.props.orgDetail.data,
      }));
    } else {
      this.props.getOrganizationDetail(this.orgID).then((res) => {
        if (res && res.success) {
          this.setState((prevState) => ({
            ...prevState,
            orgDetail: res.data,
          }));
        } else {
          Notify.error({
            text: translate("Что-то пошло не так", "app.fail"),
          });
        }
      });
    }
  }

  onSubmit = async (values, { setSubmitting }) => {
    if (this.state.loadingSavePost) return;

    this.setState({
      loadingSavePost: true,
    });

    const {
      title,
      description,
      cost,
      article,
      discount,
      instagram,
      preview,
      images,
      youtube,
      videos,
      selectedSubcategory,
      minimumPurchase,
    } = values;

    let mainImageID = preview && preview.id;

    try {
      const imageIds = [];
      const uploads = await Promise.all(
        images.map((item) => uploadWatermarkedImage(item.original, item.id)),
      );

      uploads.forEach((res) => {
        if (res && res.success) {
          if (res.data.tempID === mainImageID) {
            mainImageID = res.data.id;
          }
          imageIds.push(res.data.id);
        }
      });

      const finalImages = [
        mainImageID,
        ...imageIds.filter((id) => id && id !== mainImageID),
      ];

      if (!finalImages.length) {
        this.setState({ loadingSavePost: false });
        setSubmitting(false);
        return null;
      }

      const formData = new FormData();

      formData.append("article", article || "");
      formData.append("name", title || "");
      formData.append("description", description || "");
      formData.append("organization", this.orgID);

      if (cost !== "") {
        formData.append("price", Number(cost));
      }

      if (discount !== "") {
        formData.append("discount", Number(discount));
      }

      if (minimumPurchase !== "") {
        formData.append("minimum_purchase", Number(minimumPurchase));
      }

      if (instagram) {
        formData.append("instagram_link", instagram);
      }

      if (selectedSubcategory) {
        formData.append("subcategory", selectedSubcategory.id);
      }

      youtube.forEach((video) => {
        formData.append("youtube_links", video.link);
      });

      finalImages.forEach((id) => {
        formData.append("images", id);
      });

      const createRes = await createPost(formData);

      if (!createRes || !createRes.success || !createRes.data?.id) {
        this.setState({ loadingSavePost: false });
        setSubmitting(false);
        Notify.error({
          text: translate(
            "Не удалось создать пост",
            "notify.createPostFailure",
          ),
        });
        return null;
      }

      const createdPostId = createRes.data.id;

      if (videos?.length) {
        await Promise.all(
          videos.map((video) => {
            const videoUrl = video.video_url || video.video || video.file || "";

            if (!videoUrl) return Promise.resolve();

            return axios.post(
              `/organizations/${this.orgID}/shop/items/${createdPostId}/videos/upload/`,
              {
                video_url: videoUrl,
              },
            );
          }),
        );
      }

      this.props.refreshPosts(this.orgID);

      this.setState({ loadingSavePost: false });
      setSubmitting(false);

      Notify.success({
        text: translate("Пост успешно создан", "notify.createPostSuccess"),
      });

      return createRes;
    } catch (error) {
      console.error(error);
      this.setState({ loadingSavePost: false });
      setSubmitting(false);

      Notify.error({
        text: translate("Не удалось создать пост", "notify.createPostFailure"),
      });

      return null;
    }
  };

  render() {
    const { orgDetail, loadingSavePost } = this.state;

    if (!orgDetail) return <Preloader />;

    return (
      <div className="product-create-page">
        <PostCreateForm
          orgID={this.orgID}
          currency={orgDetail.currency}
          history={this.props.history}
          onSubmit={this.onSubmit}
          isWholesale={orgDetail.is_wholesale}
          loadingSavePost={loadingSavePost}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  orgDetail: state.organizationStore.orgDetail,
});

const mapDispatchToProps = (dispatch) => ({
  getOrganizationDetail: (id) => dispatch(getOrganizationDetail(id)),
  refreshPosts: (orgId) =>
    dispatch(getOrganizationPosts({ orgID: orgId, page: 1, limit: 16 })),
});

export default connect(mapStateToProps, mapDispatchToProps)(PostCreatePage);
