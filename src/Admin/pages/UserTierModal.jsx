import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { fetchUserSearchHistoryAdmin } from '../api';

const UserTierModal = ({ user, onClose }) => {
  const [tierMetrics, setTierMetrics] = useState(null);
  const [tierMetricsLoading, setTierMetricsLoading] = useState(false);
  const [tierMetricsError, setTierMetricsError] = useState(null);

  useEffect(() => {
    loadTierMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const loadTierMetrics = async () => {
    setTierMetrics(null);
    setTierMetricsError(null);
    setTierMetricsLoading(true);

    try {
      const userId = user.id;
      const now = new Date();
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const cutoffIso = cutoff.toISOString();

      const [
        viewsRes,
        downloadsRes,
        likesRes,
        commentsRes,
        uploadsPastPapersRes,
        uploadsUniversitiesRes,
        sessionsRes,
        streakRes,
        subsRes,
        searchEvents,
      ] = await Promise.all([
        Promise.resolve({ count: 0 }),
        Promise.resolve({ count: 0 }),
        Promise.resolve({ count: 0 }),
        Promise.resolve({ count: 0 }),
        supabase
          .from('past_papers')
          .select('id', { count: 'exact', head: true })
          .eq('uploaded_by', userId)
          .gte('created_at', cutoffIso),
        supabase
          .from('universities')
          .select('id', { count: 'exact', head: true })
          .eq('uploaded_by', userId)
          .gte('created_at', cutoffIso),
        supabase
          .from('reading_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('started_at', cutoffIso),
        supabase
          .from('reading_streaks')
          .select('current_streak')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', userId),
        fetchUserSearchHistoryAdmin(userId, { days: 30 }),
      ]);

      const safeCount = (res) => (res && typeof res.count === 'number' ? res.count : 0);

      const viewsCount = safeCount(viewsRes);
      const downloadsCount = safeCount(downloadsRes);
      const likesCount = safeCount(likesRes);
      const commentsCount = safeCount(commentsRes);
      const uploadsPastPapersCount = safeCount(uploadsPastPapersRes);
      const uploadsUniversitiesCount = safeCount(uploadsUniversitiesRes);
      const sessionsCount = safeCount(sessionsRes);

      const streakDays = streakRes && !streakRes.error && streakRes.data
        ? streakRes.data.current_streak || 0
        : 0;

      const subsData = subsRes && !subsRes.error && Array.isArray(subsRes.data)
        ? subsRes.data
        : [];
      const activeSubscriptions = subsData.filter((s) => s.status === 'active').length;

      const searchesCount = Array.isArray(searchEvents) ? searchEvents.length : 0;

      const metrics = [
        { key: 'views', label: 'Reads / views', count: viewsCount, pointsPerUnit: 1 },
        { key: 'downloads', label: 'Downloads', count: downloadsCount, pointsPerUnit: 3 },
        { key: 'likes', label: 'Likes', count: likesCount, pointsPerUnit: 2 },
        { key: 'comments', label: 'Comments', count: commentsCount, pointsPerUnit: 3 },
        { key: 'uploads_past_papers', label: 'Past papers uploaded (approved)', count: uploadsPastPapersCount, pointsPerUnit: 5 },
        { key: 'uploads_universities', label: 'Universities created', count: uploadsUniversitiesCount, pointsPerUnit: 8 },
        { key: 'searches', label: 'Searches', count: searchesCount, pointsPerUnit: 0.5 },
        { key: 'sessions', label: 'Reading sessions', count: sessionsCount, pointsPerUnit: 1 },
        { key: 'streak_days', label: 'Reading streak (days)', count: streakDays, pointsPerUnit: 1 },
        { key: 'subscriptions', label: 'Active subscriptions', count: activeSubscriptions, pointsPerUnit: 20 },
      ].map((m) => ({
        ...m,
        totalPoints: m.count * m.pointsPerUnit,
      }));

      const totalPoints = metrics.reduce((sum, m) => sum + m.totalPoints, 0);

      let tierFromPoints = null;
      if (totalPoints >= 400) tierFromPoints = 'legend';
      else if (totalPoints >= 250) tierFromPoints = 'power_reader';
      else if (totalPoints >= 150) tierFromPoints = 'active_reader';
      else if (totalPoints >= 60) tierFromPoints = 'community_star';
      else if (totalPoints > 0) tierFromPoints = 'new_reader';

      setTierMetrics({ metrics, totalPoints, tierFromPoints });
    } catch (e) {
      console.error('Failed to load tier metrics', e);
      setTierMetricsError('Failed to load tier details');
    } finally {
      setTierMetricsLoading(false);
    }
  };

  const formatTierName = (tier) => {
    if (!tier) return 'Not ranked';
    return tier
      .replace('new_reader', 'New Reader')
      .replace('active_reader', 'Active Reader')
      .replace('power_reader', 'Power Reader')
      .replace('community_star', 'Community Star')
      .replace('legend', 'Legend');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#111b21',
          borderRadius: 16,
          maxWidth: 520,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid #202c33',
          boxShadow: '0 18px 45px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #202c33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: '#8696a0' }}>Tier breakdown</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#e9edef' }}>
              {formatTierName(user.rankTier)}
            </div>
          </div>
          <button
            className="btn"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div
            style={{
              background: '#0b141a',
              borderRadius: 12,
              padding: 12,
              border: '1px solid #202c33',
              fontSize: 13,
              color: '#cfd8dc',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Activity points (last 30 days)</div>
            {tierMetricsLoading && (
              <div style={{ color: '#8696a0' }}>Loading tier details...</div>
            )}
            {tierMetricsError && !tierMetricsLoading && (
              <div style={{ color: '#f15e6c' }}>{tierMetricsError}</div>
            )}
            {tierMetrics && !tierMetricsLoading && !tierMetricsError && (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th style={{ textAlign: 'right' }}>Count</th>
                      <th style={{ textAlign: 'right' }}>Points / unit</th>
                      <th style={{ textAlign: 'right' }}>Total points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierMetrics.metrics.map((m) => (
                      <tr key={m.key}>
                        <td>{m.label}</td>
                        <td style={{ textAlign: 'right' }}>{m.count}</td>
                        <td style={{ textAlign: 'right' }}>{m.pointsPerUnit}</td>
                        <td style={{ textAlign: 'right' }}>{m.totalPoints.toFixed(1)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{tierMetrics.totalPoints.toFixed(1)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <div>
                    Computed tier from points:{' '}
                    <strong>
                      {formatTierName(tierMetrics.tierFromPoints)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTierModal;