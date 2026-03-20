import PropTypes from "prop-types";

const ImagePropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  file: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  large: PropTypes.string.isRequired,
  medium: PropTypes.string.isRequired,
  small: PropTypes.string.isRequired,
})

export default ImagePropTypes