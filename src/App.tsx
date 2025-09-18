import { useState, useEffect } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { SolanaProvider } from './providers/SolanaProvider'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply dark theme by default
    document.documentElement.classList.add('dark')
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        <RouterProvider router={router} />
        <Toaster 
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(220, 25%, 12%)',
              border: '1px solid hsl(220, 25%, 20%)',
              color: 'hsl(210, 40%, 98%)',
              borderRadius: '12px'
            },
          }}
        />
      </SolanaProvider>
    </QueryClientProvider>
  )
}

export default App
