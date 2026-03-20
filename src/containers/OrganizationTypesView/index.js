import React from "react";
import { ArrowRight } from "../../components/UI/Icons";
import { connect } from "react-redux";
import "./index.scss";
import { getOrganizationSubTypes } from "../../store/actions/organizationActions";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import Preloader from "../../components/Preloader";
import EmptyBox from "../../components/EmptyBox";
import { OrgSubCard } from "../OrganizationSubTypesView";
import { translate } from "../../locales/locales";

class OrganizationTypesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
    };
  }

  onSearchChange = (e) => {
    const { value } = e.target;
    if (value !== this.state.search) {
      this.setState({ search: value });
      this.props.getOrganizationSubTypes({ search: value });
    }
  };

  onSearchCancel = () => {
    if (this.state.search !== "") {
      this.setState({ search: "" });
    }
  };

  render() {
    const {
      onBack,
      orgTypes,
      orgSubTypes,
      selectedTypes,
      onSelect,
      onSubTypeSelect,
      appTypes,
    } = this.props;
    const { data } = appTypes || orgTypes;

    return (
      <div className="org-types-view">
        <MobileSearchHeader
          title={translate("Вид Организации", "org.organizationType")}
          searchValue={this.state.search}
          onSearchChange={this.onSearchChange}
          onSearchCancel={this.onSearchCancel}
          onBack={onBack}
          disableForm
        />

        <div className="org-types-view__content">
          <div className="container">
            {this.state.search ? (
              <React.Fragment>
                {appTypes ? (
                  (() => {
                    const filteredTypes = appTypes.data
                      ?.flatMap((category) => category.types || [])
                      .filter((type) =>
                        type.title
                          .toLowerCase()
                          .includes(this.state.search.toLowerCase())
                      );

                    return filteredTypes.length === 0 ? (
                      <EmptyBox title="Поиск не дал результатов" />
                    ) : (
                      <div className="org-types-view__subcards">
                        {filteredTypes.map((type) => (
                          <OrgSubCard
                            key={type.id}
                            type={type}
                            isActive={selectedTypes
                              .map((item) => item.id)
                              .includes(type.id)}
                            onSelect={onSubTypeSelect}
                          />
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <>
                    {orgSubTypes.loading ? (
                      <Preloader />
                    ) : !orgSubTypes.data ||
                      (orgSubTypes.data && !orgSubTypes.data.length) ? (
                      <EmptyBox title="Поиск не дал результатов" />
                    ) : (
                      <div className="org-types-view__subcards">
                        {orgSubTypes.data.map((type) => (
                          <OrgSubCard
                            key={type.id}
                            type={type}
                            isActive={selectedTypes
                              .map((item) => item.id)
                              .includes(type.id)}
                            onSelect={onSubTypeSelect}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </React.Fragment>
            ) : (
              <div className="org-types-view__cards">
                {data && data.length > 0 ? (
                  data.map((cat) => (
                    <div
                      key={cat.id}
                      className="org-types-view__card row"
                      onClick={() => onSelect(cat.id)}
                    >
                      <div className="org-types-view__card-left">
                        <p className="f-16 tl">{cat.name}</p>
                        <p className="f-14">
                          {cat.types
                            .filter((type) =>
                              selectedTypes
                                .map((item) => item.id)
                                .includes(type.id)
                            )
                            .map((type) => type.title)
                            .join(", ")}
                        </p>
                      </div>
                      <ArrowRight />
                    </div>
                  ))
                ) : (
                  <h2 style={{ fontWeight: "500", textAlign: "center" }}>
                    {translate("Список пуст", "common.listEmpty")}
                  </h2>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  orgTypes: state.organizationStore.orgTypes,
  orgSubTypes: state.organizationStore.orgSubTypes,
});

const mapDispatchToProps = (dispatch) => ({
  getOrganizationSubTypes: (params) =>
    dispatch(getOrganizationSubTypes(params)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationTypesView);
