import React from "react";
import PropTypes from "prop-types";
import ImagePropTypes from "../../prop-types/Image";
import { nullable } from "../../common/helpers";
import { CategoryOption } from "../CategoryOption";
import classNames from "classnames";
import "./index.scss";

const PostCategoryList = ({
  categories,
  selectedSubcategory,
  selectedSubcategories = [],
  onSelect,
  className,
  ...rest
}) => {
  return (
    <div className={classNames("post-category-list", className)} {...rest}>
      {categories.map((cat) => {
        let description = "";

        if (selectedSubcategory && selectedSubcategory.category === cat.id) {
          description = selectedSubcategory.name;
        }

        const categorySubcategories = selectedSubcategories.filter(
          (subcat) => subcat.category === cat.id,
        );
        if (categorySubcategories.length) {
          description = categorySubcategories.map((cat) => cat.name).join(", ");
        }

        return (
          <CategoryOption
            key={cat.id}
            label={cat.name}
            icon={cat.icon}
            subcategory={cat?.current_subcategory?.name}
            onClick={() => onSelect(cat.id)}
            description={description}
            descPosition="underLabel"
            className="post-category-list__item"
          />
        );
      })}
    </div>
  );
};

PostCategoryList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: nullable(ImagePropTypes),
    }),
  ),
  selectedSubcategory: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.number.isRequired,
  }),
  onSelect: PropTypes.func,
};

export default PostCategoryList;
