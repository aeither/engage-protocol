import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div style={{ minHeight: '100vh' }}>
      <Outlet />
    </div>
  ),
})