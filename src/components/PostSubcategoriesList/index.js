import React from 'react';
import PropTypes from "prop-types";
import ImagePropTypes from "../../prop-types/Image";
import {nullable} from "../../common/helpers";
import {SubCategoryOption} from "../SubCategoryOption";
import classNames from "classnames";
import "./index.scss"

const PostSubcategoriesList = ({subcategories, selected, onSelect, onEdit, className, ...rest}) => {
  return (
    <div className={classNames('post-subcategories-list', className)} {...rest}>
      {subcategories.map(cat => {
        return (
          <SubCategoryOption
            label={cat.name}
            icon={cat.icon}
            key={cat.id}
            isActive={Array.isArray(selected) ?
              selected.includes(cat.id) : selected === cat.id}
            onClick={() => onSelect(cat)}
            onEdit={cat.organization && (() => onEdit(cat))}
            className="post-subcategories-list__item"
          />
        )
      })}
    </div>
  );
};

const PostSubcategoryPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  icon: nullable(ImagePropTypes),
  organization: nullable(PropTypes.number),
})

PostSubcategoriesList.propTypes = {
  subcategories: PropTypes.arrayOf(PostSubcategoryPropTypes)
}

export default PostSubcategoriesList;