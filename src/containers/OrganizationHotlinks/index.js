import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import ScrollContainer from "react-indiana-drag-scroll";
import HotlinkCard from "../../components/Cards/HotlinkCard";
import { getOrgHotlinks } from "../../store/actions/organizationActions";
import { ImageAdd } from "../../components/UI/Icons";
import { translate } from "../../locales/locales";
import "./index.scss";

class OrganizationHotlinks extends Component {
  constructor(props) {
    super(props);
    this.orgID = props.orgID;
    this.state = {
      page: 1,
      limit: 100,
    };
    this.scrollContainerRef = props.scrollContainerRef || createRef();
  }

  componentDidMount() {
    this.props.getOrgHotlinks({ organization: this.orgID, ...this.state });
  }

  render() {
    const { canEdit, orgHotlinks } = this.props;
    const { data } = orgHotlinks;

    if (!data) {
      return null;
    }

    return (
      <div className="organization-hotlinks">
        {!!data.total_count ? (
          <ScrollContainer
            className="organization-hotlinks__list-container"
            ref={this.scrollContainerRef}
          >
            <div className="organization-hotlinks__list">
              {/* ✅ КНОПКА ПЕРВАЯ */}
              {canEdit && (
                <Link
                  to={`/organizations/${this.orgID}/hotlinks/create`}
                  className="organization-hotlinks__card-add f-14"
                >
                  <i>
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.33366 9.16667H31.167V22H34.8337V9.16667C34.8337 7.1445 33.1892 5.5 31.167 5.5H7.33366C5.31149 5.5 3.66699 7.1445 3.66699 9.16667V31.1667C3.66699 33.1888 5.31149 34.8333 7.33366 34.8333H22.0003V31.1667H7.33366V9.16667Z"
                        fill="#818C99"
                      />
                      <path
                        d="M14.667 20.1667L9.16699 27.5H29.3337L22.0003 16.5L16.5003 23.8333L14.667 20.1667Z"
                        fill="#818C99"
                      />
                      <path
                        d="M34.8337 25.666H31.167V31.166H25.667V34.8327H31.167V40.3327H34.8337V34.8327H40.3337V31.166H34.8337V25.666Z"
                        fill="#818C99"
                      />
                    </svg>
                  </i>
                  <span>
                    {translate("Добавить быструю ссылку", "hotlink.addHotlink")}
                  </span>
                </Link>
              )}

              {/* 🔽 ПОТОМ УЖЕ КАРТОЧКИ */}
              {data.list.map((hotlink) => (
                <HotlinkCard
                  key={hotlink.id}
                  orgID={this.orgID}
                  hotlink={hotlink}
                  canEdit={canEdit}
                  className="organization-hotlinks__card"
                />
              ))}

              <div style={{ minWidth: "1px" }} />
            </div>
          </ScrollContainer>
        ) : canEdit ? (
          <Link
            to={`/organizations/${this.orgID}/hotlinks/create`}
            className="organization-hotlinks__add"
          >
            <ImageAdd />
            <span className="f-14 f-400">
              {translate("Добавить быструю ссылку", "hotlink.addHotlink")}
            </span>
          </Link>
        ) : (
          <span className="f-14 f-500 hotlinks__empty">
            {translate("Нет быстрых ссылок", "hotlink.noHotlinks")}
          </span>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  orgHotlinks: state.organizationStore.orgHotlinks,
});

const mapDispatchToProps = (dispatch) => ({
  getOrgHotlinks: (params) => dispatch(getOrgHotlinks(params)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrganizationHotlinks);
