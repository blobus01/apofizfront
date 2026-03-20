import React, {useEffect} from 'react';
import PostDetail from '../../containers/PostDetail';
import {useDispatch} from "react-redux";
import {setViewedPost} from "../../store/actions/postActions";

const PostDetailPage = props => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setViewedPost(props.match.params.id));
  }, [dispatch, props.match.params.id]);

  return <PostDetail {...props} />;
}

export default PostDetailPage;