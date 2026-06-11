import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import { useAuth } from '@/hooks/useAuth'
import { useOnboardingGate } from '@/pages/onboarding/onboarding.hooks'
import { isSupabaseConfigured } from '@/lib/supabase.client'
import { Spinner } from '@/components/ui'

// Home is the first paint after auth — keep it eager so users don't see a
// spinner on every cold start. Auth pages are lightweight and frequently
// hit, also eager. Everything else lazy-loads on first navigation.
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import HomePage from '@/pages/home/HomePage'

const TasksPage = lazy(() => import('@/pages/tasks/TasksPage'))
const MealsPage = lazy(() => import('@/pages/meals/MealsPage'))
const GoalsPage = lazy(() => import('@/pages/goals/GoalsPage'))
const CalendarPage = lazy(() => import('@/pages/calendar/CalendarPage'))
const ActivityPage = lazy(() => import('@/pages/activity/ActivityPage'))
const ChallengePage = lazy(() => import('@/pages/challenge/ChallengePage'))
const ChartsPage = lazy(() => import('@/pages/charts/ChartsPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <Spinner size={20} />
  </div>
)

const ProtectedRoutes = () => {
  const { user, isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()
  const { isChecking, needsOnboarding } = useOnboardingGate(user?.id)

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={24} />
      </div>
    )
  }

  if (!isAuthenticated && isSupabaseConfigured) {
    return <Navigate to="/login" replace />
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={24} />
      </div>
    )
  }

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <AppShell />
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  )
}
