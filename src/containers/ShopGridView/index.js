import React from "react";
import PostGridCard from "../../components/Cards/PostGridCard";
import "./index.scss";

const ShopGridView = ({ data, orgDetail, user, darkTheme }) => {
  if (!data || !orgDetail) {
    return null;
  }

  const organization = {
    id: orgDetail.id,
    title: orgDetail.title,
    image: orgDetail.image,
    types: orgDetail.types,
    currency: orgDetail.currency,
  };

  return (
    <div className="shop-grid-view" style={{ margin: "16px 9px" }}>
      {data &&
        data.list.map((post) => (
          <PostGridCard
            key={post.id}
            post={post}
            darkTheme={darkTheme}
            organization={organization}
            refOrganization={
              post.organization ? post.organization : organization
            }
            permissions={orgDetail.permissions}
            isGuest={!user}
            className="shop-grid-view__card"
          />
        ))}
    </div>
  );
};

export default ShopGridView;
