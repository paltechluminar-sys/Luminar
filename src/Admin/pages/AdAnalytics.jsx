import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

import './AdAnalytics.css';

export default function AdAnalytics() {
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch all ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        console.log('📊 [Analytics] Fetching all ads...');
        const response = await axios.get(`${API_URL}/api/admin/analytics/all`);
        console.log('✅ [Analytics] Ads fetched:', response.data.data);
        setAds(response.data.data || []);
        if (response.data.data && response.data.data.length > 0) {
          setSelectedAd(response.data.data[0]);
        } else {
          console.warn('⚠️ [Analytics] No ads found');
        }
      } catch (err) {
        console.error('❌ [Analytics] Failed to fetch ads:', err);
        setError('Failed to load ads');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Fetch analytics for selected ad
  useEffect(() => {
    if (selectedAd) {
      fetchAnalytics(selectedAd.id);
      fetchEngagement(selectedAd.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAd?.id]);

  const fetchAnalytics = async (adId) => {
    try {
      console.log('📈 [Analytics] Fetching detailed metrics for ad:', adId);
      const response = await axios.get(`${API_URL}/api/admin/analytics/${adId}`);
      console.log('✅ [Analytics] Metrics received:', response.data.data);
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('❌ [Analytics] Failed to fetch analytics:', err);
    }
  };

  const fetchEngagement = async (adId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/analytics/${adId}/engagement`,
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        }
      );
      setEngagement(response.data.data);
    } catch (err) {
      console.error('Failed to fetch engagement:', err);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const refreshEngagement = () => {
    if (selectedAd) {
      fetchEngagement(selectedAd.id);
    }
  };

  if (loading) {
    return <div className="analytics-container"><p>Loading analytics...</p></div>;
  }

  const metrics = analytics?.metrics || {};
  const deviceBreakdown = metrics.deviceBreakdown || {};

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Ad Analytics & Performance Dashboard</h1>
        <p>Real-time tracking of impressions, clicks, and engagement metrics</p>
      </div>

      {error && <div className="analytics-error">{error}</div>}

      {/* Ads List as Enhanced Table */}
      <div className="ads-analytics-table-wrapper">
        <h2>All Advertisements Performance</h2>
        <div className="ads-analytics-table">
          <div className="table-header">
            <div className="col-title">Ad Title</div>
            <div className="col-placement">Placement</div>
            <div className="col-status">Status</div>
            <div className="col-impressions">Impressions</div>
            <div className="col-clicks">Clicks</div>
            <div className="col-dismisses">Dismisses</div>
            <div className="col-ctr">CTR %</div>
            <div className="col-engagement">Engagement %</div>
            <div className="col-action">Action</div>
          </div>
          <div className="table-body">
            {ads.map(ad => (
              <div 
                key={ad.id} 
                className={`table-row ${selectedAd?.id === ad.id ? 'active' : ''}`}
                onClick={() => setSelectedAd(ad)}
              >
                <div className="col-title">{ad.title}</div>
                <div className="col-placement">
                  <span className="placement-badge">{ad.placement}</span>
                </div>
                <div className="col-status">
                  <span className={`status-badge ${ad.is_active ? 'active' : 'inactive'}`}>
                    {ad.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                <div className="col-impressions">{ad.total_impressions || 0}</div>
                <div className="col-clicks">{ad.total_clicks || 0}</div>
                <div className="col-dismisses">{ad.total_dismisses || 0}</div>
                <div className="col-ctr">{ad.ctr || 0}%</div>
                <div className="col-engagement">
                  {ad.total_impressions > 0 
                    ? (((ad.total_clicks + ad.total_dismisses) / ad.total_impressions) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="col-action">
                  <button className="view-details-btn">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedAd && (
        <>
          {/* Selected Ad Details Panel */}
          <div className="selected-ad-details">
            <h2>📈 Detailed Analytics: {selectedAd.title}</h2>
            
            {/* Key Metrics in Compact Layout */}
            <div className="details-metrics-grid">
              <div className="detail-metric">
                <span className="label">Total Impressions</span>
                <span className="value">{selectedAd.total_impressions || 0}</span>
              </div>
              <div className="detail-metric">
                <span className="label">Total Clicks</span>
                <span className="value highlight-blue">{selectedAd.total_clicks || 0}</span>
              </div>
              <div className="detail-metric">
                <span className="label">Total Dismisses</span>
                <span className="value highlight-red">{selectedAd.total_dismisses || 0}</span>
              </div>
              <div className="detail-metric">
                <span className="label">Click-Through Rate</span>
                <span className="value highlight-green">{selectedAd.ctr || 0}%</span>
              </div>
              <div className="detail-metric">
                <span className="label">Engagement Rate</span>
                <span className="value highlight-purple">
                  {selectedAd.total_impressions > 0 
                    ? (((selectedAd.total_clicks + selectedAd.total_dismisses) / selectedAd.total_impressions) * 100).toFixed(2)
                    : 0}%
                </span>
              </div>
              <div className="detail-metric">
                <span className="label">Completion Rate</span>
                <span className="value highlight-yellow">
                  {selectedAd.total_impressions > 0
                    ? (((selectedAd.total_impressions - selectedAd.total_dismisses) / selectedAd.total_impressions) * 100).toFixed(2)
                    : 0}%
                </span>
              </div>
            </div>

            {/* Ad Information Table */}
            <div className="ad-info-table">
              <div className="info-row">
                <span className="info-label">Ad Title:</span>
                <span className="info-value">{selectedAd.title}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Placement:</span>
                <span className="info-value placement-badge">{selectedAd.placement}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className={`info-value status-badge ${selectedAd.is_active ? 'active' : 'inactive'}`}>
                  {selectedAd.is_active ? '● Active' : '○ Inactive'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Dismiss Rate:</span>
                <span className="info-value">{selectedAd.dismissRate || 0}%</span>
              </div>
              <div className="info-row">
                <span className="info-label">Avg View Duration:</span>
                <span className="info-value">{metrics.avgViewDuration || 0}s</span>
              </div>
            </div>

            {/* Device Breakdown Table */}
            <div className="device-breakdown-table">
              <h3>Device Breakdown</h3>
              <div className="device-table">
                <div className="device-header">
                  <div className="device-col">Device</div>
                  <div className="device-col">Count</div>
                  <div className="device-col">Percentage</div>
                  <div className="device-col">Visual</div>
                </div>
                {(() => {
                  const total = (deviceBreakdown.mobile || 0) + (deviceBreakdown.tablet || 0) + (deviceBreakdown.desktop || 0);
                  return (
                    <>
                      <div className="device-row">
                        <div className="device-col device-name">📱 Mobile</div>
                        <div className="device-col">{deviceBreakdown.mobile || 0}</div>
                        <div className="device-col">{total > 0 ? ((deviceBreakdown.mobile / total) * 100).toFixed(1) : 0}%</div>
                        <div className="device-col device-bar">
                          <div className="bar mobile" style={{width: total > 0 ? ((deviceBreakdown.mobile / total) * 100) : 0 + '%'}}></div>
                        </div>
                      </div>
                      <div className="device-row">
                        <div className="device-col device-name">📱 Tablet</div>
                        <div className="device-col">{deviceBreakdown.tablet || 0}</div>
                        <div className="device-col">{total > 0 ? ((deviceBreakdown.tablet / total) * 100).toFixed(1) : 0}%</div>
                        <div className="device-col device-bar">
                          <div className="bar tablet" style={{width: total > 0 ? ((deviceBreakdown.tablet / total) * 100) : 0 + '%'}}></div>
                        </div>
                      </div>
                      <div className="device-row">
                        <div className="device-col device-name">🖥️ Desktop</div>
                        <div className="device-col">{deviceBreakdown.desktop || 0}</div>
                        <div className="device-col">{total > 0 ? ((deviceBreakdown.desktop / total) * 100).toFixed(1) : 0}%</div>
                        <div className="device-col device-bar">
                          <div className="bar desktop" style={{width: total > 0 ? ((deviceBreakdown.desktop / total) * 100) : 0 + '%'}}></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="date-range-selector">
            <div className="date-group">
              <label>Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              />
            </div>
            <div className="date-group">
              <label>End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              />
            </div>
            <button className="btn-refresh" onClick={refreshEngagement}>
              Refresh Data
            </button>
          </div>

          {/* Engagement Timeline */}
          <div className="engagement-section">
            <h2>Daily Engagement</h2>
            {engagement && Object.keys(engagement).length > 0 ? (
              <div className="engagement-table">
                <div className="engagement-header">
                  <div className="col date">Date</div>
                  <div className="col impressions">Impressions</div>
                  <div className="col clicks">Clicks</div>
                  <div className="col dismisses">Dismisses</div>
                  <div className="col avgTime">Avg Time</div>
                </div>
                {Object.entries(engagement).map(([date, data]) => (
                  <div key={date} className="engagement-row">
                    <div className="col date">{date}</div>
                    <div className="col impressions">{data.impressions || 0}</div>
                    <div className="col clicks">{data.clicks || 0}</div>
                    <div className="col dismisses">{data.dismisses || 0}</div>
                    <div className="col avgTime">
                      {data.totalViewTime > 0 
                        ? (data.totalViewTime / Math.max(data.impressions, 1)).toFixed(1) 
                        : 0}s
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No engagement data for selected date range</p>
            )}
          </div>

          {/* Performance Summary */}
          <div className="performance-summary">
            <h2>Performance Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <h4>Status</h4>
                <p className="summary-value">{selectedAd.is_active ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="summary-item">
                <h4>Placement</h4>
                <p className="summary-value">{selectedAd.placement}</p>
              </div>
              <div className="summary-item">
                <h4>Engagement Rate</h4>
                <p className="summary-value">
                  {selectedAd.total_impressions > 0 
                    ? (((selectedAd.total_clicks + selectedAd.total_dismisses) / selectedAd.total_impressions) * 100).toFixed(2)
                    : 0}%
                </p>
              </div>
              <div className="summary-item">
                <h4>Completion Rate</h4>
                <p className="summary-value">
                  {selectedAd.total_impressions > 0
                    ? (((selectedAd.total_impressions - selectedAd.total_dismisses) / selectedAd.total_impressions) * 100).toFixed(2)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
