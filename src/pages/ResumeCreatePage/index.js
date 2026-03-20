import React from 'react';
import {useHistory} from "react-router-dom";
import ResumeCreateForm from "../../components/Forms/Resume/ResumeCreateForm";
import {uploadWatermarkedImage} from "../../store/services/commonServices";
import {notifyQueryResult} from "../../common/helpers";
import {translate} from "../../locales/locales";
import {createResume} from "../../store/services/resumeServices";
import useSearchParams from "../../hooks/useSearchParams";
import {useSelector} from "react-redux";

const ResumeCreatePage = () => {
  const [searchParams] = useSearchParams()
  const {org} = searchParams

  const history = useHistory()

  const user = useSelector(state => state.userStore.user);

  const handleSubmit = async values => {
    const {
      title,
      description,
      nationalities,
      resumeRegions,
      instagram,
      youtube,
      preview,
      images,
      salaryFrom,
      salaryTo,
      educations,
      currency,
      selectedSubcategory,
      addresses,
    } = values;
    let mainImageID = preview && preview.id

    const payload = {
      name: title,
      description,
      user: user && !org ? user.id : undefined,
      organization: org,
      currency,
      salary_to: Number(salaryTo),
      salary_from: Number(salaryFrom),
      citizenship: nationalities.map(nationality => nationality.code),
      current_locations: addresses.map(address => address.id),
      preferred_locations: resumeRegions.map(region => region.id),
      education: educations.map(edu => edu.id),
      instagram_link: instagram,
      youtube_links: youtube.map((video) => video.link),
      subcategory: selectedSubcategory,
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
    return notifyQueryResult(createResume(payload), {
      onSuccess(res) {
        history.replace(`/resumes/${res.data.id}/detail-info/edit?view=intro`)
      },
      successMsg: translate('Резюме успешно создано', 'notify.createResumeSuccess'),
      errorMsg: translate('Не удалось создать резюме', 'notify.createResumeFailure')
    })
  }

  return (
    <ResumeCreateForm
      orgID={org}
      onSubmit={handleSubmit}
      onBack={() => history.goBack()}
    />
  );
};

export default ResumeCreatePage;