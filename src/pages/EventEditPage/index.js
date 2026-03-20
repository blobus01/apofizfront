import React, {useEffect, useState} from 'react';
import EventEditForm from "../../components/Forms/Event/EventEditForm";
import {canGoBack, notifyQueryResult} from "../../common/helpers";
import {getPostDetail, updatePost} from "../../store/services/postServices";
import Preloader from "../../components/Preloader";
import {uploadImageFromURL, uploadVideoFromUrl, uploadWatermarkedImage} from "../../store/services/commonServices";
import {translate} from "../../locales/locales";

const EventEditPage = ({history, match}) => {
  const {id, orgID} = match.params

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  const goBack = () => canGoBack(history) ? history.goBack() : history.push(`/organizations/${orgID}`)

  useEffect(() => {
    notifyQueryResult(getPostDetail(id).then(res => {
      if (res.success) {
        setLoading(false)
        setEvent(res.data)
      }
    }))
  }, [id]);

  const handleSubmit = async (values) => {
    const {id: orgID} = event.organization
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
      images: [...event.instagram_data.images],
      videos: [...event.instagram_data.videos]
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

    return notifyQueryResult(updatePost(event.id, payload), {
      successMsg: translate('Мероприятие успешно обновлено', 'events.updateEventSuccess'),
      errorMsg: translate('Что-то пошло не так', 'app.fail'),
      onSuccess() {
        history.push(`/organizations/${orgID}`)
      },
    });
  }

  if (loading || !event) return <Preloader/>

  return (
    <EventEditForm
      event={event}
      onSubmit={handleSubmit}
      onBack={goBack}
    />
  );
};

export default EventEditPage;