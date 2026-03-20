import PropTypes from 'prop-types';

export const criteria_subcategory = {
  id: PropTypes.number,
  name: PropTypes.string,
  icon: PropTypes.shape({
    id: PropTypes.number,
    file: PropTypes.string,
    name: PropTypes.string,
    large: PropTypes.string,
    medium: PropTypes.string,
    small: PropTypes.string,
  }),
};

export const stockDetail = {
  criteria_subcategory: PropTypes.shape(criteria_subcategory),
  available_sizes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      size: PropTypes.string,
    })
  ),
  collection_items_quantity: PropTypes.number,
  item_quantity: PropTypes.bool,
};
