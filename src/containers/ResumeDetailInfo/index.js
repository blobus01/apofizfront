import React, {useEffect} from 'react';
import useSearchParams from "../../hooks/useSearchParams";
import Intro from "./views/Intro";
import Main from "./views/Main";
import {useHistory} from "react-router-dom";
import {VIEWS} from "./constants";
import DetailInfo from "./views/DetailInfo";
import WorkExperience from "./views/WorkExperience";
import Contacts from "./views/Contacts";
import Socials from "./views/Socials";
import EducationExperience from "./views/EducationExperience";
import Files from "./views/Files";
import {useDispatch} from "react-redux";
import {setResumeDetailInfoCache} from "../../store/actions/postActions";
import "./index.scss"

const ResumeDetailInfo = ({id, canEdit = false}) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [searchParams, setSearchParams] = useSearchParams({
    view: VIEWS.main
  })

  const {view} = searchParams
  const setView = (newView, replace) => {
    setSearchParams({
      view: newView
    }, {replace})
  }

  const goBackInHistory = () => {
    history.goBack()
  }

  const getView = () => {
    switch (view) {
      case VIEWS.intro:
        return <Intro
          onNext={() => setView(VIEWS.main, true)}
        />
      case VIEWS.contacts:
        return <Contacts
          id={id}
          onBack={goBackInHistory}
          canEdit={canEdit}
        />
      case VIEWS.detail_info:
        return <DetailInfo
          id={id}
          onBack={goBackInHistory}
          canEdit={canEdit}
        />
      case VIEWS.work_experience:
        return <WorkExperience
          id={id}
          onBack={goBackInHistory}
          canEdit={canEdit}
        />
      case VIEWS.socials:
        return <Socials
          id={id}
          onBack={goBackInHistory}
          canEdit={canEdit}
        />
      case VIEWS.education_experience:
        return <EducationExperience
          id={id}
          onBack={goBackInHistory}
          canEdit={canEdit}
        />
      case VIEWS.files:
        return <Files
          id={id}
          onBack={goBackInHistory}
        />
      default:
        return <Main
          id={id}
          onBack={goBackInHistory}
          onSubmit={goBackInHistory}
        />
    }
  }

  useEffect(() => {
    return () => {
      dispatch(setResumeDetailInfoCache(null))
    }
  }, [dispatch]);

  return (
    <div>
      {getView()}
    </div>
  );
};

export default ResumeDetailInfo;