import React from 'react';
import useSearchParam from "../../../../hooks/useSearchParam";
import {SEARCH_PARAMS} from "../../constants";
import SwitchableTabLinks from "../../../../components/TabLinks/SwitchableTabLinks";
import TabPanel from "../../../../components/UI/TabPanel";
import ResumeList from "../../containers/ResumeList";
import Organizations from "./containers/Organizations";
import useObjectSearchParam from "../../hooks/useObjectSearchParam";
import {TAB_KEYS} from "./constants";
import classes from "./index.module.scss"

const Search = () => {
  const [search] = useSearchParam(SEARCH_PARAMS.search)
  const [region] = useObjectSearchParam(SEARCH_PARAMS.region)
  const [tab, setTab] = useSearchParam(SEARCH_PARAMS.tab, TAB_KEYS.resumes)

  const TABS = [
    {
      label: 'Вакансии',
      key: TAB_KEYS.resumes,
      translation: 'notifications.vacancies',
      onClick: () => setTab(TAB_KEYS.resumes),
    },
    {
      label: 'Организации',
      key: TAB_KEYS.organizations,
      translation: 'app.organizations',
      onClick: () => setTab(TAB_KEYS.organizations)
    },
  ];


  return (
    <div className={classes.root}>
      <div className="container">
        <SwitchableTabLinks
          links={TABS}
          activeLink={tab}
          className={classes.tabs}
        />
      </div>

      <TabPanel value={tab} index={TAB_KEYS.resumes}>
        <ResumeList/>
      </TabPanel>

      <TabPanel value={tab} index={TAB_KEYS.organizations}>
        <Organizations
          search={search}
          region={region}
        />
      </TabPanel>
    </div>
  );
};

export default Search;