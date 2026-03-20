import React, {useEffect, useState} from 'react';
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {translate} from "../../../../locales/locales";
import FileUploader from "../../../../components/FileUploader";
import {notifyQueryResult} from "../../../../common/helpers";
import {getResumeInfo} from "../../../../store/services/resumeServices";
import {useHistory} from "react-router-dom";
import Preloader from "../../../../components/Preloader";

const Files = ({id, onBack}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true);
  const history = useHistory()

  useEffect(() => {
    notifyQueryResult(getResumeInfo(id))
      .then(res => {
        if (res && res.success) {
          setData(res.data)
          setLoading(false)
        } else {
          setTimeout(() => history.goBack(), 2000)
        }
      })
  }, [history, id]);

  if (loading) return <Preloader className="resume-detail-info__preloader"/>

  return (
    <div>
      <MobileTopHeader
        onBack={onBack}
        title={translate('Загруженные данные', 'resumes.detailInfo.loadedData')}
        className="resume-detail-info__header"
      />
      <div className="container">
        <FileUploader
          value={data?.files}
          disabled
        />
      </div>
    </div>
  );
};

export default Files;