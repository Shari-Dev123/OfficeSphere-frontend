import React, { useState } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './DataTable.css';

const DataTable = ({ 
  columns, 
  data, 
  searchable = true,
  pagination = true,
  itemsPerPage = 10,
  onRowClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="datatable-container">
      {searchable && (
        <div className="datatable-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
      )}

      <div className="datatable-wrapper">
        <table className="datatable">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} style={{ width: column.width }}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.render 
                        ? column.render(row[column.field], row)
                        : row[column.field]
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="datatable-pagination">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <FaChevronLeft />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                return page === 1 || 
                       page === totalPages || 
                       (page >= currentPage - 1 && page <= currentPage + 1);
              })
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                  <button
                    onClick={() => goToPage(page)}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;