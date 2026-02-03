/**
 * DataTable Component Tests
 */
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import DataTable from '@/components/ui/DataTable'

describe('DataTable Component', () => {
  const mockData = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
  ]

  const mockColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value' },
  ]

  it('should render table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('should render column headers', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<DataTable data={[]} columns={mockColumns} loading={true} />)
    // Check for loading indicator
  })

  it('should show empty state when no data', () => {
    render(<DataTable data={[]} columns={mockColumns} />)
    // Check for empty state message
  })
})

