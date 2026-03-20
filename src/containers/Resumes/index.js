import React, {useState} from 'react';
import Header from "./containers/Header";
import ShopControls from "./containers/ShopControls";
import ResumeList from "./containers/ResumeList";
import Filters from "./containers/Filters";
import Search from "./views/Search";
import "./index.scss"

const VIEWS = Object.freeze({
  main: 'main',
  search: 'search',
})

const Resumes = () => {
  const [view, setView] = useState(VIEWS.main);
  const [isFilterOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="resumes">
      <Header
        onSearchViewOpen={() => setView(VIEWS.search)}
        onSearchViewClose={() => setView(VIEWS.main)}
        onFilterClick={() => setIsFiltersOpen(true)}
      />

      {view === VIEWS.main && (
        <MainView/>
      )}

      {view === VIEWS.search && (
        <Search/>
      )}

      {isFilterOpen && (
        <Filters
          isOpen={isFilterOpen}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}
    </div>
  );
};


const MainView = () => {
  return (
    <>
      <ShopControls/>
      <ResumeList/>
    </>
  )
}

export default Resumes;