import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import MobileTopHeader from '../../components/MobileTopHeader';
import {ArrowRight, CollectionIcon, PhoneCallIcon, WebIcon} from '../../components/UI/Icons';
import {HOTLINK_TYPES} from '../../common/constants';
import {translate} from '../../locales/locales';
import './index.scss';

class OrgHotlinkTypeSelectPage extends Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.orgID;
  }

  componentDidMount() {
    const {orgDetail, history} = this.props;
    if (!orgDetail || (orgDetail && orgDetail.id !== Number(this.orgID))) {
      history.replace(`/organizations/${this.orgID}`);
    }
  }

  render() {
    const {history} = this.props;
    return (
      <div className="org-hotlink-type-select-page">
        <MobileTopHeader
          title={translate("Выбор типа ссылки", "hotlink.typeSelect")}
          onBack={() => history.push(`/organizations/${this.orgID}`)}
        />
        <div className="org-hotlink-type-select-page__content">
          <div className="container">
            <div className="org-hotlink-type-select-page__list">
              <Link to={`/organizations/${this.orgID}/hotlinks/create/${HOTLINK_TYPES.link}`} className="org-hotlink-type-select-page__link row">
                <div>
                  <WebIcon />
                  <span className="f-16 f-400">{translate("Добавить ссылку", "hotlink.addLink")}</span>
                </div>
                <ArrowRight />
              </Link>

              <Link to={`/organizations/${this.orgID}/hotlinks/create/${HOTLINK_TYPES.contact}`} className="org-hotlink-type-select-page__link row">
                <div>
                  <PhoneCallIcon />
                  <span className="f-16 f-400">{translate("Добавить контакт или почту", "hotlink.addContactOrEmail")}</span>
                </div>
                <ArrowRight />
              </Link>

              <Link to={`/organizations/${this.orgID}/hotlinks/create/${HOTLINK_TYPES.collection}`} className="org-hotlink-type-select-page__link row">
                <div>
                  <CollectionIcon />
                  <span className="f-16 f-400">{translate("Добавить подборку товаров", "hotlink.addCollection")}</span>
                </div>
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgDetail: state.organizationStore.orgDetail.data,
});

export default connect(mapStateToProps)(OrgHotlinkTypeSelectPage);