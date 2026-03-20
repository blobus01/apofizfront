import React, {useEffect, useState} from 'react';
import {getPostImage, notifyQueryResult} from "../../common/helpers";
import {getPostDetail} from "../../store/services/postServices";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import Preloader from "../../components/Preloader";
import MobileTopHeader from "../../components/MobileTopHeader";
import PageHelmet from "../../components/PageHelmet";
import "./index.scss"

const ResumeDetailPage = ({match, location, history}) => {
  const {id} = match.params
  const [data, setData] = useState(null);

  useEffect(() => {
    notifyQueryResult(getPostDetail(id))
      .then(res => {
          if (res && res.success) {
            setData(res.data)
          } else {
            setTimeout(() => {
              history.goBack()
            }, 2000)
          }
        }
      )
  }, [history, id]);


  return (
    <div className="resume-detail-page">
      {data && (
        <PageHelmet
          title={data.name}
          description={data.description}
          image={getPostImage(data, 'medium')}
          url={location.pathname}
        />
      )}

      <MobileTopHeader
        onBack={() => history.goBack()}
        title={data?.name}
      />
      <div className="resume-detail-page__container">
        {data ? (
          <PostFeedCard
            post={data}
            organization={data.organization}
            permissions={data.organization.permissions}
            showResumeDetail
          />
        ) : (
          <Preloader/>
        )}
      </div>
    </div>
  );
};

export default ResumeDetailPage;