import React, { useState } from 'react';
import useDaoSearchFilters from '../../hooks/useDaoSearchFilters';
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

  const resultItems = daosFiltered.slice(0, 5).map((dao) => {
    return (
      <li key={dao} className="dao-search-results-item">
        <a href={`/${dao}`}>{dao.split('.')[0]}</a>
      </li>
    );
  });

  const isLoading = status === DAOS_LIST_STATUS_PENDING;

  return (
    <div className="dao-search">
      <MDBInput name="searchFilter" value={searchTerm} onChange={search} label="Search"></MDBInput>
      {searchTerm.length > 0 && (
        <div className="dao-search-results">
          {daosFiltered.length > 0 && <ul className="dao-search-results-list">{resultItems}</ul>}
          {isLoading && <div>Loading...</div>}
          {error && <div>Error while loading data</div>}
        </div>
      )}
    </div>
  );
};

export default DaoSearch;
