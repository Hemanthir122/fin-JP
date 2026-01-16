import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Max page buttons to show

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic to show ellipsis if needed, for simplicity now just showing simple window
            // Or just simplified [1] ... [current-1] [current] [current+1] ... [last]

            if (currentPage <= 3) {
                // Near start
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="pagination-container">
            <button
                className="pagination-btn nav-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Previous Page"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="pagination-numbers">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                    ) : (
                        <button
                            key={page}
                            className={`pagination-btn number-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                className="pagination-btn nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Next Page"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}

export default Pagination;
