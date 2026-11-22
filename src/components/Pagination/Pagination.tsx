import type { FC } from 'react'
import { Pagination as BootstrapPagination } from 'react-bootstrap'

import './Pagination.css'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

type PageItem = number | 'ellipsis'

const pageItems = (currentPage: number, totalPages: number): PageItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: PageItem[] = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) items.push('ellipsis')
  for (let page = start; page <= end; page += 1) items.push(page)
  if (end < totalPages - 1) items.push('ellipsis')
  items.push(totalPages)

  return items
}

export const Pagination: FC<Props> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  if (totalPages <= 1) {
    return null
  }

  const goTo = (page: number) => {
    if (!disabled && page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  return (
    <BootstrapPagination className="pagination-bar pagination-sm">
      <BootstrapPagination.First
        onClick={() => goTo(1)}
        disabled={disabled || currentPage === 1}
      />
      <BootstrapPagination.Prev
        onClick={() => goTo(currentPage - 1)}
        disabled={disabled || currentPage === 1}
      />

      {pageItems(currentPage, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <BootstrapPagination.Ellipsis key={`ellipsis-${index}`} disabled />
        ) : (
          <BootstrapPagination.Item
            key={item}
            active={item === currentPage}
            disabled={disabled}
            onClick={() => goTo(item)}
          >
            {item}
          </BootstrapPagination.Item>
        ),
      )}

      <BootstrapPagination.Next
        onClick={() => goTo(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
      />
      <BootstrapPagination.Last
        onClick={() => goTo(totalPages)}
        disabled={disabled || currentPage === totalPages}
      />
    </BootstrapPagination>
  )
}
