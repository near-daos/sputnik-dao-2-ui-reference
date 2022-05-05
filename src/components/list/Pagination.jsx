import React from 'react';
import { MDBBtn } from 'mdbreact';
import { Decimal } from 'decimal.js';

const Pagination = ({ daoCount, daoLimit, togglePage }) => {
  return (
    <>
      {daoCount && daoCount > 0 ? (
        <>
          {Object.keys(Array.from(Array(Math.floor(daoCount / daoLimit) + 1).keys())).map(
            (item, key) => (
              <MDBBtn
                onClick={() => {
                  togglePage(Math.floor(item * daoLimit));
                }}
                size="sm"
                color="elegant"
                className=""
                key={key}
              >
                {'' + new Decimal(item).plus(1)}
              </MDBBtn>
            )
          )}
        </>
      ) : null}
    </>
  );
};

export default Pagination;
