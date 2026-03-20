import React, { useState } from "react";
import Info from "./views/Info";
import Main from "./views/Main";
import RelatedItems from "./views/RelatedItems";
import Relations from "../PostConnectionsView";
import Links from "./views/PostLinksView";
import TimeSpecification from "./views/TimeSpecification";

const RENT_SETTINGS_VIEWS = Object.freeze({
  info: "info",
  main: "main",
  relations: "relations",
  relatedItems: "relatedItems",
  links: "links",
  time: "time",
});

const RentSettings = ({
  rentID,
  onSubmit,
  onBack,
  canDelete,
  showInfo = false,
}) => {
  const [viewStack, setViewStack] = useState([
    showInfo ? RENT_SETTINGS_VIEWS.info : RENT_SETTINGS_VIEWS.main,
  ]);
  const pushToStack = (view) =>
    setViewStack((prevState) => [...prevState, view]);
  const popFromStack = () =>
    setViewStack((prevState) => prevState?.slice(0, prevState.length - 1));

  const renderView = () => {
    const currView = viewStack[viewStack.length - 1];
    switch (currView) {
      case RENT_SETTINGS_VIEWS.info:
        return <Info onNext={() => pushToStack(RENT_SETTINGS_VIEWS.time)} />;
      case RENT_SETTINGS_VIEWS.main:
        return (
          <Main
            headerProps={{
              onBack,
              onNext: onSubmit,
            }}
            rentID={rentID}
            onAddRelations={() => pushToStack(RENT_SETTINGS_VIEWS.relations)}
            onAddTime={() => pushToStack(RENT_SETTINGS_VIEWS.time)}
            canDelete={canDelete}
          />
        );
      case RENT_SETTINGS_VIEWS.relations:
        return (
          <Relations
            postID={rentID}
            onBack={popFromStack}
            onAddRelatedItems={() =>
              pushToStack(RENT_SETTINGS_VIEWS.relatedItems)
            }
            onAddLinks={() => pushToStack(RENT_SETTINGS_VIEWS.links)}
          />
        );
      case RENT_SETTINGS_VIEWS.relatedItems:
        return (
          <RelatedItems
            postID={rentID}
            onBack={popFromStack}
            onSubmit={popFromStack}
          />
        );
      case RENT_SETTINGS_VIEWS.links:
        return (
          <Links
            postID={rentID}
            onBack={popFromStack}
            onSubmit={popFromStack}
          />
        );
      case RENT_SETTINGS_VIEWS.time:
        return (
          <TimeSpecification
            rentID={rentID}
            onBack={popFromStack}
            onSubmit={() => pushToStack(RENT_SETTINGS_VIEWS.main)}
          />
        );
      default:
        return null;
    }
  };
  return <div>{renderView()}</div>;
};

export default RentSettings;
