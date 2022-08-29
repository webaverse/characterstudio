import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ToastContainer } from "react-toastify"

import { PrimaryRoutes } from "dataset/routes"
import ThemeProvider from "./theme/ThemeProvider"

const queryClient = new QueryClient()

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {PrimaryRoutes.map(({ path, component }, index) => (
              <Route key={index} path={path} element={component} />
            ))}
            <Route path="*" element={<Navigate to="/scene" replace />} />
          </Routes>
          <ToastContainer theme="colored" />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
