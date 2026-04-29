import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfiles, fetchUploadCountsByUser, updateUserRole, fetchUserRankingsAdmin, suspendUser } from '../api';
import { FiSearch } from 'react-icons/fi';
import UsersAnalytics from './UsersAnalytics';
import UserTierModal from './UserTierModal';

const Users = ({ isSuperAdmin }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [suspensionFilter, setSuspensionFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest_login'); // 'ranking' or 'latest_login'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' or 'desc'
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedUserTier, setSelectedUserTier] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const navigate = useNavigate();

  const SUPERADMIN_EMAILS = ['campuslives254@gmail.com', 'paltechsomalux@gmail.com'];

  const load = async () => {
    setLoading(true);
    try {
      let profiles = [];
      let rankings = [];
      let uploadCounts = [];

      try {
        profiles = await fetchProfiles();
        console.log('[Users.load] fetchProfiles success:', profiles?.length || 0);
      } catch (e) {
        console.error('[Users.load] fetchProfiles error:', e?.message || e);
      }

      try {
        rankings = await fetchUserRankingsAdmin();
        console.log('[Users.load] fetchUserRankingsAdmin success:', rankings?.length || 0);
      } catch (e) {
        console.error('[Users.load] fetchUserRankingsAdmin error:', e?.message || e);
      }

      try {
        uploadCounts = await fetchUploadCountsByUser();
        console.log('[Users.load] fetchUploadCountsByUser success:', uploadCounts?.length || 0);
      } catch (e) {
        console.error('[Users.load] fetchUploadCountsByUser error:', e?.message || e);
      }

      console.groupCollapsed('[Users.load] fetched data');
      console.log('profiles (count):', Array.isArray(profiles) ? profiles.length : profiles, profiles?.slice?.(0, 3));
      console.log('rankings (count):', Array.isArray(rankings) ? rankings.length : rankings, rankings?.slice?.(0, 5));
      console.log('uploadCounts (count):', Array.isArray(uploadCounts) ? uploadCounts.length : uploadCounts, uploadCounts?.slice?.(0, 10));
      console.groupEnd();

      const uploadsMap = new Map(
        (uploadCounts || []).map((u) => [String(u.uploaded_by), {
          universities: u.universities || 0,
          total: typeof u.total === 'number' ? u.total : (u.universities || 0),
        }])
      );

      const rankingsMap = new Map();
      (rankings || []).forEach((r) => {
        const possibleKeys = [
          r.user_id,
          r.user?.id,
          r.profile_id,
          r.profiles?.id,
          r.profiles?.profile_id,
          r.email,
          r.user_email,
        ];
        possibleKeys.forEach((k) => {
          if (k !== undefined && k !== null) rankingsMap.set(String(k), r);
        });
      });

      const computeFallbackRanking = (profile) => {
        const contrib = uploadsMap.get(String(profile.id)) || { total: 0 };
        const uploads = contrib.total || 0;
        const createdAt = profile.created_at ? new Date(profile.created_at) : null;
        const lastActiveAt = profile.last_active_at ? new Date(profile.last_active_at) : createdAt;
        let recencyScore = 0;
        if (lastActiveAt) {
          const days = (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
          if (days <= 7) recencyScore = 50;
          else if (days <= 30) recencyScore = 20;
          else if (days <= 90) recencyScore = 5;
        }
        const score = uploads * 10 + recencyScore;
        let tier = null;
        if (score >= 200) tier = 'legend';
        else if (score >= 100) tier = 'power_reader';
        else if (score >= 50) tier = 'active_reader';
        else if (score >= 10) tier = 'community_star';
        else if (score > 0) tier = 'new_reader';
        return { score, tier, fallback: true };
      };

      try {
        const keys = Array.from(rankingsMap.keys()).slice(0, 50);
        console.groupCollapsed('[Users.load] rankingsMap (sample keys)');
        console.log('keys sample:', keys);
        keys.slice(0,10).forEach((k) => {
          console.log(`rankingsMap[${k}] =`, rankingsMap.get(k));
        });
        console.groupEnd();
      } catch (e) {
        console.warn('Failed to log rankingsMap sample', e);
      }

      const normalizeRanking = (r) => {
        if (!r) return null;
        const pickNumber = (...keys) => {
          for (const k of keys) {
            if (r && Object.prototype.hasOwnProperty.call(r, k)) {
              const n = Number(r[k]);
              if (!Number.isNaN(n)) return n;
            }
          }
          return null;
        };
        const score = pickNumber(
          'score',
          'score_30',
          'score_30_days',
          'score30',
          'score_last_30',
          'last_30_score',
          'value'
        );
        const tier = r.tier ?? r.rank_tier ?? r.level ?? r.category ?? null;
        const position = pickNumber('rank_position', 'position', 'rank', 'rankPos');
        const subscription = !!(r.subscription_bonus_applied ?? r.has_subscription_boost ?? r.subscription_boost ?? r.subscriber_bonus);
        return { raw: r, score, tier, position, subscription };
      };

      // Helper function to compute user status and last seen
      const computeUserStatus = (profile) => {
        const now = Date.now();
        const lastActiveTime = profile.last_active_at 
          ? new Date(profile.last_active_at).getTime()
          : new Date(profile.created_at).getTime();
        const minutesAgo = (now - lastActiveTime) / (1000 * 60);
        
        // Determine status: online if active in last 5 minutes
        const isOnline = minutesAgo <= 5;
        const status = profile.deactivated_at ? 'signed_out' : (isOnline ? 'online' : 'offline');

        // Format last seen - show "Online" if online, otherwise show time
        let lastSeen = null;
        if (isOnline) {
          lastSeen = 'Online';
        } else if (profile.last_active_at || profile.created_at) {
          if (minutesAgo < 1) {
            lastSeen = 'now';
          } else if (minutesAgo < 60) {
            lastSeen = `${Math.round(minutesAgo)}m ago`;
          } else if (minutesAgo < 1440) {
            lastSeen = `${Math.round(minutesAgo / 60)}h ago`;
          } else {
            lastSeen = `${Math.round(minutesAgo / 1440)}d ago`;
          }
        } else {
          lastSeen = 'never';
        }

        return { status, lastSeen };
      };

      const enriched = (profiles || []).map((p) => {
        const byId = rankingsMap.get(String(p.id));
        const byEmail = p.email ? rankingsMap.get(String(p.email)) : null;
        const r = byId || byEmail || null;
        const norm = normalizeRanking(r);

        let finalScore = null;
        let finalTier = null;
        let usedFallback = false;
        if (norm && typeof norm.score === 'number') {
          finalScore = norm.score;
          finalTier = norm.tier || null;
        } else {
          const fb = computeFallbackRanking(p);
          if (fb && typeof fb.score === 'number') {
            finalScore = fb.score;
            finalTier = fb.tier;
            usedFallback = true;
          }
        }

        if (!norm && !usedFallback) {
          console.warn('[Users.load] no ranking and no fallback for profile', { id: p.id, email: p.email });
        } else if (usedFallback) {
          console.info('[Users.load] applied fallback ranking for', { id: p.id, email: p.email, score: finalScore, tier: finalTier });
        } else {
          console.debug('[Users.load] ranking matched for', { id: p.id, email: p.email, normalized: norm });
        }

        const contrib = uploadsMap.get(String(p.id)) || { total: 0, universities: 0 };
        const userStatus = computeUserStatus(p);

        return {
          ...p,
          uploadCount: contrib.total || 0,
          contribUniversities: contrib.universities || 0,
          ranking: norm ? norm.raw : null,
          rankTier: finalTier || null,
          rankScore: typeof finalScore === 'number' ? finalScore : null,
          rankPosition: typeof norm?.position === 'number' ? norm.position : null,
          hasSubscriptionBoost: !!norm?.subscription,
          status: userStatus.status,
          lastSeen: userStatus.lastSeen,
        };
      });

      enriched.sort((a, b) => {
        const scoreA = typeof a.rankScore === 'number' ? a.rankScore : -1;
        const scoreB = typeof b.rankScore === 'number' ? b.rankScore : -1;
        if (scoreA !== scoreB) return scoreB - scoreA;
        const roleOrder = { admin: 0, editor: 1, viewer: 2 };
        const ra = roleOrder[a.role] ?? 3;
        const rb = roleOrder[b.role] ?? 3;
        if (ra !== rb) return ra - rb;
        const nameA = (a.full_name || a.display_name || a.email || '').toLowerCase();
        const nameB = (b.full_name || b.display_name || b.email || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setRows(enriched);
    } catch (error) {
      console.error('[Users.load] Error loading users:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      console.log('[Users.changeRole] Updating role for user:', id, 'to:', role);
      await updateUserRole(id, role);
      console.log('[Users.changeRole] Role updated successfully');
      await load();
    } catch (error) {
      console.error('[Users.changeRole] Error updating role:', error?.message || error);
      alert(`Failed to update role: ${error?.message || 'Unknown error'}`);
    } finally { 
      setSaving((s) => ({ ...s, [id]: false })); 
    }
  };

  const handleSuspendClick = (user) => {
    setSuspendingUser(user);
    setSuspendReason('');
    setShowSuspendDialog(true);
  };

  const confirmSuspend = async () => {
    if (!suspendingUser) return;
    
    setSaving((s) => ({ ...s, [suspendingUser.id]: true }));
    try {
      const isSuspended = !suspendingUser.is_suspended;
      console.log('[Users.confirmSuspend] Suspending user:', suspendingUser.id, 'suspended:', isSuspended);
      await suspendUser(suspendingUser.id, isSuspended, suspendReason);
      console.log('[Users.confirmSuspend] User suspension updated successfully');
      setShowSuspendDialog(false);
      setSuspendingUser(null);
      setSuspendReason('');
      await load();
    } catch (error) {
      console.error('[Users.confirmSuspend] Error updating suspension:', error?.message || error);
      alert(`Failed to suspend user: ${error?.message || 'Unknown error'}`);
    } finally { 
      setSaving((s) => ({ ...s, [suspendingUser?.id]: false })); 
    }
  };

  const filteredRows = useMemo(() => {
    let filtered = rows.filter(u => {
      const matchSearch = !search || 
        (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
        (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase())) ||
        (u.display_name && u.display_name.toLowerCase().includes(search.toLowerCase()));
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchActive = !activeFilter || u.status === activeFilter;
      const matchSuspension = !suspensionFilter || 
        (suspensionFilter === 'suspended' && u.is_suspended) ||
        (suspensionFilter === 'active' && !u.is_suspended);

      return matchSearch && matchRole && matchActive && matchSuspension;
    });

    // Apply sorting
    if (sortBy === 'latest_login') {
      filtered.sort((a, b) => {
        const dateA = a.last_active_at ? new Date(a.last_active_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
        const dateB = b.last_active_at ? new Date(b.last_active_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
        const diff = dateB - dateA;
        if (diff !== 0) return sortDir === 'desc' ? diff : -diff;
        // Tiebreaker: sort by name
        const nameA = (a.full_name || a.display_name || a.email || '').toLowerCase();
        const nameB = (b.full_name || b.display_name || b.email || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else {
      // Default ranking sort
      filtered.sort((a, b) => {
        const scoreA = typeof a.rankScore === 'number' ? a.rankScore : -1;
        const scoreB = typeof b.rankScore === 'number' ? b.rankScore : -1;
        let diff = scoreB - scoreA;
        if (diff !== 0) return sortDir === 'desc' ? diff : -diff;
        const roleOrder = { admin: 0, editor: 1, viewer: 2 };
        const ra = roleOrder[a.role] ?? 3;
        const rb = roleOrder[b.role] ?? 3;
        if (ra !== rb) return ra - rb;
        const nameA = (a.full_name || a.display_name || a.email || '').toLowerCase();
        const nameB = (b.full_name || b.display_name || b.email || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    return filtered;
  }, [rows, search, roleFilter, activeFilter, suspensionFilter, sortBy, sortDir]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredRows.slice(start, end);
  }, [filteredRows, page, pageSize]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredRows.length / pageSize)), [filteredRows.length, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, activeFilter, suspensionFilter, sortBy, sortDir]);

  const handleTierClick = (user) => {
    if (!user || !user.id) return;
    setSelectedUserTier(user);
    setShowTierModal(true);
  };

  const isSuperadminEmail = (email) => {
    return SUPERADMIN_EMAILS.includes(email);
  };

  return (
    <div className="panel">
      <div className="panel-title">Users</div>
      
      <UsersAnalytics rows={rows} />
      
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 250px', minWidth: '200px', maxWidth: '270px' }}>
          <FiSearch style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#8696a0', fontSize: '14px' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 32, width: '100%', backgroundColor: 'black', color: 'white', fontSize: '13px' }}
          />
        </div>
        <select
          className="select"
          value={roleFilter ? `role:${roleFilter}` : activeFilter ? `active:${activeFilter}` : suspensionFilter ? `suspension:${suspensionFilter}` : `sort:${sortBy}:${sortDir}`}
          onChange={(e) => {
            const value = e.target.value;
            if (value.startsWith('role:')) {
              setRoleFilter(value.substring(5));
              setActiveFilter('');
              setSuspensionFilter('');
              setSortBy('ranking');
              setSortDir('desc');
            } else if (value.startsWith('active:')) {
              setActiveFilter(value.substring(7));
              setRoleFilter('');
              setSuspensionFilter('');
              setSortBy('ranking');
              setSortDir('desc');
            } else if (value.startsWith('suspension:')) {
              setSuspensionFilter(value.substring(11));
              setRoleFilter('');
              setActiveFilter('');
              setSortBy('ranking');
              setSortDir('desc');
            } else if (value.startsWith('sort:')) {
              const parts = value.substring(5).split(':');
              setSortBy(parts[0]);
              setSortDir(parts[1]);
              setRoleFilter('');
              setActiveFilter('');
              setSuspensionFilter('');
            }
          }}
          style={{ minWidth: 200, width: 'auto' }}
        >
          <option value="role:">All Roles</option>
          <option value="role:admin">Admin</option>
          <option value="role:editor">Editor</option>
          <option value="role:viewer">Viewer</option>
          <option value="active:">All Status</option>
          <option value="active:online">Online</option>
          <option value="active:offline">Offline</option>
          <option value="active:signed_out">Signed Out</option>
          <option value="suspension:suspended">Suspended</option>
          <option value="sort:ranking:desc">Ranking (High to Low)</option>
          <option value="sort:ranking:asc">Ranking (Low to High)</option>
          <option value="sort:latest_login:desc">Login (Newest)</option>
          <option value="sort:latest_login:asc">Login (Oldest)</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Email</th>
            <th>Last Seen</th>
            <th>Role</th>
            <th>Scores</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} style={{ color: '#8696a0', textAlign: 'center' }}>Loading...</td></tr>
          ) : paginatedRows.length === 0 ? (
            <tr><td colSpan={7} style={{ color: '#8696a0', textAlign: 'center' }}>No users found</td></tr>
          ) : paginatedRows.map((u, idx) => {
            const rankPos = (page - 1) * pageSize + idx + 1;
            return (
            <tr key={u.id}>
              <td style={{ fontSize: '13px', fontWeight: '600', color: '#00a884' }}>
                #{rankPos}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="viewer-avatar">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.full_name || u.display_name || u.email || 'User avatar'}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.parentElement) {
                            const initials = (u.full_name || u.display_name || u.email || '?').charAt(0).toUpperCase();
                            e.target.parentElement.textContent = initials;
                          }
                        }}
                      />
                    ) : (
                      (u.full_name || u.display_name || u.email || '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{u.full_name || u.display_name || '—'}</span>
                </div>
              </td>
              <td>{u.email}</td>
              <td>
                <span style={{
                  fontSize: '12px',
                  fontWeight: u.lastSeen === 'Online' ? '600' : '500',
                  color: u.lastSeen === 'Online' ? '#00a884' : '#8696a0'
                }}>
                  {u.lastSeen || 'never'}
                </span>
              </td>
              <td>
                {isSuperadminEmail(u.email) ? (
                  <span style={{ color: '#ffd700', fontWeight: 600 }}>
                    Superadmin
                  </span>
                ) : (
                  <select
                    className="select"
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={!isSuperAdmin || !!saving[u.id]}
                    title={
                      !isSuperAdmin
                        ? 'Only the superadmin can change roles'
                        : undefined
                    }
                  >
                    <option value="viewer">viewer</option>
                    <option value="editor">editor</option>
                    <option value="admin">admin</option>
                  </select>
                )}
              </td>
              <td>
                {u.rankScore !== null ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        u.rankScore >= 200
                          ? 'linear-gradient(135deg, #ffd700, #ff6f00)'
                          : u.rankScore >= 100
                          ? '#102a43'
                          : u.rankScore >= 50
                          ? '#0b3a2e'
                          : '#111b21',
                      color: u.rankScore >= 200 ? '#111' : '#e9edef',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleTierClick(u)}
                  >
                    <span>
                      {Math.round(u.rankScore)}
                    </span>
                    {u.hasSubscriptionBoost && (
                      <span
                        title="Includes subscriber activity bonus"
                        style={{
                          fontSize: 9,
                          padding: '1px 4px',
                          borderRadius: 8,
                          background: 'rgba(0,0,0,0.3)',
                        }}
                      >
                        sub
                      </span>
                    )}
                  </span>
                ) : (
                  <span style={{ color: '#8696a0', fontSize: 11 }}>Not ranked yet</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="btn"
                    onClick={() => navigate(`users/${u.id}`)}
                    style={{ padding: '4px 8px', fontSize: '12px', whiteSpace: 'nowrap', width: 'auto', minWidth: 'auto', maxWidth: 'max-content' }}
                  >
                    Details
                  </button>
                  {isSuperAdmin && (
                    <button
                      className="btn"
                      onClick={() => handleSuspendClick(u)}
                      disabled={!!saving[u.id]}
                      title={u.is_suspended ? 'Unsuspend user' : 'Suspend user for misuse'}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        width: 'auto',
                        minWidth: 'auto',
                        maxWidth: 'max-content',
                      }}
                    >
                      {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  )}
                  {(() => {
                    const hasUploads = (u.uploadCount || 0) > 0;
                    const elevated = u.role === 'admin' || u.role === 'editor';
                    if (!elevated && !hasUploads) return null;
                    return (
                      <button
                        className="btn"
                        onClick={() => navigate(`users/${u.id}?tab=uploads`)}
                        style={{ padding: '4px 8px', fontSize: '12px', whiteSpace: 'nowrap', width: 'auto', minWidth: 'auto', maxWidth: 'max-content' }}
                      >
                        View uploads
                      </button>
                    );
                  })()}
                </div>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
      </div>
      
      {filteredRows.length > 0 && (
        <div className="actions" style={{ marginTop: 10, justifyContent: 'space-between' }}>
          <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
          <span style={{ color: '#cfd8dc' }}>Page {page} of {totalPages} ({filteredRows.length} users)</span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      )}

      {showTierModal && selectedUserTier && (
        <UserTierModal
          user={selectedUserTier}
          onClose={() => setShowTierModal(false)}
        />
      )}

      {showSuspendDialog && suspendingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: '#202c33',
            borderRadius: 8,
            padding: 20,
            maxWidth: 400,
            width: '90%',
            border: '1px solid #405d75',
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#e9edef' }}>
              {suspendingUser.is_suspended ? 'Unsuspend User' : 'Suspend User'}
            </h3>
            <p style={{ margin: '0 0 12px 0', color: '#8696a0', fontSize: 14 }}>
              {suspendingUser.is_suspended 
                ? `Re-enable ${suspendingUser.email}?` 
                : `Are you sure you want to suspend ${suspendingUser.email}?`}
            </p>
            
            {!suspendingUser.is_suspended && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#8696a0', fontSize: 13, display: 'block', marginBottom: 6 }}>
                  Reason for suspension (optional):
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g., Violates terms of service, Malicious behavior, etc."
                  className="input"
                  style={{
                    width: '100%',
                    minHeight: 80,
                    resize: 'vertical',
                    padding: 10,
                    boxSizing: 'border-box',
                    fontSize: 13,
                  }}
                />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn"
                onClick={() => {
                  setShowSuspendDialog(false);
                  setSuspendingUser(null);
                  setSuspendReason('');
                }}
                style={{ minWidth: 80 }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={confirmSuspend}
                disabled={!!saving[suspendingUser?.id]}
                style={{
                  minWidth: 80,
                  backgroundColor: suspendingUser.is_suspended ? '#2a5f2a' : '#5f2a2a',
                  borderColor: suspendingUser.is_suspended ? '#00a884' : '#ff6b6b',
                }}
              >
                {suspendingUser.is_suspended ? 'Unsuspend' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;