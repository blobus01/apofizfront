import React, {Component} from 'react';
import MessageForm from '../../components/Forms/MessageForm';
import {connect} from 'react-redux';
import Preloader from '../../components/Preloader';
import RecipientsCount from '../../components/RecipientsCount';
import PartnersCount from '../../components/PartnersCount';
import qs from 'qs';
import {canGoBack} from '../../common/helpers';
import {getOrganizationDetail} from '../../store/actions/organizationActions';
import {
  createOrgMessage,
  getOrgFollowersCount,
  getOrgPartnerFollowersCount, getOrgPartnerMembersCount
} from '../../store/actions/messageActions';
import {injectIntl} from 'react-intl';
import './index.scss';

export const MESSAGE_TYPES = {
  organization_followers: 'organization_followers',
  partners_members: 'partners_members',
  partners_followers: 'partners_followers',
}

class MessageCreatePage extends Component {
  constructor(props) {
    super(props);
    this.organization = props.match.params.id;
    const query = qs.parse(props.location.search.replace('?', ''));
    const externalMessageType = query && query.t && Object.keys(MESSAGE_TYPES).includes(query.t) && query.t;

    this.state = {
      loading: true,
      messageType: externalMessageType || MESSAGE_TYPES.organization_followers,
      partners: null,
      followers: null,
    }
  }

  componentDidMount() {
    const { messageType } = this.state;
    this.checkPermission();
    this.getCounters(messageType);
  }

  checkPermission = async () => {
    const res = await this.props.getOrganizationDetail(this.organization);
    if (res && res.success) {
      return res.permissions && !res.permissions.can_send_message && this.props.history.push(`/organizations/${this.organization}/messages`);
    }

    return this.props.history.push(`/organizations/${this.organization}/messages`)
  }

  getCounters = async messageType => {
    this.setState(prevState => ({
      ...prevState,
      messageType,
      loading: true,
      followers: null,
      partners: null
    }));

    if (messageType === MESSAGE_TYPES.organization_followers) {
      const res = await this.props.getOrgFollowersCount(this.organization);
      return res && res.success && this.setState(prevState => ({
        ...prevState,
        loading: false,
        messageType: MESSAGE_TYPES.organization_followers,
        partners: null,
        followers: res.data,
      }))
    }

    if (messageType === MESSAGE_TYPES.partners_members) {
      const res = await this.props.getOrgPartnerMembersCount(this.organization);
      return res && res.success && this.setState(prevState => ({
        ...prevState,
        loading: false,
        messageType: MESSAGE_TYPES.partners_members,
        followers: null,
        partners: res.data
      }))
    }

    if (messageType === MESSAGE_TYPES.partners_followers) {
      const followersRes = await this.props.getOrgPartnerFollowersCount(this.organization);
      const partnersRes = await this.props.getOrgPartnerMembersCount(this.organization);
      return this.setState(prevState => ({
        ...prevState,
        loading: false,
        messageType: MESSAGE_TYPES.partners_followers,
        followers: followersRes && followersRes.success && followersRes.data,
        partners: partnersRes && partnersRes.success && partnersRes.data
      }))
    }

    return this.setState(prevState => ({
      ...prevState,
      loading: false,
      messageType: MESSAGE_TYPES.organization_followers,
      followers: null,
      partners: null
    }))
  }

  onMessageTypeChange = e => {
    const messageType = e.target.value;
    this.getCounters(messageType);
  }

  getReceiversContent = () => {
    const { partners, followers, messageType, loading } = this.state;

    if (loading) {
      return <Preloader />
    }

    if (messageType === MESSAGE_TYPES.organization_followers) {
      return (
        <RecipientsCount
          followers={followers.followers}
          count={followers.count}
          organizationID={this.organization}
          className="message-create-page__recipients"
        />
      )
    }

    if (messageType === MESSAGE_TYPES.partners_members) {
      return (
        <PartnersCount
          partners={partners.partners}
          count={partners.count}
          organizationID={this.organization}
          className="message-create-page__partners"
        />
      )
    }

    if (messageType === MESSAGE_TYPES.partners_followers) {
      return (
        <div className="message-create-page__info">
          {partners && partners.partners && (
            <PartnersCount
              partners={partners.partners}
              count={partners.count}
              organizationID={this.organization}
              className="message-create-page__partners"
            />
          )}

          {followers && followers.followers && (
            <RecipientsCount
              followers={followers.followers}
              count={followers.count}
              organizationID={this.organization}
              className="message-create-page__recipients"
            />
          )}
        </div>
      )
    }

    return null;
  }

  onSubmit = async values => {
    try {
      const payload = {
        content: values.text,
        message_to: this.state.messageType
      }

      const res = await this.props.createOrgMessage(this.organization, payload)

      if (res && res.success) {
        this.props.history.push(`/organizations/${this.organization}/messages`)
      } else {
        console.error('Couldn\'t send message. Details:', res)
      }
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { messageType } = this.state;
    const { orgDetail, intl, history } = this.props;

    return (
      <div className="message-create-page">
        {orgDetail.loading ? <Preloader className="message-create-page__preloader" /> : (
          <MessageForm
            onSubmit={this.onSubmit}
            onBack={() => canGoBack(history) ? history.goBack() : history.push(`/organizations/${this.organization}/messages`)}
          >
            <React.Fragment>
              <div className="message-form__select-wrap">
                <select
                  name="type"
                  value={messageType}
                  onChange={this.onMessageTypeChange}
                  className="message-form__select"
                >
                  <option
                    value={MESSAGE_TYPES.organization_followers}
                    className="message-form__select-option"
                  >
                    {intl.formatMessage({ id: "messages.toFollowers", defaultMessage: "Сообщение подписчикам"})}
                  </option>
                  <option
                    value={MESSAGE_TYPES.partners_members}
                    className="message-form__select-option"
                  >
                    {intl.formatMessage({ id: "messages.toPartners", defaultMessage: "Сообщение партнерам"})}
                  </option>
                  <option
                    value={MESSAGE_TYPES.partners_followers}
                    className="message-form__select-option"
                  >
                    {intl.formatMessage({ id: "messages.toPartnersFollowers", defaultMessage: "Сообщение подписчикам партнеров"})}
                  </option>
                </select>

                <svg className="message-form__select-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.8799 8.70557C16.2697 8.31578 16.9038 8.31791 17.2918 8.70587L17.3796 8.79372C17.7696 9.18367 17.7722 9.8133 17.3777 10.2078L12.2937 15.2918C11.9027 15.6828 11.2722 15.6863 10.8777 15.2918L5.79371 10.2078C5.4027 9.81677 5.40383 9.18168 5.7918 8.79372L5.87964 8.70587C6.2696 8.31592 6.89849 8.31257 7.29149 8.70557L11.5857 12.9998L15.8799 8.70557Z" fill="#4285F4"/>
                </svg>
              </div>
              {this.getReceiversContent()}
            </React.Fragment>
          </MessageForm>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgRecipientsCount: state.messageStore.orgRecipientsCount,
  orgDetail: state.organizationStore.orgDetail,
})

const mapDispatchToProps = dispatch => ({
  createOrgMessage: (orgID, payload) => dispatch(createOrgMessage(orgID, payload)),
  getOrgFollowersCount: (orgID) => dispatch(getOrgFollowersCount(orgID)),
  getOrgPartnerFollowersCount: (orgID) => dispatch(getOrgPartnerFollowersCount(orgID)),
  getOrgPartnerMembersCount: (orgID) => dispatch(getOrgPartnerMembersCount(orgID)),
  getOrganizationDetail: id => dispatch(getOrganizationDetail(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(MessageCreatePage));