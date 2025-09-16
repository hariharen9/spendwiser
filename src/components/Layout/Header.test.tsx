
import { render, screen } from '@testing-library/react'
import Header from './Header'
import { test, expect } from 'vitest'

test('renders header with title', () => {
  render(<Header title="Dashboard" />)
  const titleElement = screen.getByText(/Dashboard/i)
  expect(titleElement).toBeInTheDocument()
})
