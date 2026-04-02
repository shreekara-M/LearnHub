import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminRoute from './components/AdminRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Spinner from './components/Spinner.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const Layout = lazy(() => import('./components/Layout.jsx'));
const LoginPage = lazy(() => import('./pages/Login.jsx'));
const RegisterPage = lazy(() => import('./pages/Register.jsx'));
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtp.jsx'));
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CoursesPage = lazy(() => import('./pages/CoursesPage.jsx'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const LearnPage = lazy(() => import('./pages/LearnPage.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const OverviewPage = lazy(() => import('./pages/admin/OverviewPage.jsx'));
const CoursesListPage = lazy(() => import('./pages/admin/CoursesListPage.jsx'));
const CourseNewPage = lazy(() => import('./pages/admin/CourseNewPage.jsx'));
const CourseEditPage = lazy(() => import('./pages/admin/CourseEditPage.jsx'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage.jsx'));
const PurchasesPage = lazy(() => import('./pages/admin/PurchasesPage.jsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: 1
    }
  }
});

function FullScreenFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50">
      <Spinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<FullScreenFallback />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                  </Route>
                  <Route path="/courses/:courseId/learn" element={<LearnPage />} />
                </Route>

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<OverviewPage />} />
                    <Route path="courses" element={<CoursesListPage />} />
                    <Route path="courses/new" element={<CourseNewPage />} />
                    <Route path="courses/:courseId/edit" element={<CourseEditPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="purchases" element={<PurchasesPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;