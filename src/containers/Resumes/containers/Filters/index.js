import React, {useState} from 'react';
import {Layer} from "@components/Layer";
import Main from "./views/Main";
import {SEARCH_PARAMS} from "../../constants";
import {Formik} from "formik";
import Subcategories from "./views/Subcategories";
import Salary from "./views/Salary";
import {ORDERING_OPTIONS, VALIDATION_SCHEMA, VIEWS} from "./constants";
import useSearchParams from "@hooks/useSearchParams";
import {GENDER} from "@common/constants";
import {useDispatch, useSelector} from "react-redux";
import {setSelectedResumeSubcategories} from "@store/actions/postActions";
import useObjectSearchParam from "@containers/Resumes/hooks/useObjectSearchParam";

const Filters = ({isOpen, onClose}) => {
  const dispatch = useDispatch()

  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState(VIEWS.main);

  const [subcategories] = useObjectSearchParam(SEARCH_PARAMS.subcategories, [])
  const cachedSubcategoryObjects = useSelector(state => state.postStore.selectedResumeSubcategories)
  const subcategoryObjects = cachedSubcategoryObjects.filter(cat =>
    subcategories.includes(cat.id))

  const handleSubmit = values => {
    const newSubcategories = values[SEARCH_PARAMS.subcategories]

    setSearchParams({
      [SEARCH_PARAMS.salary_from]: values[SEARCH_PARAMS.salary_from] || null,
      [SEARCH_PARAMS.salary_to]: values[SEARCH_PARAMS.salary_to] || null,
      [SEARCH_PARAMS.gender]: values[SEARCH_PARAMS.gender],
      [SEARCH_PARAMS.has_work_experience]: values[SEARCH_PARAMS.has_work_experience] || null,
      [SEARCH_PARAMS.has_education]: values[SEARCH_PARAMS.has_education] || null,
      [SEARCH_PARAMS.ordering]: values[SEARCH_PARAMS.ordering] === ORDERING_OPTIONS.fresh.value ?
        null : values[SEARCH_PARAMS.ordering],
      [SEARCH_PARAMS.subcategory]: values[SEARCH_PARAMS.subcategories].length ?
        null : searchParams[SEARCH_PARAMS.subcategory] ?? null,
      [SEARCH_PARAMS.subcategories]: JSON.stringify(newSubcategories.map(cat => cat.id))
    })
    dispatch(setSelectedResumeSubcategories([
      ...cachedSubcategoryObjects.filter(cat => !newSubcategories.find(newCat => newCat.id === cat.id)),
      ...newSubcategories,
    ]))
    onClose()
  }

  return (
    <Layer isOpen={isOpen}>
      <Formik
        initialValues={{
          [SEARCH_PARAMS.category]: searchParams[SEARCH_PARAMS.category] ?? null,
          [SEARCH_PARAMS.subcategories]: subcategoryObjects,
          [SEARCH_PARAMS.salary_from]: searchParams[SEARCH_PARAMS.salary_from] ?? '',
          [SEARCH_PARAMS.salary_to]: searchParams[SEARCH_PARAMS.salary_to] ?? '',
          [SEARCH_PARAMS.gender]: searchParams[SEARCH_PARAMS.gender] ?? GENDER.not_specified,
          [SEARCH_PARAMS.has_work_experience]: !!searchParams[SEARCH_PARAMS.has_work_experience],
          [SEARCH_PARAMS.has_education]: !!searchParams[SEARCH_PARAMS.has_education],
          [SEARCH_PARAMS.ordering]: searchParams[SEARCH_PARAMS.ordering] ?? ORDERING_OPTIONS.fresh.value,
        }}
        onSubmit={handleSubmit}
        validationSchema={VALIDATION_SCHEMA}
      >
        {({setFieldValue, handleSubmit}) => {
          return (
            <form onSubmit={handleSubmit} style={{marginBottom: '1.5rem'}}>
              {view === VIEWS.main && (
                <Main
                  onClose={onClose}
                  onCategorySelect={cat => {
                    setFieldValue(SEARCH_PARAMS.category, cat)
                    setView(VIEWS.subcategories)
                  }}
                  onSalaryOpen={() => setView(VIEWS.salary)}
                />
              )}
              {view === VIEWS.subcategories && (
                <Subcategories
                  onBack={() => {
                    setFieldValue(SEARCH_PARAMS.category, null)
                    setView(VIEWS.main)
                  }}
                />
              )}
              {view === VIEWS.salary && (
                <Salary
                  onBack={() => setView(VIEWS.main)}
                />
              )}
            </form>
          )
        }}
      </Formik>

    </Layer>
  );
};

export default Filters;