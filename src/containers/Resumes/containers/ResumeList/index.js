import React, {memo, useRef} from 'react';
import useResumeParams from "../../hooks/useResumeParams";
import {notifyQueryResult} from "@common/helpers";
import {getResumes} from "@store/services/resumeServices";
import useInfiniteScrollQuery from "@hooks/useInfiniteScrollQuery";
import PostsList from "@components/PostsList";
import EmptyData from "@pages/SubscriptionsPostsPage/empty";
import useSearchParam from "@hooks/useSearchParam";
import {SEARCH_PARAMS} from "../../constants";
import {POSTS_VIEWS} from "@common/constants";
import {useSelector} from "react-redux";
import axios from "axios";

const ResumeList = () => {
  const resumeParams = useResumeParams()
  const user = useSelector(state => state.userStore.user);
  const requestToken = useRef(axios.CancelToken.source());

  const [postsView] = useSearchParam(SEARCH_PARAMS.posts_view, POSTS_VIEWS.FEED)

  const fetchPosts = params => {
    requestToken.current?.cancel()
    requestToken.current = axios.CancelToken.source()
    return notifyQueryResult(
      getResumes(params, {cancelToken: requestToken.current.token}),
      {notifyFailureRes: false}
    )
  }

  const {data: resumes, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchPosts({...params, ...resumeParams}),
    [resumeParams]
  )

  return (
    <PostsList
      hasMore={hasMore}
      posts={resumes}
      view={postsView}
      getNext={next}
      user={user}
      EmptyComponent={() => <EmptyData className="resumes__resumes-list-empty-component"/>}
      className="container resumes__resumes-list"
      style={postsView === POSTS_VIEWS.GRID ? {
        paddingLeft: '1rem',
        paddingRight: '1rem'
      } : undefined}
    />
  );
};

export default memo(ResumeList);