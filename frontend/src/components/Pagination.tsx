import React from 'react'

import { Button } from './ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[rgba(20,184,166,0.25)] bg-[rgba(10,14,26,0.80)] px-4 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <Button
          variant="outline"
          className="border-2 border-[#14B8A6] bg-[rgba(20,184,166,0.10)] px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-[#14B8A6] disabled:opacity-40"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          className="border-2 border-[#14B8A6] bg-[rgba(20,184,166,0.10)] px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-[#14B8A6] disabled:opacity-40"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden flex-1 items-center justify-between sm:flex">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-300">
          Showing <span className="text-[#14B8A6]">{startItem}</span> to{' '}
          <span className="text-[#14B8A6]">{endItem}</span> of{' '}
          <span className="text-[#14B8A6]">{totalItems}</span> programs
        </p>
        <nav className="flex items-center gap-2" aria-label="Pagination">
          <Button
            variant="outline"
            className="border-2 border-[#14B8A6] bg-[rgba(20,184,166,0.10)] px-3 py-2 text-xs font-black uppercase tracking-[0.3em] text-[#14B8A6] disabled:opacity-40"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          {getPageNumbers().map((page, index) => {
            const isActive = page === currentPage
            const isEllipsis = page === '...'

            return (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={isEllipsis}
                className={`h-10 w-10 rounded-lg border-2 text-sm font-black uppercase tracking-wider transition-colors ${
                  isEllipsis
                    ? 'cursor-default border-transparent text-gray-500'
                    : isActive
                    ? 'border-[#14B8A6] bg-[rgba(20,184,166,0.30)] text-black'
                    : 'border-[rgba(20,184,166,0.30)] bg-[rgba(20,184,166,0.10)] text-[#a8a8c0] hover:border-[#14B8A6] hover:bg-[rgba(20,184,166,0.20)]'
                }`}
              >
                {page}
              </button>
            )
          })}
          <Button
            variant="outline"
            className="border-2 border-[#14B8A6] bg-[rgba(20,184,166,0.10)] px-3 py-2 text-xs font-black uppercase tracking-[0.3em] text-[#14B8A6] disabled:opacity-40"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </nav>
      </div>
    </div>
  )
}
