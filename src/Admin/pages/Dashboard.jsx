import React, { useEffect, useState } from 'react';
import { fetchStats } from '../api';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


const Dashboard = () => {
  const [stats, setStats] = useState({
    counts: { users: 0, downloads: 0, views: 0, universities: 0, categories: 0 },
    monthly: [],
  });
  const [loading, setLoading] = useState(true);
  const [topPage, setTopPage] = useState(1);

  const OVERVIEW_PAGE_SIZE = 7;

  // Normalized datasets for charts
  const safeTop = (stats.top || []).map(b => ({
    title: b.title || 'Untitled',
    downloads: Number(b.downloads_count || b.downloads || b.Downloads || 0),
    views: Number(b.views_count || b.views || b.Views || 0),
  })).filter(b => !isNaN(b.downloads));
  // Time-series data for line chart (uploads/views/downloads if available)
  const _extractNumber = (obj, ...keys) => {
    for (const k of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k)) {
        const v = Number(obj[k]);
        if (!Number.isNaN(v)) return v;
      }
    }
    return 0;
  };

  // robust download extractor (supports many common variants)
  const extractDownloads = (m) =>
    _extractNumber(
      m,
      'downloads',
      'Downloads',
      'download_count',
      'downloadCount',
      'total_downloads',
      'totalDownloads',
      'dls',
    );

  const extractUploads = (m) =>
    _extractNumber(m, 'uploads', 'Uploads', 'upload_count', 'uploadCount', 'total_uploads', 'totalUploads');

  const extractViews = (m) =>
    _extractNumber(m, 'views', 'Views', 'view_count', 'viewCount', 'total_views', 'totalViews');

  const months = (stats.monthly || []).map(m => ({
    raw: m,
    month: m.month || m.label || 'Unknown',
    uploads: extractUploads(m),
    views: extractViews(m),
    downloads: extractDownloads(m),
  }));

  // If monthly download values are all zero but we have a total downloads counter,
  // distribute total downloads across months proportionally to uploads (or evenly).
  const totalDownloadsAvailable = (months.some(m => m.downloads > 0));
  const overallDownloads = Number(stats.counts?.downloads || 0);

  let timeSeries = months.map(m => ({ month: m.month, uploads: m.uploads, views: m.views, downloads: m.downloads }));

  if (!totalDownloadsAvailable && overallDownloads > 0 && timeSeries.length > 0) {
    const totalUploads = timeSeries.reduce((s, r) => s + (r.uploads || 0), 0);
    if (totalUploads > 0) {
      // distribute proportionally by uploads
      timeSeries = timeSeries.map(r => ({
        ...r,
        downloads: Math.round(((r.uploads || 0) / totalUploads) * overallDownloads),
      }));
      // adjust rounding errors to match overallDownloads exactly
      const assigned = timeSeries.reduce((s, r) => s + (r.downloads || 0), 0);
      let diff = overallDownloads - assigned;
      for (let i = 0; diff !== 0 && i < timeSeries.length; i += 1) {
        timeSeries[i].downloads = (timeSeries[i].downloads || 0) + (diff > 0 ? 1 : -1);
        diff += (diff > 0 ? -1 : 1);
      }
    } else {
      // distribute evenly
      const base = Math.floor(overallDownloads / timeSeries.length);
      let remainder = overallDownloads - base * timeSeries.length;
      timeSeries = timeSeries.map((r) => {
        const add = remainder > 0 ? 1 : 0;
        remainder -= add;
        return { ...r, downloads: base + add };
      });
    }
  }

  // Ensure numeric values and remove NaN entries
  timeSeries = timeSeries.map(d => ({
    month: d.month || 'Unknown',
    uploads: Number(d.uploads || 0),
    views: Number(d.views || 0),
    downloads: Number(d.downloads || 0),
  })).filter(d => !Number.isNaN((d.uploads || 0) + (d.views || 0) + (d.downloads || 0)));

  const calcTrend = (series, key) => {
    if (!series || series.length < 2) return null;
    const values = series.map(d => Number(d[key] || 0));
    const current = values[values.length - 1];
    const prev = values[values.length - 2];
    if (!prev) return null;
    return ((current - prev) / prev) * 100;
  };

  const formatTrend = (value) => {
    if (value === null || Number.isNaN(value)) return '-';
    const rounded = value.toFixed(1);
    const sign = value > 0 ? '+' : '';
    return `${sign}${rounded}%`;
  };

  const downloadsTrend = calcTrend(timeSeries, 'downloads');

  // Only show non-zero rows in tables and sort highest first
  const nonZeroTop = safeTop
    .filter(b => b.downloads > 0)
    .sort((a, b) => b.downloads - a.downloads);

  const pagedTop = nonZeroTop.slice((topPage - 1) * OVERVIEW_PAGE_SIZE, topPage * OVERVIEW_PAGE_SIZE);
  const topTotalPages = Math.max(1, Math.ceil(nonZeroTop.length / OVERVIEW_PAGE_SIZE));

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchStats();
        console.log('[Dashboard] fetchStats returned:', data);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <Box sx={{ padding: 0.5 }}>
      <Grid container spacing={0.5}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" sx={{ color: '#e9edef', mb: 0.25, fontSize: '1.1rem' }}>
            Overview
          </Typography>
          <Typography variant="body2" sx={{ color: '#8696a0', fontSize: '0.75rem' }}>
            High-level summary of users, universities and reading activity.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Grid container spacing={0.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }}>
              <Card sx={{ background: '#111b21', borderRadius: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, padding: 0.75 }}>
                  <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.65rem' }}>Total Users</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.1 }}>
                    <Typography variant="h5" sx={{ color: '#e9edef', fontSize: '1.1rem' }}>{stats.counts.users}</Typography>
                    <Box sx={{ fontSize: 10, px: 0.5, py: 0.15, borderRadius: 999, bgcolor: 'rgba(52,183,241,0.1)', color: '#34B7F1' }}>
                      —
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8696a0', mt: 0.1, fontSize: '0.6rem' }}>
                    Registered readers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }}>
              <Card sx={{ background: '#111b21', borderRadius: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, padding: 0.75 }}>
                  <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.65rem' }}>Universities</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.1 }}>
                    <Typography variant="h5" sx={{ color: '#e9edef', fontSize: '1.1rem' }}>{stats.counts.universities}</Typography>
                    <Box sx={{ fontSize: 10, px: 0.5, py: 0.15, borderRadius: 999, bgcolor: 'rgba(255,204,0,0.1)', color: '#FFCC00' }}>
                      —
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8696a0', mt: 0.1, fontSize: '0.6rem' }}>
                    Partner institutions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }}>
              <Card sx={{ background: '#111b21', borderRadius: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, padding: 0.75 }}>
                  <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.65rem' }}>Total Categories</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.1 }}>
                    <Typography variant="h5" sx={{ color: '#e9edef', fontSize: '1.1rem' }}>{stats.counts.categories}</Typography>
                    <Box sx={{ fontSize: 10, px: 0.5, py: 0.15, borderRadius: 999, bgcolor: 'rgba(123,31,162,0.1)', color: '#bb86fc' }}>
                      —
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }}>
              <Card sx={{ background: '#111b21', borderRadius: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, padding: 0.75 }}>
                  <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.65rem' }}>Total Downloads</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.1 }}>
                    <Typography variant="h5" sx={{ color: '#e9edef', fontSize: '1.1rem' }}>{stats.counts.downloads}</Typography>
                    <Box sx={{ fontSize: 10, px: 0.5, py: 0.15, borderRadius: 999, bgcolor: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                      {formatTrend(downloadsTrend)}
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8696a0', mt: 0.1, fontSize: '0.6rem' }}>
                    Total offline attempts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Sharing Features Section */}


        {/* Activity Trend Section - Past Papers */}
        <Grid size={{ xs: 12 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ background: '#111b21', borderRadius: 1, mt: 0, minHeight: 380 }}>
              <CardContent sx={{ padding: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: '#e9edef', mb: 0.3, fontSize: '0.85rem' }}>Activity Trend</Typography>
                  <Divider sx={{ borderColor: '#202c33', mb: 0.5 }} />
                  <Box sx={{ width: '100%', height: 280 }}>
                    {timeSeries && timeSeries.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeSeries} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#202c33" />
                          <XAxis dataKey="month" stroke="#8696a0" tick={{ fontSize: 9 }} tickMargin={4} />
                          <YAxis stroke="#8696a0" tick={{ fontSize: 9 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2c33',
                              border: '1px solid #2a3942',
                              borderRadius: 4,
                              color: '#e9edef',
                              fontSize: '11px',
                            }}
                            labelStyle={{ color: '#cfd8dc' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="uploads" name="Uploads" stroke="#00a884" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="views" name="Views" stroke="#34B7F1" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="downloads" name="Downloads" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ color: '#8696a0', textAlign: 'center', pt: 4 }}>
                        No data available
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ background: '#111b21', borderRadius: 1, minHeight: 380 }}>
                <CardContent sx={{ padding: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: '#e9edef', mb: 0.3, fontSize: '0.85rem' }}>Top Universities</Typography>
                  <Divider sx={{ borderColor: '#202c33', mb: 0.5 }} />
                  <Box sx={{ overflowX: 'auto', maxHeight: 320, overflowY: 'auto' }}>
                    <table className="table overview-table">
                      <thead>
                        <tr>
                          <th>University</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedTop.map((p, i) => {
                          const totalCount = stats.counts.universities || 0;
                          const ratio = totalCount > 0 ? Math.min(1, (p.downloads || 0) / totalCount) : 0;
                          const percent = Math.round(ratio * 100);
                          return (
                            <tr key={i}>
                              <td>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <span>{p.title}</span>
                                  <Box sx={{ background: '#202c33', borderRadius: 999, overflow: 'hidden', height: 6 }}>
                                    <Box sx={{ width: `${percent}%`, height: '100%', bgcolor: '#8b5cf6' }} />
                                  </Box>
                                </Box>
                              </td>
                              <td>{p.downloads || 0}</td>
                            </tr>
                          );
                        })}
                        {nonZeroTop.length === 0 && (
                          <tr><td colSpan={2} style={{ color: '#8696a0' }}>No university data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </Box>
                  {nonZeroTop.length > OVERVIEW_PAGE_SIZE && (
                    <Box className="actions" sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                      <button
                        className="btn"
                        disabled={topPage <= 1}
                        onClick={() => setTopPage(p => Math.max(1, p - 1))}
                      >
                        Prev
                      </button>
                      <span style={{ color: '#cfd8dc', fontSize: 12 }}>
                        Page {topPage} of {topTotalPages}
                      </span>
                      <button
                        className="btn"
                        disabled={topPage >= topTotalPages}
                        onClick={() => setTopPage(p => Math.min(topTotalPages, p + 1))}
                      >
                        Next
                      </button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
    </Box>
  );
};

export default Dashboard;