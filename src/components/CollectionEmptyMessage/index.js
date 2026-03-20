import React from 'react';
import emptyImage from "../../assets/images/empty_compilation.svg"
import {translate} from "../../locales/locales";
import FullHeightContainer from "../FullHeightContainer";
import "./index.scss"

const CollectionEmptyMessage = () => {
  return (
    <FullHeightContainer includeHeader className="collection-empty-message dfc justify-center container">
      <img
        src={emptyImage}
        alt="The compilation is empty"
        className="collection-empty-message__image"
      />
      <h3 className="collection-empty-message__title f-700">
        {translate('Пустая подборка', 'compilations.empty')}
      </h3>
      <p className="collection-empty-message__desc">
        {translate('Вы можете добавить избранное в данную подборку', 'compilations.emptyMessageDesc')}
      </p>
    </FullHeightContainer>
  );
};

export default CollectionEmptyMessage;