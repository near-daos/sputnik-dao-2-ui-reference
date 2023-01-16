import React from 'react';
import { MDBBtn, MDBIcon } from 'mdbreact';
import { usePagination, DOTS } from '../../hooks/usePagination';

const Pagination = (props) => {
  const { onPageChange, totalCount, siblingCount = 1, currentPage, pageSize } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize
  });

  if (paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];

  return (
    <>
      {totalCount && totalCount > 0 ? (
        <div id="pagination">
          <MDBBtn color="elegant" size="sm" disabled={currentPage === 0} onClick={onPrevious}>
            <MDBIcon fas icon="angle-left" />
          </MDBBtn>
          {paginationRange.map((pageNumber, i) => {
            if (pageNumber === DOTS) {
              return (
                <MDBBtn size="sm" color="elegant" i={`dot-key-${i}`}>
                  &#8230;
                </MDBBtn>
              );
            }

            return (
              <MDBBtn
                key={`page-key-${pageNumber}`}
                color={pageNumber === currentPage + 1 ? 'dark' : 'elegant'}
                size="sm"
                selected={pageNumber === currentPage + 1}
                onClick={() => onPageChange(pageNumber - 1)}
              >
                {pageNumber}
              </MDBBtn>
            );
          })}
          <MDBBtn
            size="sm"
            color="elegant"
            disabled={currentPage + 1 === lastPage}
            onClick={onNext}
          >
            <MDBIcon fas icon="angle-right" />
          </MDBBtn>
        </div>
      ) : null}
    </>
  );
};

export default Pagination;
