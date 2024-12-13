import './pagination.scss'

import React, { FC } from 'react'

type paginationType = {
    totalPages: number
    currentPage: number
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>
} 

const Pagination: FC<paginationType> = ({ totalPages, currentPage, setCurrentPage }) => {

    const goToPage = (page: number) => {
        if (page < 1) {
            setCurrentPage(1)
        } else if (page > totalPages) {
            setCurrentPage(totalPages)
        } else {
            setCurrentPage(page)
        }
    }

    const goToFirstPage = () => goToPage(1)
    const goToLastPage = () => goToPage(totalPages)

    const getPageNumbers = () => {
        const maxPages = 5
        let startPage = Math.max(currentPage - 2, 1)
        let endPage = Math.min(startPage + maxPages - 1, totalPages)

        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(endPage - maxPages + 1, 1)
        }

        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
    }

    return (
        <div className="pagination">
            <button onClick={goToFirstPage} disabled={currentPage === 1}>
                First
            </button>

            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                &lt
            </button>

            {getPageNumbers().map((page) => (
                <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={page === currentPage ? 'active' : ''}
                >
                    {page}
                </button>
            ))}

            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                &gt
            </button>

            <button onClick={goToLastPage} disabled={currentPage === totalPages}>
                Last
            </button>
        </div>
    )
}


export default Pagination