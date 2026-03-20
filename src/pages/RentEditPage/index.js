import React, {useEffect, useState} from 'react';
import Preloader from "../../components/Preloader";
import {useHistory, useParams} from "react-router-dom";
import RentEditForm from "../../components/Forms/Rent/RentEditForm";
import {uploadImageFromURL, uploadVideoFromUrl, uploadWatermarkedImage} from "../../store/services/commonServices";
import {notifyQueryResult} from "../../common/helpers";
import {translate} from "../../locales/locales";
import {deletePost, getPostDetail, updatePost} from "../../store/services/postServices";
import useDialog from "../../components/UI/Dialog/useDialog";

const RentEditPage = () => {
  const {rentID} = useParams()
  const history = useHistory()

  const [loading, setLoading] = useState(true);
  const [rentDetail, setRentDetail] = useState(null);

  const {confirm} = useDialog()

  useEffect(() => {
    getPostDetail(rentID).then(res => {
      if (res.success) {
        setLoading(false)
        setRentDetail(res.data)
      }
    })
  }, [rentID]);

  const handleSubmit = async (values, {setSubmitting}) => {
    setSubmitting(true)
    const {id: orgID} = rentDetail.organization
    const {title, description, cost, article, discount, instagram, preview, images, videos, youtube, selectedSubcategory, location, address} = values;
    let mainImageID = preview && preview.id;

    const payload = {
      article,
      name: title,
      description,
      organization: orgID,
      youtube_links: youtube.map(video => video.link),
      images: [],
      latitude: location ? location.latitude : undefined,
      longitude: location ? location.longitude : undefined,
      address
    }

    payload.instagram_data = {
      images: [...rentDetail.instagram_data.images],
      videos: [...rentDetail.instagram_data.videos]
    }

    if (cost === '' || isNaN(cost)) {
      payload.price = null;
    } else {
      payload.price = Number(cost)
    }

    if (discount && !isNaN(Number(discount))) {
      payload.discount = Number(discount);
    }

    if (instagram) {
      payload.instagram_link = instagram;
    }

    if (!!selectedSubcategory) {
      payload.subcategory = selectedSubcategory.id;
    }


    const imageList = images.reduce((acc, img) => {
      if (typeof img.id === "number") {
        acc.old.push(img);
      }
      if (typeof img.id === "string") {
        acc.new.push({...img, id: img.id.replace('video', 'image')});
      }
      return acc;
    }, {new: [], old: []});

    const imageCollection = [...imageList.old.map(item => item.id)];
    if (!!imageList.new.length) {
      const result = await Promise.all(imageList.new.map(item =>
        item.id.includes('image')
          ? uploadImageFromURL(item.file, true, item.id)
          : uploadWatermarkedImage(item.original, item.id))
      );

      result && result.forEach(res => {
        if (res && res.success) {
          if (res.data.tempID === mainImageID) {
            mainImageID = res.data.id;
          }
        }
        imageCollection.push(res.data.id);
      });
    }

    if (typeof mainImageID === 'number') {
      payload.images = [mainImageID, ...imageCollection.filter(id => id !== mainImageID)];
    } else {
      payload.images = imageCollection;
    }

    const videoIdList = [];

    if (videos.length > 0) {
      const results = await Promise.all(videos.map(item => {
        return uploadVideoFromUrl({thumbnail_url: item.thumbnail, video_url: item.video_url || item.video});
      }));

      results && results.forEach(res => {
        if (res && res.success) {
          videoIdList.push(res.data.id);
        }
      });

      payload.videos = videoIdList;
    }

    return notifyQueryResult(updatePost(rentDetail.id, payload), {
      successMsg: translate('Аренда успешно обновлена', 'notify.updateRentSuccess'),
      errorMsg: translate('Что-то пошло не так', 'app.fail'),
      onSuccess() {
        history.push(`/organizations/${orgID}`)
      },
      onFailure() {
        setSubmitting(false)
      }
    });
  }

  const handleRemove = async () => {
    try {
      await confirm({
        title: translate('Удаление', 'app.deletion'),
        description: translate('Вы уверены, что хотите удалить аренду?', 'dialog.deleteRent'),
        confirmTitle: <span style={{color: '#D72C20'}}>{translate('Удалить', 'app.delete')}</span>,
        cancelTitle: <span style={{color: '#4285F4'}}>{translate('Отмена', 'app.cancellation')}</span>
      })
      rentDetail && await notifyQueryResult(deletePost(rentDetail.id), {
        errorMsg: translate('Что-то пошло не так', 'app.fail'),
        onSuccess: () => history.push(`/organizations/${rentDetail.organization.id}`),
        successMsg: translate('Аренда успешно удалена', 'notify.deleteRentSuccess')
      })
    } catch (e) {}
  }

  return (
    <div>
      {loading || !rentDetail ? <Preloader /> : (
        <RentEditForm
          rent={rentDetail}
          onSubmit={handleSubmit}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};

export default RentEditPage;