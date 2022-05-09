import React, { useState } from 'react';
import useDaoSearchFilters from '../../hooks/useDaoSearchFilters';
import useOuterClick from '../../hooks/useOuterClick';
import { DAOS_LIST_STATUS_PENDING } from '../../constants';
import { MDBInput } from 'mdbreact';

const DaoSearch = () => {
  const { daosFiltered, filterDaosByName, error, status } = useDaoSearchFilters();
  const [searchTerm, setSearchTerm] = useState('');

  const search = (e) => {
    const searchTerm = e.target.value;
    filterDaosByName(searchTerm);
    setSearchTerm(searchTerm);
  };

  const innerRef = useOuterClick((e) => {
    setSearchTerm('');
  });

  const resultItems = daosFiltered.slice(0, 5).map((dao) => {
    return (
      <li key={dao} className="dao-search-results-item">
        <a href={`/${dao}`}>{dao.split('.')[0]}</a>
      </li>
    );
  });

  const isLoading = status === DAOS_LIST_STATUS_PENDING;

  return (
    <div className="dao-search" ref={innerRef}>
      <MDBInput name="searchFilter" value={searchTerm} onChange={search} label="Search"></MDBInput>

      <div className="dao-search-results">
        {searchTerm.length > 0 && (
          <>
            {daosFiltered.length > 0 && <ul className="dao-search-results-list">{resultItems}</ul>}
            {daosFiltered.length === 0 && !isLoading && !error && (
              <div className="dao-search-message">No results</div>
            )}
            {isLoading && <div className="dao-search-message">Loading...</div>}
            {error && <div className="dao-search-message">Error while loading data</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default DaoSearch;
