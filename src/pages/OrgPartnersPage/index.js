import React from 'react';
import MobileSearchHeader from '../../components/MobileSearchHeader';
import {connect} from 'react-redux';
import {
  acceptPartnership,
  createPartnership,
  getOrgPartnerships,
  rejectPartnership,
} from '../../store/actions/partnerActions';
import Preloader from '../../components/Preloader';
import InfiniteScroll from 'react-infinite-scroll-component';
import {BannerIcon, CloseIcon, MessageIcon, QuestionIcon, ShareIcon} from '../../components/UI/Icons';
import OrgAvatar from '../../components/UI/OrgAvatar';
import {QRCode} from 'react-qr-svg';
import {DEFAULT_LIMIT, QR_ORG_PREFIX} from '../../common/constants';
import {getOrganizationDetail} from '../../store/actions/organizationActions';
import ScanView from '../../containers/ScanView';
import Button from '../../components/UI/Button';
import PartnershipCard from '../../components/Cards/PartnershipCard';
import MobileMenu from '../../components/MobileMenu';
import RowButton, {ROW_BUTTON_TYPES} from '../../components/UI/RowButton';
import OrgPartnersEmpty from './empty';
import {MESSAGE_TYPES} from '../MessageCreatePage';
import {Link} from 'react-router-dom';
import {translate} from '../../locales/locales';
import config from '../../config';
import {copyTextToClipboard} from '../../common/utils';
import Notify from '../../components/Notification';
import {OID_REGEX} from '../../common/helpers';
import './index.scss';

class OrgPartnersPage extends React.Component {
  constructor(props) {
    super(props);
    this.organization = props.match.params.id;
    this.state = {
      step: 0,
      page: 1,
      limit: DEFAULT_LIMIT,
      search: '',
      hasMore: true,
      showMenu: false,
    }
  }

  componentDidMount() {
    this.props.getOrganizationDetail(this.organization);
    this.props.getOrgPartnerships(this.organization, this.state);
  }

  onScan = async orgID => {
    const {orgDetail, createPartnership, getOrgPartnerships} = this.props;
    if (orgDetail.data && orgID && OID_REGEX.test(orgID)) {
      const newOrgId = orgID.replace(QR_ORG_PREFIX, '');

      if (parseInt(newOrgId) === orgDetail.data.id) {
        return Notify.error({ text: translate("Вы не можете добавить свою организацию как партнера", "notify.partnershipAddSelf")});
      }

      const res = await createPartnership({
        requested_by: orgDetail.data.id,
        accepted_by: orgID.replace(QR_ORG_PREFIX, '')
      });
      if (res && res.success) {
        const newState = { ...this.state, page: 1, hasMore: true, step: 0 };
        getOrgPartnerships(this.organization, newState);
        this.setState(newState)
      }
    }
  }

  onSearchChange = e => {
    const { value } = e.target;
    if (value !== this.state.search) {
      this.setState({ ...this.state, search: value, page: 1, hasMore: true });
      this.props.getOrgPartnerships(this.organization, { ...this.state, search: value, page: 1 });
    }
  };

  onSearchCancel = () => {
    if (this.state.search !== '') {
      this.setState({ ...this.state, search: '', hasMore: true });
      this.props.getOrgPartnerships(this.organization, { ...this.state, search: '', page: 1 });
    }
  };

  getNext = totalPages => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1
      this.props.getOrgPartnerships(this.organization, {
        ...this.state,
        page: nextPage,
      }, true);

      return this.setState({ ...this.state, hasMore: true, page: nextPage });
    }
    this.setState({ ...this.state, hasMore: false });
  }

  render() {
    const { orgPartnerships, orgDetail, acceptPartnership, rejectPartnership, history } = this.props;
    const { data, loading } = orgPartnerships;
    const { page, showMenu, search, step } = this.state;

    return (
      <div className="org-partners-page">
        {step === 0 && (
          <React.Fragment>
            <MobileSearchHeader
              title={translate("Партнеры", "app.partners")}
              onBack={() => history.push(`/organizations/${this.organization}`)}
              searchValue={search}
              onSearchChange={this.onSearchChange}
              onSearchCancel={this.onSearchCancel}
              onMenu={() => this.setState({ ...this.state, showMenu: true })}
              className="org-partners-page__header"
            />

            <div className="org-partners-page__content">
              <div className="container">
                {data && !!data.total_count && <p className="org-partners-page__count f-20 f-800">
                  {translate("{count} партнера", "partners.count", { count: (data && data.total_count) || 0})} <Link to="/faq/partners"><QuestionIcon /></Link></p>}
                <div className="org-partners-page__list">
                  {(page === 1 && loading)
                    ?  <Preloader />
                    : (!data || (data && !data.total_count))
                      ? <OrgPartnersEmpty searched={!!search} />
                      : (
                        <InfiniteScroll
                          dataLength={Number(data.list.length) || 0}
                          next={() => this.getNext(data.total_pages)}
                          hasMore={this.state.hasMore}
                          loader={null}
                        >
                          {data.list.map(partnership => {
                            return (
                              <PartnershipCard
                                key={partnership.id}
                                partner={partnership.partner}
                                onAcceptPartnership={() => acceptPartnership(partnership.id).then(res => {
                                  res && res.success && history.push(`/organizations/${this.organization}/partners/${partnership.id}`);
                                })}
                                onRejectPartnership={() => rejectPartnership(partnership.id).then(res => {
                                  if (res && res.success) {
                                    const newState = { ...this.state, page: 1, hasMore: true };
                                    this.props.getOrgPartnerships(this.organization, newState);
                                    this.setState(newState)
                                  }
                                })}
                                isAccepted={partnership.is_accepted}
                                isIncoming={partnership.is_incoming}
                                to={`/organizations/${this.organization}/partners/${partnership.id}`}
                                className="org-partners-page__item"
                              />
                             )
                          })}
                        </InfiniteScroll>
                      )}
                </div>
              </div>
              <div className="container">
                <div className="org-partners-page__tools">
                  <Button
                    label={translate("Сканировать QR", "app.scanQR")}
                    type="button"
                    onClick={() => this.setState({ ...this.state, step: 2 })}
                  />

                  <Button
                    label={translate("QR организации", "org.organizationQR")}
                    type="button"
                    onClick={() => this.setState({ ...this.state, step: 1 })}
                  />
                </div>
              </div>
            </div>
          </React.Fragment>
        )}

        {step === 1 && orgDetail.data && (
          <div className="org-partners-page__qr">
            <div className="container">
            <div className="org-partners-page__qr-header row">
              <button
                onClick={() => this.setState({ ...this.state, step: 0 })}
                style={{ height: '24px'}}
              >
                <CloseIcon />
              </button>
              <button onClick={async () => {
                const shareUrl = `${config.baseURL}/organizations/${orgDetail.data.id}`;
                const sharePayload = {
                  title: orgDetail.data.title,
                  text: orgDetail.data.description,
                  url: shareUrl,
                }
                try {
                  copyTextToClipboard(shareUrl, () => Notify.success({ text: translate('Ссылка скопирована', "dialog.linkCopySuccess") }));
                  await navigator.share(sharePayload);
                } catch (e) {}
              }}>
                <ShareIcon />
              </button>
            </div>
              <div className="org-partners-page__qr-organization">
                <OrgAvatar
                  src={orgDetail.data.image && orgDetail.data.image.medium}
                  alt={orgDetail.data.title}
                  size={72}
                  className="org-partners-page__qr-organization-avatar"
                />
                <h1 className="org-partners-page__qr-organization-title f-20 f-800">{orgDetail.data.title}</h1>
              </div>

              <div className="org-partners-page__qr-code">
                <QRCode
                  bgColor="#FFFFFF"
                  fgColor="#4285F4"
                  level="H"
                  style={{ width: 250 }}
                  value={`${QR_ORG_PREFIX}${orgDetail.data.id}`}
                />
              </div>
              {/*<p className="org-partners-page__qr-id f-20 f-600">ID {orgDetail.data.id}</p>*/}
            </div>
          </div>
        )}

        {step === 2 && orgDetail.data && (
          <ScanView
            onError={() => null}
            onScan={this.onScan}
            onInputSubmit={this.onScan}
          >
            <div  className="org-partners-page__scan-header row">
              <button
                type="button"
                onClick={() => this.setState({ ...this.state, step: 0 })}
                className="org-partners-page__scan-back"
              >
                <CloseIcon />
              </button>

              <OrgAvatar
                src={orgDetail.data.image && orgDetail.data.image.medium}
                alt={orgDetail.data.title}
                size={44}
              />
            </div>
          </ScanView>
        )}

        <MobileMenu
          isOpen={showMenu}
          contentLabel={translate("Функции партнеров", "partners.function")}
          onRequestClose={() => this.setState({ ...this.state, showMenu: false })}
        >
          <RowButton
            type={ROW_BUTTON_TYPES.link}
            label={translate("Баннеры", "app.banners")}
            showArrow={false}
            to={`/organizations/${this.organization}/banners`}
          >
            <BannerIcon />
          </RowButton>
          <RowButton
            type={ROW_BUTTON_TYPES.link}
            label={translate("Отправить сообщение", "messages.sendMessage")}
            showArrow={false}
            to={`/organizations/${this.organization}/messages/create?t=${MESSAGE_TYPES.organization_followers}`}
          >
            <MessageIcon />
          </RowButton>
        </MobileMenu>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgDetail: state.organizationStore.orgDetail,
  orgPartnerships: state.partnerStore.orgPartnerships,
})

const mapDispatchToProps = dispatch => ({
  getOrgPartnerships: (orgID, param, isNext) => dispatch(getOrgPartnerships(orgID, param, isNext)),
  getOrganizationDetail: (orgID) => dispatch(getOrganizationDetail(orgID)),
  createPartnership: payload => dispatch(createPartnership(payload)),
  acceptPartnership: id => dispatch(acceptPartnership(id)),
  rejectPartnership: id => dispatch(rejectPartnership(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(OrgPartnersPage);