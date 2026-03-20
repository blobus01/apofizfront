import {useMemo} from 'react';
import useSearchParam from "../../../hooks/useSearchParam";
import {SEARCH_PARAMS} from "../constants";
import useObjectSearchParam from "./useObjectSearchParam";
import useDebounce from "../../../hooks/useDebounce";

const useResumeParams = () => {
  const [category] = useSearchParam(SEARCH_PARAMS.category)
  const [subcategory] = useSearchParam(SEARCH_PARAMS.subcategory)
  const [salary_from] = useSearchParam(SEARCH_PARAMS.salary_from)
  const [salary_to] = useSearchParam(SEARCH_PARAMS.salary_to)
  const [gender] = useSearchParam(SEARCH_PARAMS.gender)
  const [has_work_experience] = useSearchParam(SEARCH_PARAMS.has_work_experience)
  const [has_education] = useSearchParam(SEARCH_PARAMS.has_education)
  const [ordering] = useSearchParam(SEARCH_PARAMS.ordering)
  const [search] = useSearchParam(SEARCH_PARAMS.search, '')
  const [subcategories] = useObjectSearchParam(SEARCH_PARAMS.subcategories)
  const [region] = useObjectSearchParam(SEARCH_PARAMS.region)

  const filters = useMemo(() => {
    return {
      category,
      [SEARCH_PARAMS.country]: region?.code ?? null,
      [SEARCH_PARAMS.city]: region?.id ?? null,
      [SEARCH_PARAMS.subcategories]: subcategories?.length ?
        subcategories.join(',') : subcategory,
      salary_from,
      salary_to,
      gender,
      has_work_experience,
      has_education,
      ordering,
      search,
    }
  }, [
    category,
    subcategory,
    subcategories,
    region?.code,
    region?.id,
    salary_from,
    salary_to,
    gender,
    has_work_experience,
    has_education,
    ordering,
    search
  ]);

  return useDebounce(filters, 150)
};

export default useResumeParams;