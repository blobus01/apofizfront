// export const allowedRoutes = (routes, token, user, orgDetail) => {

//   return routes.filter(route => (route.auth ? route.auth(token, user) : true)) || [];
// };


import React from "react";
import { Redirect } from "react-router-dom";

export const allowedRoutes = (routes, token, user, orgDetail) => {
  return routes
    .filter(route => (route.auth ? route.auth(token, user) : true))
    .map(route => {
      const isCouponRoute =
        route.path === "/organizations/:id/coupons" ||
        route.path === "/organizations/:id/coupons/create" ||
        route.path === "/organizations/:id/coupons/edit/:couponID" ||
        route.path === "/organizations/:id/coupons/:couponID/edit";

      if (!isCouponRoute) return route;


      return {
        ...route,
        component: undefined, // 🔥 ОБЯЗАТЕЛЬНО
    render: (props) => {
  const { pathname } = props.location;
  const orgId = props.match.params.id;

  const isCouponRoute = pathname.includes("/coupons");

  if (isCouponRoute && orgDetail) {
    if (!orgDetail.data.permissions.is_owner) {
      return <Redirect to={`/organizations/${orgId}`} />;
    }
  }

  const Component = route.component;
  return <Component {...props} />;
}

      };
    });
};
