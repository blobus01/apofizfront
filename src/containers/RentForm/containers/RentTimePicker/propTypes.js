import PropTypes from "prop-types";
import {nullable} from "../../../../common/helpers";

export const view = {
  rentID: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  defaultStartTime: nullable(PropTypes.instanceOf(Date)),
  defaultEndTime: nullable(PropTypes.instanceOf(Date)),
}

export const childViewPropTypes = {
  ...view,
  time: PropTypes.instanceOf(Date).isRequired
}