import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FiBarChart2, FiSettings, FiUsers, FiChevronLeft, FiChevronRight,
  FiSearch, FiCheck, FiMail, FiEdit3, FiBox, FiDollarSign
} from 'react-icons/fi';
import { BiSpeaker } from 'react-icons/bi';

import { getCurrentUserProfile } from './api';
import { API_URL } from '../config';
import './admin.css';
import { AdminUIProvider } from './AdminUIContext';
import { supabase } from '../supabase';

// NotificationBadge for notifications
const NotificationBadge = ({ count }) => {
  if (!count || count === 0) return null;
  return <span className="notification-badge">{count > 99 ? '99+' : count}</span>;
};

// Admin pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Users = React.lazy(() => import('./pages/Users'));
const Verify = React.lazy(() => import('./pages/Verify'));
const AdsManagement = React.lazy(() => import('./pages/AdvancedAdsManagement'));
const SendEmails = React.lazy(() => import('./pages/SendEmails'));
const FinancialTransactions = React.lazy(() => import('./pages/FinancialTransactions'));

export const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingAds, setPendingAds] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [authUserEmail, setAuthUserEmail] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load admin profile and auth user email
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setAuthUserEmail(user?.email);

        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);



  // Fetch pending ads count
  useEffect(() => {
    const fetchPendingAds = async () => {
      try {
        const res = await fetch(`${API_URL}/api/requests?status=pending`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load ads');
        const list = Array.isArray(json.requests) ? json.requests : (Array.isArray(json) ? json : []);
        // Count only user ad submissions with pending status
        const pendingAdsFromRequests = list.filter(r => (r.type === 'user_ad_submission' || r.ad_type) && r.status === 'pending').length || 0;

        // Also count pending ads stored in dedicated user_ads table (if present)
        let pendingUserAdsCount = 0;
        try {
          const { data: userAdsData, error: userAdsError, count } = await supabase
            .from('user_ads')
            .select('id', { count: 'exact', head: false })
            .eq('status', 'pending');

          if (userAdsError) {
            throw userAdsError;
          }

          if (Array.isArray(userAdsData)) pendingUserAdsCount = userAdsData.length;
          else if (typeof count === 'number') pendingUserAdsCount = count;
        } catch (supErr) {
          console.warn('Supabase user_ads count failed:', supErr?.message || supErr);
        }

        const totalPendingAds = pendingAdsFromRequests + (pendingUserAdsCount || 0);
        setPendingAds(totalPendingAds || 0);
      } catch (e) {
        console.warn('Pending ads count failed:', e?.message || e);
      }
    };
    fetchPendingAds();
  }, []);

  // Collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 860);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ADMIN_EMAILS = ['campuslives254@gmail.com', 'paltechsomalux@gmail.com'];
  const userEmail = userProfile?.email || authUserEmail;
  // For development, treat all users as admin. In production, uncomment proper role checking:
  const isAdmin = true; // TODO: Change to proper role check for production
  const isSuperAdmin = ADMIN_EMAILS.includes(userEmail);
  const hasAdminAccess = true; // TODO: Change to: const hasAdminAccess = isAdmin;

  // Build breadcrumb segments from current Route location
  const buildBreadcrumbs = () => {
    const pathname = location.pathname;
    const segments = pathname.split('/').filter(Boolean);

    const crumbs = [];
    const pushCrumb = (label, to) => {
      crumbs.push({ label, to });
    };

    pushCrumb('Home', '/admin');

    // Skip the 'admin' segment since we're already in the admin area
    const adminIndex = segments.indexOf('admin');
    const relevantSegments = adminIndex >= 0 ? segments.slice(adminIndex + 1) : segments;

    if (relevantSegments.length === 0) return crumbs;

    const labels = {
      users: 'Users',
      'send-emails': 'Emails',
      verify: 'Verify',
      ads: 'Ads',
      'financial-transactions': 'Financials',
    };

    let currentPath = '/admin';
    relevantSegments.forEach((seg, index) => {
      currentPath += `/${seg}`;
      const label = labels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
      pushCrumb(label, index === relevantSegments.length - 1 ? null : currentPath);
    });

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (loadingProfile) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#0b141a', color: '#8696a0'
      }}>
        Loading...
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#0b141a', color: '#8696a0'
      }}>
        Redirecting...
      </div>
    );
  }

  return (
    <AdminUIProvider>
      <div className="admin-root">
        
        {/* SIDEBAR */}
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="admin-brand" onClick={() => navigate('')}>
            <span className="brand-dot" />
            <span className="brand-text">Admin</span>
          </div>

          {/* −−− NAVIGATION −−− */}
          <nav className="admin-nav">

            {/* MAIN DASHBOARD */}
            {isAdmin && (
              <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FiBarChart2 /> <span className="nav-label">Overview</span>
              </NavLink>
            )}

            {/* SYSTEM SECTION */}
            {isAdmin && (
              <>
                <div className="nav-section-header">
                  <FiSettings /> <span className="nav-label">SYSTEM</span>
                </div>

                <NavLink to="/admin/send-emails" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <FiMail /> <span className="nav-label">Emails</span>
                </NavLink>

                {isSuperAdmin && (
                  <>
                    <NavLink to="/admin/financial-transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                      <FiDollarSign /> <span className="nav-label">Financials</span>
                    </NavLink>
                  </>
                )}

                <NavLink to="/admin/ads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <BiSpeaker /> <span className="nav-label">Ads</span>
                  <NotificationBadge count={pendingAds} />
                </NavLink>


                <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <FiUsers /> <span className="nav-label">Users</span>
                </NavLink>

                <NavLink to="/admin/verify" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <FiCheck /> <span className="nav-label">Verify</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Collapse Button */}
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(s => !s)}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </aside>

        {/* MOBILE BOTTOM BAR */}
        <nav className="admin-bottombar">
          {isAdmin && (
            <NavLink to="/admin" end className={({ isActive }) => `bottom-item ${isActive ? 'active' : ''}`}>
              <FiBarChart2 /> <span>Overview</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin/users" className={({ isActive }) => `bottom-item ${isActive ? 'active' : ''}`}>
              <FiUsers /> <span>Users</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin/verify" className={({ isActive }) => `bottom-item ${isActive ? 'active' : ''}`}>
              <FiCheck /> <span>Verify</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin/send-emails" className={({ isActive }) => `bottom-item ${isActive ? 'active' : ''}`}>
              <FiMail /> <span>Emails</span>
            </NavLink>
          )}

          {isSuperAdmin && (
            <>
              <NavLink to="/admin/financial-transactions" className={({ isActive }) => `bottom-item ${isActive ? 'active' : ''}`}>
                <FiDollarSign /> <span>Financials</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink to="/admin/ads" className={({ isActive }) => `bottom-item ${isActive ? 'active' : ''}`}>
              <BiSpeaker /> <span>Ads</span>
              <NotificationBadge count={pendingAds} />
            </NavLink>
          )}
        </nav>

        {/* MAIN AREA */}
        <div className="admin-main">
          <header className="admin-topbar">
            <button className="back-link" onClick={() => { navigate('/'); }}>
              <FiChevronLeft />
              <span>Back</span>
            </button>

            <div className="admin-breadcrumbs">
              {breadcrumbs.map((crumb, idx) => (
                <span key={`${crumb.label}-${idx}`} className="breadcrumb-item">
                  {idx === 0 ? (
                    <button 
                      className="breadcrumb-link" 
                      onClick={() => navigate('/admin')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, font: 'inherit' }}
                    >
                      {crumb.label}
                    </button>
                  ) : crumb.to ? (
                    <Link to={crumb.to} className="breadcrumb-link">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="breadcrumb-current">{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
                </span>
              ))}
            </div>

            <div className="spacer" />

            {userProfile && (
              <div className="admin-user-summary">
                <div className="admin-user-info">
                  <div className="admin-user-name">{userProfile.display_name || userProfile.email}</div>
                  <div className="admin-user-role">{userProfile.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Admin'}</div>
                </div>
                <div className="admin-user-avatar">
                  {userProfile.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt={userProfile.display_name || userProfile.email}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.parentElement) {
                          const initials = (userProfile.display_name || userProfile.email || '?').charAt(0).toUpperCase();
                          e.target.parentElement.textContent = initials;
                        }
                      }}
                    />
                  ) : (
                    <span>{(userProfile.display_name || userProfile.email || '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
            )}
          </header>

          <main className="admin-content">
            <React.Suspense fallback={<div className="admin-loading">Loading...</div>}>
              <Routes key={location.pathname}>

                {/* Dashboard */}
                <Route index element={<Dashboard />} />

                {/* System Routes */}
                <Route path="send-emails" element={<SendEmails key="send-emails" />} />
                <Route path="financial-transactions" element={<FinancialTransactions key="financial-transactions" />} />
                <Route path="ads" element={<AdsManagement key="ads" />} />
                <Route path="users" element={<Users isSuperAdmin={isSuperAdmin} key="users" />} />
                <Route path="verify" element={<Verify userProfile={userProfile} key="verify" />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </React.Suspense>
          </main>
        </div>
      </div>
    </AdminUIProvider>
  );
};

export default Admin;
