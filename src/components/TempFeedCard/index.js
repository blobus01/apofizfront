import React from 'react';
import moment from 'moment';
import {DATE_FORMAT_DD_MM_YYYY_HH_MM} from '../../common/constants';

const TempFeedCard = ({data}) => {
  return (
    <div style={{border: '1px solid', minHeight: '100px', marginBottom: '20px'}}>
      <b>{data.subcategory && data.subcategory.name}</b>
      <p>{data.name}</p>
      <p style={{color: 'green', margin: '15px 0'}}>{data.description}</p>
      <p style={{color: 'red', margin: '15px 0'}}>
        {moment(data.updated_at).format(DATE_FORMAT_DD_MM_YYYY_HH_MM)}
      </p>
      {data.instagram_data && data.instagram_data.images[0] && (
        <img src={data.instagram_data.images[0].file} alt={data.name}  style={{maxWidth: '100%'}}/>
      )}
      {data.images[0] && (
        <img src={data.images[0].file} alt={data.name}  style={{maxWidth: '100%'}}/>
      )}
    </div>
  );
};

export default TempFeedCard;