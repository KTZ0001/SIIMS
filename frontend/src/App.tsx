import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { useStore } from './store/StoreContext';
import type { Role } from './store/types';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));

const InvestorBrowse = lazy(() => import('./pages/investor/Browse'));
const InvestorOpportunities = lazy(
  () => import('./pages/investor/Opportunities'),
);

const FounderDashboard = lazy(() => import('./pages/founder/Dashboard'));
const FounderApplication = lazy(() => import('./pages/founder/Application'));
const FounderMentor = lazy(() => import('./pages/founder/MentorView'));
const FounderProgress = lazy(() => import('./pages/founder/Progress'));
const FounderFunding = lazy(() => import('./pages/founder/Funding'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminApplications = lazy(() => import('./pages/admin/Applications'));
const AdminStartups = lazy(() => import('./pages/admin/Startups'));
const AdminMentors = lazy(() => import('./pages/admin/Mentors'));
const AdminPrograms = lazy(() => import('./pages/admin/Programs'));
const AdminFunding = lazy(() => import('./pages/admin/Funding'));
const AdminResources = lazy(() => import('./pages/admin/Resources'));
const AdminActivity = lazy(() => import('./pages/admin/ActivityLog'));

const MentorDashboard = lazy(() => import('./pages/mentor/Dashboard'));
const MentorStartups = lazy(() => import('./pages/mentor/Startups'));
const MentorSessions = lazy(() => import('./pages/mentor/Sessions'));

const ROLE_HOME: Record<Role, string> = {
  FOUNDER: '/founder',
  ADMIN: '/admin',
  MENTOR: '/mentor',
  INVESTOR: '/investor',
};

function PageLoader() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
    </div>
  );
}

/**
 * Role switching replaces authentication: landing on another role's section
 * simply redirects to the active role's home rather than showing a denial.
 */
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { state } = useStore();
  if (state.activeRole !== role) {
    return <Navigate to={ROLE_HOME[state.activeRole]} replace />;
  }
  return <>{children}</>;
}

function RoleHome() {
  const { state } = useStore();
  return <Navigate to={ROLE_HOME[state.activeRole]} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* The app opens on the login screen. The marketing page stays
            reachable at /landing; its CTAs all lead back to /login. */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<RoleHome />} />

          {/* Founder */}
          <Route
            path="/founder"
            element={
              <RequireRole role="FOUNDER">
                <FounderDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/founder/application"
            element={
              <RequireRole role="FOUNDER">
                <FounderApplication />
              </RequireRole>
            }
          />
          <Route
            path="/founder/mentor"
            element={
              <RequireRole role="FOUNDER">
                <FounderMentor />
              </RequireRole>
            }
          />
          <Route
            path="/founder/progress"
            element={
              <RequireRole role="FOUNDER">
                <FounderProgress />
              </RequireRole>
            }
          />
          <Route
            path="/founder/funding"
            element={
              <RequireRole role="FOUNDER">
                <FounderFunding />
              </RequireRole>
            }
          />

          {/* Admin / Incubation Center */}
          <Route
            path="/admin"
            element={
              <RequireRole role="ADMIN">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <RequireRole role="ADMIN">
                <AdminApplications />
              </RequireRole>
            }
          />
          <Route
            path="/admin/startups"
            element={
              <RequireRole role="ADMIN">
                <AdminStartups />
              </RequireRole>
            }
          />
          <Route
            path="/admin/mentors"
            element={
              <RequireRole role="ADMIN">
                <AdminMentors />
              </RequireRole>
            }
          />
          <Route
            path="/admin/programs"
            element={
              <RequireRole role="ADMIN">
                <AdminPrograms />
              </RequireRole>
            }
          />
          <Route
            path="/admin/funding"
            element={
              <RequireRole role="ADMIN">
                <AdminFunding />
              </RequireRole>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <RequireRole role="ADMIN">
                <AdminResources />
              </RequireRole>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <RequireRole role="ADMIN">
                <AdminActivity />
              </RequireRole>
            }
          />

          {/* Mentor */}
          <Route
            path="/mentor"
            element={
              <RequireRole role="MENTOR">
                <MentorDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/mentor/startups"
            element={
              <RequireRole role="MENTOR">
                <MentorStartups />
              </RequireRole>
            }
          />
          <Route
            path="/mentor/sessions"
            element={
              <RequireRole role="MENTOR">
                <MentorSessions />
              </RequireRole>
            }
          />

          {/* Investor — read-only lens */}
          <Route
            path="/investor"
            element={
              <RequireRole role="INVESTOR">
                <InvestorBrowse />
              </RequireRole>
            }
          />
          <Route
            path="/investor/opportunities"
            element={
              <RequireRole role="INVESTOR">
                <InvestorOpportunities />
              </RequireRole>
            }
          />
        </Route>

        <Route path="*" element={<RoleHome />} />
      </Routes>
    </Suspense>
  );
}
