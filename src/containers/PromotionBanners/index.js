import React, { Component } from "react";
import { connect } from "react-redux";
import { getOrgPromotions } from "../../store/actions/organizationActions";
import PromotionBannerSlider from "../../components/PromotionBannerSlider";
import "./index.scss";

class PromotionBanners extends Component {
  componentDidMount() {
    const { region, getOrgPromotions } = this.props;
    getOrgPromotions({
      page: 1,
      limit: 100,
      country: region && (region.country_code || region.code),
    });
  }

  render() {
    const { orgPromotions, className, darkTheme } = this.props;
    const { data } = orgPromotions;
    if (!data || (data && !data.list.length)) {
      return null;
    }
    return (
      <div className={className}>
        <PromotionBannerSlider darkTheme={darkTheme} banners={data.list} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  orgPromotions: state.organizationStore.orgPromotions,
  region: state.userStore.region,
});

const mapDispatchToProps = (dispatch) => ({
  getOrgPromotions: (params, isNext) =>
    dispatch(getOrgPromotions(params, isNext)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PromotionBanners);
