import React, {useEffect, useState} from "react";
import DescriptionForm, {FIELDS} from "../../components/DescriptionForm";
import {notifyQueryResult} from "../../../../common/helpers";
import {getDetailResumeInfo, updateDetailResumeInfo} from "../../../../store/services/resumeServices";
import Preloader from "../../../../components/Preloader";

const DetailInfo = ({id, onBack, canEdit = false}) => {
  const [loading, setLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)

  const handleSubmit = async values => {
    const res = await notifyQueryResult(updateDetailResumeInfo({
      item: id,
      text: values[FIELDS.description]
    }), {
      notifySuccessRes: true
    })

    if (res?.success) {
      onBack()
    }
  }

  useEffect(() => {
    notifyQueryResult(getDetailResumeInfo(id))
      .then(res => {
        if (res && res.success) {
          setInitialValues(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [id]);

  if (loading) return <Preloader className="resume-detail-info__preloader"/>

  return (
    <div className="resume-detail-info__detail-info-view resume-detail-info__scrollable-view">
      <DescriptionForm
        initialValues={initialValues ? {
          [FIELDS.description]: initialValues.text
        } : undefined}
        onBack={onBack}
        onSubmit={handleSubmit}
        disabled={!canEdit}
      />
    </div>
  );
};

export default DetailInfo;