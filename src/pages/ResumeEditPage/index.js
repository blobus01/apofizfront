import React, {useEffect, useState} from 'react';
import ResumeEditForm from "../../components/Forms/Resume/ResumeEditForm";
import {notifyQueryResult} from "../../common/helpers";
import {deletePost, getPostDetail, updatePost} from "../../store/services/postServices";
import Preloader from "../../components/Preloader";
import {translate} from "../../locales/locales";
import {uploadImageFromURL, uploadVideoFromUrl, uploadWatermarkedImage} from "../../store/services/commonServices";
import useDialog from "../../components/UI/Dialog/useDialog";

const ResumeEditPage = ({history, match}) => {
  const {id} = match.params

  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);

  const {confirm} = useDialog()

  const handleSubmit = async values => {
    const {id: orgID} = resume.organization
    const {
      title,
      description,
      nationalities,
      resumeRegions,
      instagram,
      preview,
      images,
      videos,
      salaryFrom,
      salaryTo,
      educations,
      currency,
      youtube,
      selectedSubcategory,
      addresses,
    } = values;
    let mainImageID = preview && preview.id;

    const payload = {
      name: title,
      description,
      organization: orgID,
      currency,
      salary_to: Number(salaryTo),
      salary_from: Number(salaryFrom),
      citizenship: nationalities.map(nationality => nationality.code),
      current_locations: addresses.map(address => address.id),
      preferred_locations: resumeRegions.map(region => region.id),
      education: educations.map(edu => edu.id),
      youtube_links: youtube.map(video => video.link),
      images: [],
    }

    payload.instagram_data = {
      images: [...resume.instagram_data.images],
      videos: [...resume.instagram_data.videos]
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

    return notifyQueryResult(updatePost(resume.id, payload), {
      successMsg: translate('Мероприятие успешно обновлено', 'resumes.updateResumeSuccess'),
      errorMsg: translate('Что-то пошло не так', 'app.fail'),
      onSuccess() {
        history.goBack()
      },
    });
  }

  const handleRemove = async () => {
    try {
      await confirm({
        title: translate('Удаление', 'app.deletion'),
        description: translate('Вы уверены, что хотите удалить вакансию?', 'dialog.deleteResume'),
        confirmTitle: <span style={{color: '#D72C20'}}>{translate('Удалить', 'app.delete')}</span>,
        cancelTitle: <span style={{color: '#4285F4'}}>{translate('Отмена', 'app.cancellation')}</span>
      })
      resume && await notifyQueryResult(deletePost(resume.id), {
        errorMsg: translate('Что-то пошло не так', 'app.fail'),
        onSuccess: () => history.push(`/organizations/${resume.organization.id}`),
        successMsg: translate('Вакансия успешно удалена', 'notify.deleteResumeSuccess')
      })
    } catch (e) {
    }
  }

  useEffect(() => {
    notifyQueryResult(getPostDetail(id).then(res => {
      if (res.success) {
        setLoading(false)
        setResume(res.data)
      } else {
        history.goBack()
      }
    }))
  }, [id, history]);

  if (loading || !resume) return <Preloader/>

  return (
    <ResumeEditForm
      resume={resume}
      onSubmit={handleSubmit}
      onBack={() => history.goBack()}
      onRemove={handleRemove}
      className="resume-edit-page__form"
    />
  );
};

export default ResumeEditPage;