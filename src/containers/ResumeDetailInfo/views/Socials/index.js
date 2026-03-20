import React, {useEffect, useState} from 'react';
import {getUUID} from "../../../../common/utils";
import {notifyQueryResult} from "../../../../common/helpers";
import {getResumeSocials, updateResumeSocials} from "../../../../store/services/resumeServices";
import Preloader from "../../../../components/Preloader";
import SocialsForm from "../../../../components/Forms/SocialsForm";

const Socials = ({id, onBack, canEdit = false}) => {
  const [socials, setSocials] = useState([{
    id: getUUID(),
    url: '',
  }]);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async ({socials}) => {
    const res = await notifyQueryResult(updateResumeSocials({
      item: id,
      urls: socials.map(number => number.url)
    }))

    if (res && res.success) {
      onBack()
    }
  }

  useEffect(() => {
    notifyQueryResult(getResumeSocials(id))
      .then(res => {
        if (res && res.success && res.data.length) {
          setSocials(res.data)
        }
        setLoading(false)
      })
  }, [id]);

  if (loading) return <Preloader className="resume-detail-info__preloader"/>

  return (
    <SocialsForm
      socials={socials}
      onSubmit={handleSubmit}
      onBack={onBack}
      disabled={!canEdit}
    />
  );
};

export default Socials;