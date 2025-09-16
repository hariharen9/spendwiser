
import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'
import { test, expect, vi } from 'vitest'
import { User } from 'firebase/auth'

const mockUser: User = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.png',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  // Add other required properties from the User type
  // For example:
  tenantId: null,
  providerId: 'password',
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
  phoneNumber: null,
};

test('renders sidebar with navigation items', () => {
  render(
    <Sidebar
      currentScreen="dashboard"
      onScreenChange={() => {}}
      user={mockUser}
      onLogout={() => {}}
    />
  )

  const dashboardElement = screen.getByText(/Dashboard/i)
  const transactionsElement = screen.getByText(/Transactions/i)
  const budgetsElement = screen.getByText(/Budgets/i)
  const settingsElement = screen.getByText(/Settings/i)

  expect(dashboardElement).toBeInTheDocument()
  expect(transactionsElement).toBeInTheDocument()
  expect(budgetsElement).toBeInTheDocument()
  expect(settingsElement).toBeInTheDocument()
})
