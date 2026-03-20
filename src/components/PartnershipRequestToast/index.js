import React, {Component} from 'react';
import NotificationCard from '../Cards/NotificationCard';
import {acceptPartnership, rejectPartnership} from '../../store/actions/partnerActions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {NOTIFICATION_TYPES} from '../Cards/NotificationCard/types';
import './index.scss';

class PartnershipRequestToast extends Component {
  render() {
    const { data } = this.props.data;
    const extraData = JSON.parse(data.extra_data);
    const organization = JSON.parse(data.organization);

    const card = {
      created_at: new Date().toISOString(),
      sender: null,
      extra_data: { partnership_id: extraData.partnership_id },
      title: data.title,
      description: '',
      organization: {
        id: organization.id,
        title: organization.title,
        image: {
          medium: data.image,
        },
        address: data.body
      },
      type: NOTIFICATION_TYPES.requested_partnership_recipient
    };

    const {acceptPartnership, rejectPartnership, history} = this.props;

    return (
      <NotificationCard
        card={card}
        onAcceptPartnership={((id, redirectURL) => acceptPartnership(id).then(res => res && res.success && history.push(redirectURL)))}
        onRejectPartnership={(id) => rejectPartnership(id)}
        className="partnership-req-toast"
      />
    );
  }
}

const mapDispatchToProps = dispatch => ({
  rejectPartnership: id => dispatch(rejectPartnership(id)),
  acceptPartnership: id => dispatch(acceptPartnership(id)),
})

export default connect(null, mapDispatchToProps)(withRouter(PartnershipRequestToast));