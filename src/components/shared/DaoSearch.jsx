import React, { useState } from 'react';
import useDaoSearchFilters from '../../hooks/useDaoSearchFilters';

const DaoSearch = () => {
  const { daosFiltered, filterDaosByName } = useDaoSearchFilters();
  const [searchTerm, setSearchTerm] = useState('');

  const search = (e) => {
    const searchTerm = e.target.value;
    filterDaosByName(searchTerm);
    setSearchTerm(searchTerm);
  };

  const resultItems = daosFiltered.slice(0, 5).map((dao) => {
    return (
      <li key={dao}>
        <a href={`/${dao}`}>{dao.split('.')[0]}</a>
      </li>
    );
  });

  return (
    <div>
      <input type="text" placeholder="Search" onChange={search} />
      {searchTerm.length > 0 && <ul>{resultItems}</ul>}
    </div>
  );
};

export default DaoSearch;
