import React from "react";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import "./index.scss";

const ShopFeedView = ({
  data,
  orgDetail,
  user,
  margin,
  darkTheme,
  isSearchOpen,
}) => {
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

  console.log("IS Search Open", isSearchOpen);

  return (
    <div
      className="shop-feed-view grid_layout__inner"
      style={{
        margin: `16px ${isSearchOpen ? "0px" : "5px"}`,
      }}
    >
      {data &&
        data?.list.map((post) => (
          <PostFeedCard
            darkTheme={darkTheme}
            key={post.id}
            margin={margin}
            post={{ ...post, is_hidden: false }}
            organization={organization}
            refOrganization={
              post.organization ? post.organization : organization
            }
            permissions={orgDetail.permissions}
            isOrganizationDetailPage={true}
            isGuest={!user}
            className="shop-feed-view__card"
          />
        ))}
    </div>
  );
};

export default ShopFeedView;
