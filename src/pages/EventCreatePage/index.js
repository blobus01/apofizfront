import React, {useEffect} from 'react';
import EventCreateForm from "../../components/Forms/Event/EventCreateForm";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import {getOrganizationDetail} from "../../store/actions/organizationActions";
import Notify from "../../components/Notification";
import Preloader from "../../components/Preloader";
import {uploadWatermarkedImage} from "../../store/services/commonServices";
import {notifyQueryResult} from "../../common/helpers";
import {translate} from "../../locales/locales";
import {createEvent} from "../../store/services/eventServices";

const EventCreatePage = ({history}) => {
  const {loading, data: orgDetail} = useSelector(state => state.organizationStore.orgDetail)
  const {id: orgID} = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getOrganizationDetail(orgID)).then(res => {
      if ('error' in res) {
        Notify.error({text: res.error})
        history.push(`/organizations/${orgID}`)
      }
    })
  }, [dispatch, orgID, history]);

  const handleSubmit = async (values, {setSubmitting}) => {
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
      selectedSubcategory,
      address,
      location={},
    } = values;
    let mainImageID = preview && preview.id;

    const payload = {
      article,
      name: title,
      description,
      organization: orgDetail.id,
      youtube_links: youtube.map((video) => video.link),
      address,
      ...location,
    };

    if (cost !== "") {
      payload.price = Number(cost);
    }

    if (discount !== "") {
      payload.discount = Number(discount);
    }

    if (instagram) {
      payload.instagram_link = instagram;
    }

    if (selectedSubcategory) {
      payload.subcategory = selectedSubcategory;
    }

    const result = [];
    const uploads = await Promise.all(
      images.map((item) => uploadWatermarkedImage(item.original, item.id))
    );
    uploads.forEach((res) => {
      if (res && res.success) {
        if (res.data.tempID === mainImageID) {
          mainImageID = res.data.id;
        }
        result.push(res.data.id);
      }
    });

    payload.images = [
      mainImageID,
      ...result.filter((id) => id && id !== mainImageID),
    ];
    if (!payload.images.length) {
      return null;
    }
    return notifyQueryResult(createEvent(payload), {
      onSuccess(res) {
        history.replace(`/organizations/${orgID}/events/${res.data.id}/settings?after_creation=1`)
      },
      onFailure() {
        setSubmitting(false);
      },
      successMsg: translate('Аренда успешно создан', 'notify.createRentSuccess'),
      errorMsg: translate('Не удалось создать аренду', 'notify.createRentFailure')
    })

  }

  if (loading || !orgDetail) return <Preloader/>

  return (
    <EventCreateForm
      orgID={orgDetail.id}
      currency={orgDetail.currency}
      onSubmit={handleSubmit}
    />
  );
};

export default EventCreatePage;