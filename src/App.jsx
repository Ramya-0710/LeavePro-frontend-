import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Layout from './components/layout/Layout';

// Pages - Auth
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';

// Pages - Employee
import EmpDashboard  from './pages/employee/EmpDashboard';
import ApplyLeave    from './pages/employee/ApplyLeave';
import MyLeaves      from './pages/employee/MyLeaves';
import EmpAnalytics  from './pages/employee/EmpAnalytics';

// Pages - Manager
import MgrDashboard   from './pages/manager/MgrDashboard';
import LeaveRequests  from './pages/manager/LeaveRequests';
import TeamView       from './pages/manager/TeamView';
import MgrAnalytics   from './pages/manager/MgrAnalytics';
import MgrApplyLeave  from './pages/manager/MgrApplyLeave';

// Pages - Admin
import AdmDashboard      from './pages/admin/AdmDashboard';
import UserMgmt          from './pages/admin/UserMgmt';
import LeavePolicy       from './pages/admin/LeavePolicy';
import AdmAnalytics      from './pages/admin/AdmAnalytics';
import AdmLeaveApprovals from './pages/admin/AdmLeaveApprovals';

// Pages - Shared
import CalendarPage    from './pages/shared/CalendarPage';
import EventsPage      from './pages/shared/EventsPage';
import HolidaysPage    from './pages/shared/HolidaysPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import CarryForwardPage  from './pages/shared/CarryForwardPage';
import ProfilePage       from './pages/shared/ProfilePage';

// ── Guards ──
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-splash"><div className="splash-logo">🌿 LeaveFlow Pro</div><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.sysRole)) { const h={employee:"/dashboard",manager:"/mgr-dashboard",admin:"/adm-dashboard"}; return <Navigate to={h[user.sysRole]||"/login"} replace />; }
  return children;
};

const RoleHome = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const homes = { employee: '/dashboard', manager: '/mgr-dashboard', admin: '/adm-dashboard' };
  return <Navigate to={homes[user.sysRole] || '/dashboard'} replace />;
};


const LoginGuard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const homes = { employee:'/dashboard', manager:'/mgr-dashboard', admin:'/adm-dashboard' };
    return <Navigate to={homes[user.sysRole]||'/dashboard'} replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginGuard><LoginPage /></LoginGuard>} />
            <Route path="/home" element={<RoleHome />} />

            {/* ── Employee ── */}
            <Route path="/dashboard" element={<PrivateRoute roles={['employee']}><Layout><EmpDashboard /></Layout></PrivateRoute>} />
            <Route path="/apply"     element={<PrivateRoute roles={['employee']}><Layout><ApplyLeave /></Layout></PrivateRoute>} />
            <Route path="/my-leaves" element={<PrivateRoute roles={['employee']}><Layout><MyLeaves /></Layout></PrivateRoute>} />
            <Route path="/emp-analytics" element={<PrivateRoute roles={['employee']}><Layout><EmpAnalytics /></Layout></PrivateRoute>} />

            {/* ── Manager ── */}
            <Route path="/mgr-dashboard"   element={<PrivateRoute roles={['manager']}><Layout><MgrDashboard /></Layout></PrivateRoute>} />
            <Route path="/leave-requests"  element={<PrivateRoute roles={['manager']}><Layout><LeaveRequests /></Layout></PrivateRoute>} />
            <Route path="/team"            element={<PrivateRoute roles={['manager']}><Layout><TeamView /></Layout></PrivateRoute>} />
            <Route path="/mgr-analytics"   element={<PrivateRoute roles={['manager']}><Layout><MgrAnalytics /></Layout></PrivateRoute>} />
            <Route path="/mgr-apply"       element={<PrivateRoute roles={['manager']}><Layout><MgrApplyLeave /></Layout></PrivateRoute>} />
            <Route path="/mgr-my-leaves"   element={<PrivateRoute roles={['manager']}><Layout><MgrApplyLeave /></Layout></PrivateRoute>} />

            {/* ── Admin ── */}
            <Route path="/adm-dashboard"       element={<PrivateRoute roles={['admin']}><Layout><AdmDashboard /></Layout></PrivateRoute>} />
            <Route path="/user-mgmt"           element={<PrivateRoute roles={['admin']}><Layout><UserMgmt /></Layout></PrivateRoute>} />
            <Route path="/leave-policy"        element={<PrivateRoute roles={['admin']}><Layout><LeavePolicy /></Layout></PrivateRoute>} />
            <Route path="/adm-analytics"       element={<PrivateRoute roles={['admin']}><Layout><AdmAnalytics /></Layout></PrivateRoute>} />
            <Route path="/adm-leave-approvals" element={<PrivateRoute roles={['admin']}><Layout><AdmLeaveApprovals /></Layout></PrivateRoute>} />

            {/* ── Shared ── */}
            <Route path="/calendar"       element={<PrivateRoute><Layout><CalendarPage /></Layout></PrivateRoute>} />
            <Route path="/events"         element={<PrivateRoute><Layout><EventsPage /></Layout></PrivateRoute>} />
            <Route path="/holidays"       element={<PrivateRoute><Layout><HolidaysPage /></Layout></PrivateRoute>} />
            <Route path="/notifications"  element={<PrivateRoute><Layout><NotificationsPage /></Layout></PrivateRoute>} />
            <Route path="/carry-forward"  element={<PrivateRoute><Layout><CarryForwardPage /></Layout></PrivateRoute>} />
            <Route path="/profile"        element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
