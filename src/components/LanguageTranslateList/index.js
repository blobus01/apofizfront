import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {getLanguageTranslateList} from "../../store/actions/commonActions";
import {BackArrow} from "../UI/Icons";
import MenuItem from "./MenuItem";
import Preloader from "../Preloader";
import {translate} from "../../locales/locales";
import './index.scss';

const LanguageTranslateList = ({onBack, getOrgTranslation, getOrgTranslationObject, currentCodes, currentCode}) => {
  const dispatch = useDispatch();
  const {data: languageTranslateList, loading} = useSelector(state => state.commonStore.languageTranslateList);

  useEffect(() => {
    dispatch(getLanguageTranslateList());
  }, [dispatch]);

  return (
    <div className="container">
      <div className="language-translate">
        <div className="language-translate__top">
          <button type="button" className="language-translate__back" onClick={onBack}><BackArrow/></button>
          <h3 className="f-16 f-500">{translate("Все языки", "app.allLanguages")}</h3>
        </div>
        <div className="language-translate__list">
          {loading
            ? <Preloader/>
            : languageTranslateList && (
            languageTranslateList.map(item => (
              <MenuItem
                key={item.code}
                onClick={() => {
                  if (currentCode === item.code) return;
                  getOrgTranslation && getOrgTranslation(item.code);
                  getOrgTranslationObject && getOrgTranslationObject(item)
                  onBack();
                }}
                title={item.national_language}
                img={item.flag && item.flag.small}
                currentCode={currentCode ?? currentCodes?.find(code => item.code === code)}
                code={item.code}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageTranslateList;