import {translate} from "../../../../locales/locales";
import * as Yup from "yup";
import {SEARCH_PARAMS} from "../../constants";
import {GENDER} from "../../../../common/constants";

export const VIEWS = Object.freeze({
  main: 'main',
  salary: 'salary',
  subcategories: 'subcategories',
})
export const ORDERING_OPTIONS = {
  fresh: {
    value: 'new',
    label: translate('Новое', 'shop.new')
  },
  expensive: {
    value: '-salary_to',
    label: translate('Дороже', 'shop.expensive')
  },
  cheaper: {
    value: 'salary_to',
    label: translate('Дешевле', 'shop.cheaper')
  }
}

export const VALIDATION_SCHEMA = Yup.object({
  [SEARCH_PARAMS.category]: Yup.number().nullable(),
  [SEARCH_PARAMS.subcategories]: Yup.array().of(Yup.object()),
  [SEARCH_PARAMS.salary_from]: Yup.number(),
  [SEARCH_PARAMS.salary_to]: Yup.number(),
  [SEARCH_PARAMS.gender]: Yup.mixed().oneOf(Object.values(GENDER)),
  [SEARCH_PARAMS.has_work_experience]: Yup.bool(),
  [SEARCH_PARAMS.has_education]: Yup.bool(),
  [SEARCH_PARAMS.ordering]: Yup
    .mixed()
    .oneOf(Object.values(ORDERING_OPTIONS).map(opt => opt.value)),
})

export const DEFAULT_FILTERS = {
  [SEARCH_PARAMS.subcategories]: [],
  [SEARCH_PARAMS.salary_from]: '',
  [SEARCH_PARAMS.salary_to]: '',
  [SEARCH_PARAMS.gender]: null,
  [SEARCH_PARAMS.has_work_experience]: false,
  [SEARCH_PARAMS.has_education]: false,
  [SEARCH_PARAMS.ordering]: ORDERING_OPTIONS.fresh.value,
}