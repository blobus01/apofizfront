import React, {useRef} from 'react';
import classNames from "classnames";
import {translate} from "../../../locales/locales";
import {getEducations} from "../../../store/services/resumeServices";
import {notifyQueryResult} from "../../../common/helpers";
import MobileMenu from "../../MobileMenu";
import useInfiniteScrollQuery from "../../../hooks/useInfiniteScrollQuery";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../Preloader";
import {DoneIcon} from "../../UI/Icons";
import "./index.scss"

const EducationMenu = ({selected = [], onSelect, className, onBack, isOpen, ...rest}) => {
  const isDataFetched = useRef(false);

  const fetchData = params => {
    return notifyQueryResult(getEducations(params))
      .then(res => {
        isDataFetched.current = true
        return res
      })
  }
  const {data: educations, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => isOpen ? fetchData(params) : null,
    [isOpen || isDataFetched.current],
    {limit: 60}
  )

  return (
    <MobileMenu
      isOpen={isOpen}
      contentLabel={translate('Выбрать образование', 'resumes.selectEducation')}
      {...rest}
    >
      <InfiniteScroll next={next} hasMore={hasMore} loader={<Preloader className="education-menu__preloader"/>}
                      dataLength={educations.length}
                      scrollableTarget="mobile-menu-content">
        <EducationList
          data={educations}
          selected={selected}
          onSelect={onSelect}
        />
      </InfiniteScroll>
    </MobileMenu>
  );
};

const EducationList = ({data = [], selected = [], onSelect, generateProps}) => {
  return (
    <div className="education-menu__list">
      {data.map(edu => {
        const props = (generateProps && generateProps(edu)) ?? {}
        const isSelected = selected.findIndex(selectedEdu => selectedEdu.id === edu.id) !== -1

        return (
          <button type="button"
                  className={classNames('education-menu__list-item f-17', isSelected && 'education-menu__list-item--selected')}
                  key={edu.id}
                  onClick={() => onSelect(edu)}
                  {...props}
          >
            <span className="education-menu__list-item-text tl">
              {edu.name}
            </span>
            <DoneIcon className={classNames('education-menu__list-item-icon', !isSelected && 'education-menu__list-item-icon--hidden')}/>
          </button>
        )
      })}
    </div>
  )
}

export default EducationMenu;