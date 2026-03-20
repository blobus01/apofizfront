import PropTypes from "prop-types";

const TimeItemPropTypes = PropTypes.shape({
  value: PropTypes.string.isRequired,
  is_booked: PropTypes.bool.isRequired,
  is_available: PropTypes.bool
})

export default TimeItemPropTypes