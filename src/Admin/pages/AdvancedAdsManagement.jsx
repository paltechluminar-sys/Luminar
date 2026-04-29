import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { FiTrash2, FiEdit2, FiPlus, FiVideo, FiImage, FiCheck, FiX } from 'react-icons/fi';
import { supabase } from '../../supabase';
import './AdvancedAdsManagement.css';

export default function AdvancedAdsManagement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('ads');
  const [, setAdType] = useState('image');
  const [uploading, setUploading] = useState(false);
  
  // Creators state
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmissionDetail, setShowSubmissionDetail] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaToView, setMediaToView] = useState(null);
  const [mediaTypeToView, setMediaTypeToView] = useState(null);
  
  // Analytics state
  const [selectedAnalyticsAd, setSelectedAnalyticsAd] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [, setAnalyticsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState({
    // Basic info
    title: '',
    adType: 'image',
    placement: 'homepage',
    
    // Image ad
    imageUrl: '',
    
    // Video ad
    videoUrl: '',
    videoDuration: 0,
    videoThumbnailUrl: '',
    
    // Common
    clickUrl: '',
    ctaText: 'Learn More',
    ctaButtonColor: '#00a884',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    countdownSeconds: 10,
    isSkippable: true,
    
    // Advanced
    budget: '',
    dailyBudget: '',
    costPerClick: 0.5,
    minAge: 0,
    maxAge: 100,
    targetGender: 'all',
    targetDevices: ['mobile', 'tablet', 'desktop'],
    frequencyCap: 0,
    conversionTracking: false,
    conversionUrl: '',
    status: 'draft',
    priority: 0,
    abTestGroup: 'control',
  });

  const adsListRef = useRef(null);

  // Responsive helper for mobile rendering
  // Use smaller breakpoint so desktop table remains visible and scrollable on mobile
  const MOBILE_BREAKPOINT = 420;
  const [isNarrow, setIsNarrow] = useState(typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false);
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Fetch all ads
  const fetchAds = async () => {
    try {
      setLoading(true);
      console.log('🔄 [FETCH_ADS] Fetching ads from backend...');
      // Include actor email so backend can enforce super-admin visibility
      const { data: { session } } = await supabase.auth.getSession();
      const actorEmail = session?.user?.email;
      const response = await axios.get(`${API_URL}/api/admin/ads/all`, {
        headers: actorEmail ? { 'x-actor-email': actorEmail } : {}
      });
      console.log('✅ [FETCH_ADS] Response:', response.data);
      // Expect structured response: { ads, user_submissions, request_submissions }
      const payload = response.data?.data || {};
      setAds(payload.ads || []);
      setError(null);
      setSuccess(null);
    } catch (err) {
      console.error('❌ [FETCH_ADS] Error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load ads. Make sure backend is running.';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };


  // Analytics functions
  const fetchAnalytics = async (adId) => {
    try {
      setAnalyticsLoading(true);
      console.log('📈 [Analytics] Fetching detailed metrics for ad:', adId);
      const response = await axios.get(`${API_URL}/api/admin/analytics/${adId}`);
      console.log('✅ [Analytics] Metrics received:', response.data.data);
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('❌ [Analytics] Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
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
    if (selectedAnalyticsAd) {
      fetchEngagement(selectedAnalyticsAd.id);
    }
  };

  // Fetch user ad submissions
  const fetchUserSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      console.log('📥 [USER_SUBMISSIONS] Fetching all user submitted ads...');
      // Use backend admin endpoint (service role) to fetch user submissions
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const actorEmail = session?.user?.email;
        console.log('📥 [USER_SUBMISSIONS] Actor email:', actorEmail);
        
        const resp = await axios.get(`${API_URL}/api/admin/ads/all`, {
          headers: actorEmail ? { 'x-actor-email': actorEmail } : {}
        });
        console.log('📥 [USER_SUBMISSIONS] Backend response data:', resp.data?.data);
        
        const payload = resp.data?.data || {};
        const userAdsFromBackend = payload.user_submissions || [];
        const requestSubsFromBackend = payload.request_submissions || [];
        const merged = [...userAdsFromBackend, ...requestSubsFromBackend];
        
        console.log('📥 [USER_SUBMISSIONS] Backend data breakdown:', {
          userAdsFromBackend: userAdsFromBackend.length,
          requestSubsFromBackend: requestSubsFromBackend.length,
          merged: merged.length
        });
        
        if (merged.length > 0) {
          console.log('✅ [USER_SUBMISSIONS] Fetched submissions via backend:', merged.length);
          setUserSubmissions(merged);
          setSubmissionsLoading(false);
          return;
        } else {
          console.log('⚠️ [USER_SUBMISSIONS] Backend returned 0 submissions, will try fallback');
        }
      } catch (e) {
        console.warn('⚠️ [USER_SUBMISSIONS] Backend fetch failed, falling back to client-side requests:', e?.message || e);
      }

      // If backend returned none, fall back to checking client-side user requests
      // (this preserves existing behavior for systems where user_ads doesn't exist)
      
      // Fetch from user_ads table - all records regardless of status
      let { data: userAdsData, error: userAdsError } = await supabase
        .from('user_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (userAdsError) throw userAdsError;

      if (userAdsData && userAdsData.length > 0) {
        console.log('✅ [USER_SUBMISSIONS] Found user ads:', userAdsData);
        setUserSubmissions(userAdsData);
      } else {
        console.log('📭 No user ads found');
        setUserSubmissions([]);
        
        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        // Filter and transform requests that are ad submissions
        const adSubmissions = (requestsData || [])
          .filter(item => {
            // Check if it's an ad submission
            if (item.type === 'user_ad_submission') return true;
            if (item.ad_type) return true;
            if (item.metadata && typeof item.metadata === 'object') {
              return item.metadata.adType || item.metadata.ad_type || item.metadata.title;
            }
            return false;
          })
          .map(item => {
            // Extract data from metadata if present
            let meta = item.metadata || {};
            
            // Handle both JSON string and object
            if (typeof meta === 'string') {
              try {
                meta = JSON.parse(meta);
              } catch (e) {
                meta = {};
              }
            }

            // Extract user information from multiple possible sources
            const userName = item.user_name || 
                            item.userName || 
                            meta.user_name || 
                            meta.userName ||
                            item.title?.split('\n')[0]?.substring(0, 50) ||
                            'Unknown User';

            const userEmail = item.user_email || 
                             item.userEmail || 
                             item.email ||
                             meta.user_email || 
                             meta.userEmail || 
                             'N/A';

            const userId = item.user_id || item.userId || meta.user_id;

            console.log('📊 [TRANSFORM] Extracted user info:', { userName, userEmail, userId });

            const transformed = {
              id: item.id,
              title: item.title || meta.title || meta.adTitle || 'Untitled',
              description: item.description || meta.description || '',
              user_name: userName,
              user_email: userEmail,
              user_id: userId,
              ad_type: item.ad_type || meta.adType || meta.ad_type || 'image',
              image_url: item.image_url || meta.imageUrl || meta.image_url || '',
              video_url: item.video_url || meta.videoUrl || meta.video_url || '',
              placement: item.placement || meta.placement || 'homepage',
              status: item.status || 'pending',
              created_at: item.created_at,
              raw_metadata: meta,
              ...item
            };

            console.log('📊 [TRANSFORM] Item after transform:', { id: transformed.id, title: transformed.title, user: transformed.user_name, email: transformed.user_email });
            return transformed;
          });

        // Fetch profiles for accurate display names on requests
        const userIds = [...new Set(adSubmissions.map(ad => ad.user_id).filter(Boolean))];
        let profiles = {};
        
        console.log('📋 [PROFILES] User IDs to fetch:', userIds);
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, full_name, email')
            .in('id', userIds);
          
          console.log('📋 [PROFILES] Fetched profiles for requests:', profilesData);
          
          if (profilesData) {
            profilesData.forEach(profile => {
              profiles[profile.id] = profile;
              console.log(`📋 [PROFILES] Mapped profile ${profile.id}:`, { display_name: profile.display_name, full_name: profile.full_name });
            });
          }
        }
        
        // Enrich ads with accurate profile data
        const enrichedAds = adSubmissions.map(ad => {
          const profileName = profiles[ad.user_id]?.display_name || profiles[ad.user_id]?.full_name;
          const finalName = profileName || ad.user_name || 'Unknown User';
          
          console.log(`📋 [ENRICH] Ad ${ad.id}: user_id=${ad.user_id}, profile_found=${!!profiles[ad.user_id]}, name=${finalName}`);
          
          return {
            ...ad,
            user_name: finalName
          };
        });

        console.log('✅ [USER_SUBMISSIONS] Enriched ads from requests:', enrichedAds);
        setUserSubmissions(enrichedAds);
      }
    } catch (err) {
      console.error('❌ [USER_SUBMISSIONS] Error:', err);
      const errorMsg = err.message || 'Failed to load user submissions';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
      setUserSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Log whenever userSubmissions changes
  useEffect(() => {
    console.log('📥 [USER_SUBMISSIONS] Count updated:', userSubmissions.length, 'items:', userSubmissions);
  }, [userSubmissions]);

  // Approve user ad submission via secure backend endpoint
  const approveUserAd = async (submissionId) => {
    try {
      console.log('✅ [APPROVAL] Approving submission:', submissionId);
      
      // Get current user's auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call backend endpoint with auth token (backend uses service_role key for full access)
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ads/approve/${submissionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );

      if (response.data.success) {
        const approvedRow = response.data.data;
        
        setSuccess(`✅ Ad "${approvedRow.title}" approved successfully!`);
        setTimeout(() => setSuccess(null), 4000);
        
        // Refresh both submissions list and ads list to show updated data
        fetchUserSubmissions();
        fetchAds();
      } else {
        throw new Error(response.data.error || 'Failed to approve ad');
      }
    } catch (err) {
      console.error('❌ [APPROVAL] Error:', err && (err.message || JSON.stringify(err)));
      const errorMsg = err && (err.message || JSON.stringify(err)) ? String(err.message || JSON.stringify(err)) : 'Failed to approve ad';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Reject user ad submission via secure backend endpoint
  const rejectUserAd = async (submissionId) => {
    try {
      console.log('❌ [REJECTION] Rejecting submission:', submissionId);
      
      // Get current user's auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call backend endpoint with auth token (backend uses service_role key for full access)
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ads/reject/${submissionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('✅ Ad submission rejected successfully!');
        setTimeout(() => setSuccess(null), 4000);
        fetchUserSubmissions();
      } else {
        throw new Error(response.data.error || 'Failed to reject ad');
      }
    } catch (err) {
      console.error('❌ [REJECTION] Error:', err && (err.message || JSON.stringify(err)));
      const msg = err && (err.message || JSON.stringify(err)) ? String(err.message || JSON.stringify(err)) : 'Failed to reject ad';
      setError(msg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Delete user ad submission
  const deleteUserAd = async (submissionId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this ad? This action cannot be undone.');
      if (!confirmed) return;

      console.log('🗑️ [DELETE] Deleting submission:', submissionId);
      
      // Get current user's auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Delete from user_ads table directly using Supabase client with service role
      const { error: deleteError } = await supabase
        .from('user_ads')
        .delete()
        .eq('id', submissionId);

      if (deleteError) {
        throw deleteError;
      }

      setSuccess('✅ User submission deleted successfully!');
      setTimeout(() => setSuccess(null), 4000);
      fetchUserSubmissions();
    } catch (err) {
      console.error('🗑️ [DELETE] Error:', err && (err.message || JSON.stringify(err)));
      const msg = err && (err.message || JSON.stringify(err)) ? String(err.message || JSON.stringify(err)) : 'Failed to delete ad';
      setError(msg);
      setTimeout(() => setError(null), 5000);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchUserSubmissions();
  }, []);

  // Fetch analytics when selected ad changes
  useEffect(() => {
    if (selectedAnalyticsAd) {
      fetchAnalytics(selectedAnalyticsAd.id);
      fetchEngagement(selectedAnalyticsAd.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnalyticsAd]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  // Handle device selection
  const handleDeviceChange = (device) => {
    setFormData(prev => ({
      ...prev,
      targetDevices: prev.targetDevices.includes(device)
        ? prev.targetDevices.filter(d => d !== device)
        : [...prev.targetDevices, device]
    }));
  };

  // Handle file upload
  const handleFileUpload = async (e, fileType = 'image') => {
    const file = e.target.files[0];
    console.log('📤 [UPLOAD] File selected:', { fileType, fileName: file?.name, fileSize: file?.size });
    if (!file) {
      console.warn('⚠️ [UPLOAD] No file selected');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64Data = event.target.result.split(',')[1];
        console.log('📸 [UPLOAD] Base64 ready, size:', base64Data.length);
        
        try {
          const mimeType = fileType === 'video' ? 'video/mp4' : file.type;
          console.log('🚀 [UPLOAD] Sending to backend:', { fileType, mimeType });
          const response = await axios.post(`http://localhost:5000/api/upload/${fileType}`, {
            fileName: file.name,
            fileData: base64Data,
            mimeType: mimeType
          });

          console.log('✅ [UPLOAD] Response:', response.data);
          console.log('✅ [UPLOAD] Response keys:', Object.keys(response.data));
          console.log('✅ [UPLOAD] filePath value:', response.data.filePath);

          if (response.data.success) {
            if (fileType === 'video') {
              setFormData(prev => ({
                ...prev,
                videoUrl: response.data.filePath || response.data.imagePath,
                videoDuration: response.data.duration || 0
              }));
              console.log('✅ [UPLOAD] Video URL set:', response.data.filePath || response.data.imagePath);
            } else if (fileType === 'thumbnail') {
              setFormData(prev => ({
                ...prev,
                videoThumbnailUrl: response.data.filePath || response.data.imagePath
              }));
              console.log('✅ [UPLOAD] Thumbnail URL set:', response.data.filePath || response.data.imagePath);
            } else {
              setFormData(prev => ({
                ...prev,
                imageUrl: response.data.filePath || response.data.imagePath
              }));
              console.log('✅ [UPLOAD] Image URL set:', response.data.filePath || response.data.imagePath);
            }
            setSuccess(`✅ ${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`);
            setTimeout(() => setSuccess(null), 3500);
          } else {
            console.error('❌ [UPLOAD] Response not successful:', response.data);
          }
        } catch (err) {
          console.error('❌ [UPLOAD] Error:', err);
          console.error('❌ [UPLOAD] Response:', err.response?.data);
          const uploadError = err.response?.data?.error || `Failed to upload ${fileType}`;
          setError(uploadError);
          setTimeout(() => setError(null), 5000);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('❌ [FILE_READ] Error:', err);
      setError('❌ Failed to read file');
      setTimeout(() => setError(null), 5000);
      setUploading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title) {
      setError('❌ Please enter ad title');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (formData.adType === 'image' && !formData.imageUrl) {
      setError('❌ Please upload an image');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (formData.adType === 'video' && !formData.videoUrl) {
      setError('❌ Please upload a video');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        adType: formData.adType,
        imageUrl: formData.imageUrl || null,
        videoUrl: formData.videoUrl || null,
        videoDuration: parseInt(formData.videoDuration) || 0,
        videoThumbnailUrl: formData.videoThumbnailUrl || null,
        clickUrl: formData.clickUrl || null,
        ctaText: formData.ctaText,
        ctaButtonColor: formData.ctaButtonColor,
        placement: formData.placement,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        countdownSeconds: parseInt(formData.countdownSeconds) || 10,
        isSkippable: formData.isSkippable,
        budget: parseFloat(formData.budget) || 0,
        dailyBudget: parseFloat(formData.dailyBudget) || 0,
        costPerClick: parseFloat(formData.costPerClick) || 0.5,
        minAge: parseInt(formData.minAge) || 0,
        maxAge: parseInt(formData.maxAge) || 100,
        targetGender: formData.targetGender,
        targetDevices: JSON.stringify(formData.targetDevices),
        frequencyCap: parseInt(formData.frequencyCap) || 0,
        conversionTracking: formData.conversionTracking,
        conversionUrl: formData.conversionUrl || null,
        status: formData.status,
        priority: parseInt(formData.priority) || 0,
        abTestGroup: formData.abTestGroup,
      };

      console.log('📤 [SAVE_AD] FULL Payload:', JSON.stringify(payload, null, 2));
      console.log('📤 [SAVE_AD] FormData state:', formData);
      console.log('📤 [SAVE_AD] FormData.placement:', formData.placement);

      if (editingId) {
        // Get session token for authorization
        const { data: { session } } = await supabase.auth.getSession();
        const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
        
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/ads/${editingId}`,
          payload,
          { headers }
        );
        setAds(ads.map(ad => ad.id === editingId ? response.data.data : ad));
        setSuccess(`✅ Ad "${formData.title}" updated successfully!`);
      } else {
        console.log('📤 [SAVE_AD] POSTing to backend...');
        
        // Get session token for authorization
        const { data: { session } } = await supabase.auth.getSession();
        const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/ads`,
          payload,
          { headers }
        );
        console.log('✅ [SAVE_AD] Response:', response.data);
        setAds([...ads, response.data.data]);
        setSuccess(`✅ Ad "${formData.title}" created successfully!`);
      }

      resetForm();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      console.error('❌ [SAVE_AD] Error:', err.message);
      console.error('❌ [SAVE_AD] Error response:', JSON.stringify(err.response?.data, null, 2));
      console.error('❌ [SAVE_AD] Status:', err.response?.status);
      console.error('❌ [SAVE_AD] Full error:', JSON.stringify(err, null, 2));
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save ad';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/ads/${id}`);
      setAds(ads.filter(ad => ad.id !== id));
      setSuccess('✅ Ad deleted successfully!');
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to delete ad:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete ad';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle edit
  const handleEdit = (ad) => {
    setAdType(ad.ad_type || 'image');
    setFormData({
      title: ad.title,
      adType: ad.ad_type || 'image',
      imageUrl: ad.image_url || '',
      videoUrl: ad.video_url || '',
      videoDuration: ad.video_duration || 0,
      videoThumbnailUrl: ad.video_thumbnail_url || '',
      clickUrl: ad.click_url || '',
      ctaText: ad.cta_text || 'Learn More',
      ctaButtonColor: ad.cta_button_color || '#00a884',
      placement: ad.placement,
      startDate: ad.start_date ? ad.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: ad.end_date ? ad.end_date.split('T')[0] : '',
      countdownSeconds: ad.countdown_seconds || 10,
      isSkippable: ad.is_skippable !== undefined ? ad.is_skippable : true,
      budget: ad.budget || '',
      dailyBudget: ad.daily_budget || '',
      costPerClick: ad.cost_per_click || 0.5,
      minAge: ad.min_age || 0,
      maxAge: ad.max_age || 100,
      targetGender: ad.target_gender || 'all',
      targetDevices: ad.target_devices ? JSON.parse(ad.target_devices) : ['mobile', 'tablet', 'desktop'],
      frequencyCap: ad.frequency_cap || 0,
      conversionTracking: ad.conversion_tracking || false,
      conversionUrl: ad.conversion_url || '',
      status: ad.status || 'draft',
      priority: ad.priority || 0,
      abTestGroup: ad.ab_test_group || 'control',
    });
    setEditingId(ad.id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      adType: 'image',
      placement: 'homepage',
      imageUrl: '',
      videoUrl: '',
      videoDuration: 0,
      videoThumbnailUrl: '',
      clickUrl: '',
      ctaText: 'Learn More',
      ctaButtonColor: '#00a884',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      countdownSeconds: 10,
      isSkippable: true,
      budget: '',
      dailyBudget: '',
      costPerClick: 0.5,
      minAge: 0,
      maxAge: 100,
      targetGender: 'all',
      targetDevices: ['mobile', 'tablet', 'desktop'],
      frequencyCap: 0,
      conversionTracking: false,
      conversionUrl: '',
      status: 'draft',
      priority: 0,
      abTestGroup: 'control',
    });
    setAdType('image');
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="ads-management">
        <div className="ads-loading">Loading ads...</div>
      </div>
    );
  }

  return (
    <div className="ads-management advanced">
      {/* Enhanced Header with Stats */}
      <div className="ads-header-enhanced">
        <div className="header-main">
          <div className="header-title-section">
            <h1>Ad Management</h1>
            <p>Create, edit, and manage advertisements with video support</p>
          </div>
          
          {/* Quick Stats */}
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Total Ads</span>
              <span className="stat-value">{ads?.length || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active</span>
              <span className="stat-value">{ads && ads.length > 0 ? ads.filter(a => (a?.status === 'active' || a?.is_active === true)).length : 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Views</span>
              <span className="stat-value">{ads && ads.length > 0 ? ads.reduce((sum, a) => sum + (a?.total_impressions || 0), 0).toLocaleString() : 0}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="ads-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="ads-success">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="ads-tabs-container">
        <div className="ads-tabs">
          <button 
            className={`tab ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ads'); setShowForm(false); }}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-text">Ads</span>
            <span className="tab-count">{ads.length}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="tab-icon">📈</span>
            <span className="tab-text">Analytics</span>
            <span className="tab-count">{selectedAnalyticsAd ? '1' : '-'}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            <span className="tab-icon">👥</span>
            <span className="tab-text">Creators</span>
            {userSubmissions.length > 0 ? (
              <span className="tab-count tab-count-alert">{userSubmissions.length}</span>
            ) : (
              <span className="tab-count">0</span>
            )}
          </button>
        </div>
      </div>

      {/* Create Ad Button - Left Aligned Below Tabs */}
      {!showForm && activeTab === 'ads' && (
        <div className="header-actions">
          <button className="btn-create-ad" onClick={() => setShowForm(true)}>
            <FiPlus size={18} />
            <span>Create Ad</span>
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && activeTab === 'ads' && (
        <div className="ads-form-container">
          <h2>{editingId ? 'Edit Ad' : 'Create Ad'}</h2>
          
          {/* Ad Type Selection */}
          <div className="ad-type-selection">
            <button
              type="button"
              className={`type-btn ${formData.adType === 'image' ? 'active' : ''}`}
              onClick={() => {
                setFormData({ ...formData, adType: 'image' });
                setAdType('image');
              }}
            >
              <FiImage /> Image Ad
            </button>
            <button
              type="button"
              className={`type-btn ${formData.adType === 'video' ? 'active' : ''}`}
              onClick={() => {
                setFormData({ ...formData, adType: 'video' });
                setAdType('video');
              }}
            >
              <FiVideo /> Video Ad
            </button>
          </div>

          <form onSubmit={handleSubmit} className="ads-form">
            {/* Basic Information & Timing Section */}
            <fieldset className="form-section">
              <legend>📋 Basic Information & Timing</legend>
              
              {/* Row 1: Title, Placement, Status, Priority */}
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ad title"
                    required
                    style={{ minWidth: '180px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Placement *</label>
                  <select
                    name="placement"
                    value={formData.placement}
                    onChange={handleInputChange}
                    required
                  >
                    <optgroup label="Regular Placements">
                      <option value="homepage">Homepage</option>
                      <option value="authors">Authors</option>
                      <option value="categories">Categories</option>
                      <option value="papers">Papers</option>
                    </optgroup>
                    <optgroup label="Grid Card Placements">
                      <option value="grid-authors">Grid - Authors</option>
                      <option value="grid-categories">Grid - Categories</option>
                      <option value="grid-campus">Grid - Campus/Universities</option>
                      <option value="grid-papers">Grid - Papers</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="0-100"
                    style={{ width: '80px' }}
                  />
                </div>
              </div>

              {/* Row 2: Start Date, End Date, Countdown, Skippable */}
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Countdown (sec)</label>
                  <input
                    type="number"
                    name="countdownSeconds"
                    value={formData.countdownSeconds}
                    onChange={handleInputChange}
                    min="3"
                    max="60"
                    style={{ width: '80px' }}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isSkippable"
                      checked={formData.isSkippable}
                      onChange={handleInputChange}
                    />
                    Skippable
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Media & CTA Section */}
            <fieldset className="form-section">
              <legend>🎨 Media & CTA</legend>

              {formData.adType === 'image' && (
                <div className="form-group">
                  <label>Image *</label>
                  <div className="upload-section">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      disabled={uploading}
                      className="file-input"
                    />
                    {uploading && <span className="upload-status">Uploading...</span>}
                  </div>
                </div>
              )}

              {formData.adType === 'video' && (
                <>
                  <div className="form-group">
                    <label>Video File *</label>
                    <div className="upload-section">
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={(e) => handleFileUpload(e, 'video')}
                        disabled={uploading}
                        className="file-input"
                      />
                      {uploading && <span className="upload-status">Uploading...</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Thumbnail Image</label>
                    <div className="upload-section">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'thumbnail')}
                        disabled={uploading}
                        className="file-input"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>CTA Text</label>
                  <input
                    type="text"
                    name="ctaText"
                    value={formData.ctaText}
                    onChange={handleInputChange}
                    placeholder="Learn More"
                    style={{ minWidth: '120px' }}
                  />
                </div>

                <div className="form-group">
                  <label>CTA Color</label>
                  <input
                    type="color"
                    name="ctaButtonColor"
                    value={formData.ctaButtonColor}
                    onChange={handleInputChange}
                    style={{ height: '28px', width: '50px', cursor: 'pointer' }}
                  />
                </div>

                <div className="form-group">
                  <label>Click URL</label>
                  <input
                    type="url"
                    name="clickUrl"
                    value={formData.clickUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    style={{ minWidth: '180px' }}
                  />
                </div>
              </div>
            </fieldset>

            {/* Budget & Conversion Section */}
            <fieldset className="form-section">
              <legend>💰 Budget & Conversion</legend>

              {/* Row 1: Budget Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label>Total Budget</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    style={{ width: '90px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Daily Budget</label>
                  <input
                    type="number"
                    name="dailyBudget"
                    value={formData.dailyBudget}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    style={{ width: '90px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Cost Per Click</label>
                  <input
                    type="number"
                    name="costPerClick"
                    value={formData.costPerClick}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    style={{ width: '90px' }}
                  />
                </div>

                <div className="form-group">
                  <label>A/B Test</label>
                  <select
                    name="abTestGroup"
                    value={formData.abTestGroup}
                    onChange={handleInputChange}
                  >
                    <option value="control">Control</option>
                    <option value="variant_a">Variant A</option>
                    <option value="variant_b">Variant B</option>
                    <option value="variant_c">Variant C</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Conversion Tracking */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="conversionTracking"
                      checked={formData.conversionTracking}
                      onChange={handleInputChange}
                    />
                    Enable Conversion Tracking
                  </label>
                </div>

                {formData.conversionTracking && (
                  <div className="form-group">
                    <label>Conversion URL</label>
                    <input
                      type="url"
                      name="conversionUrl"
                      value={formData.conversionUrl}
                      onChange={handleInputChange}
                      placeholder="https://analytics.example.com/pixel"
                      style={{ minWidth: '200px' }}
                    />
                  </div>
                )}
              </div>
            </fieldset>

            {/* Targeting & Advanced Section */}
            <fieldset className="form-section">
              <legend>🎯 Targeting</legend>

              {/* Row 1: Demographics */}
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="targetGender"
                    value={formData.targetGender}
                    onChange={handleInputChange}
                  >
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Min Age</label>
                  <input
                    type="number"
                    name="minAge"
                    value={formData.minAge}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    style={{ width: '70px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Max Age</label>
                  <input
                    type="number"
                    name="maxAge"
                    value={formData.maxAge}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    style={{ width: '70px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Frequency Cap</label>
                  <input
                    type="number"
                    name="frequencyCap"
                    value={formData.frequencyCap}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Unlimited"
                    style={{ width: '80px' }}
                  />
                </div>
              </div>

              {/* Row 2: Devices */}
              <div className="form-row">
                <div className="form-group">
                  <label>Target Devices</label>
                  <div className="checkbox-group">
                    {['mobile', 'tablet', 'desktop'].map(device => (
                      <label key={device} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.targetDevices.includes(device)}
                          onChange={() => handleDeviceChange(device)}
                        />
                        {device.charAt(0).toUpperCase() + device.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? '✏️ Update' : '➕ Create Ad'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={resetForm}
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads List - Compact Table */}
      {activeTab === 'ads' && !showForm && (
        <div className="ads-list" ref={adsListRef} style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
          {ads.length === 0 ? (
            <div className="no-ads">
              <p>No ads yet. Create your first ad!</p>
            </div>
          ) : (
            isNarrow ? (
              <div className="ads-cards">
                {ads.filter(ad => !!ad).map(ad => (
                  <div key={ad?.id} className="ad-card" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {(ad?.ad_type || 'image') === 'video' ? (
                        <div className="ad-thumb video" style={{ minWidth: 48, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎥</div>
                      ) : (
                        ad?.image_url ? <img src={ad?.image_url} alt={ad?.title} className="ad-thumb" style={{ width: 48, height: 48 }} /> : <div className="ad-thumb" style={{ width: 48, height: 48 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#e9edef', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad?.title || 'Untitled'}</div>
                        <div style={{ fontSize: 12, color: '#8696a0', marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className="creator-name">{ad?.user_name || ad?.user_email || '—'}</span>
                          <span className={`status-badge ${ad?.status || 'active'}`} style={{ fontSize: 11 }}>{ad?.status || 'Active'}</span>
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#b0bcc4' }}>
                          <span>Impr: {ad?.total_impressions || 0}</span>
                          <span>Clk: {ad?.total_clicks || 0}</span>
                          <span>{ad?.start_date ? new Date(ad?.start_date).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button className="btn-small edit" onClick={() => ad && handleEdit(ad)} title="Edit ad"><FiEdit2 /></button>
                        <button className="btn-small delete" onClick={() => ad?.id && handleDelete(ad.id)} title="Delete ad"><FiTrash2 /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="ads-table" style={{ minWidth: 1200, width: 'auto', tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '60px', flex: 1, width: '14%' }}>Title</th>
                    <th style={{ minWidth: '65px', flex: 0.9, width: '12%' }}>Creator</th>
                    <th style={{ minWidth: '45px', flex: 0.5, width: '7%' }}>Type</th>
                    <th style={{ minWidth: '50px', flex: 0.7, width: '10%' }}>Placement</th>
                    <th style={{ minWidth: '45px', flex: 0.5, width: '7%' }}>Status</th>
                    <th style={{ minWidth: '50px', flex: 0.7, width: '10%' }}>Impressions</th>
                    <th style={{ minWidth: '45px', flex: 0.5, width: '7%' }}>Clicks</th>
                    <th style={{ minWidth: '35px', flex: 0.4, width: '5%' }}>CTR</th>
                    <th style={{ minWidth: '50px', flex: 0.7, width: '10%' }}>Start Date</th>
                    <th style={{ minWidth: '65px', flex: 0.9, width: '12%' }}>End Date</th>
                    <th style={{ minWidth: '60px', flex: 0.8, width: '6%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads && ads.length > 0 ? ads.filter(ad => !!ad).map(ad => {
                    if (!ad) return null;
                    return (
                      <tr key={ad?.id} className={`ad-row ${ad?.status || 'active'}`}>
                        <td className="title-cell">
                          <div className="title-with-thumb">
                            {(ad?.ad_type || 'image') === 'video' ? (
                              <div className="ad-thumb video">🎥</div>
                            ) : (
                              <>
                                {ad?.image_url && (
                                  <img src={ad?.image_url} alt={ad?.title} className="ad-thumb" />
                                )}
                              </>
                            )}
                            <span>{ad?.title}</span>
                          </div>
                        </td>
                        <td className="creator-cell">
                          <div className="creator-info">
                            <span className="creator-name">{ad?.user_name || ad?.user_email || '—'}</span>
                          </div>
                        </td>
                        <td className="type-cell">
                          <span className="badge-type">{(ad?.ad_type || 'image').toUpperCase()}</span>
                        </td>
                        <td>{ad?.placement}</td>
                        <td>
                          <span className={`status-badge ${ad?.status || 'active'}`}>
                            {ad?.status?.charAt(0).toUpperCase() + ad?.status?.slice(1) || 'Active'}
                          </span>
                        </td>
                        <td className="number">{ad?.total_impressions || 0}</td>
                        <td className="number">{ad?.total_clicks || 0}</td>
                        <td className="number">
                          {(ad?.total_impressions || 0) > 0 
                            ? (((ad?.total_clicks || 0) / (ad?.total_impressions || 1)) * 100).toFixed(2) 
                            : 0}%
                        </td>
                        <td className="date-cell">
                          {ad?.start_date ? new Date(ad?.start_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : '—'}
                        </td>
                        <td className="date-cell">
                          {ad?.end_date ? new Date(ad?.end_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : '—'}
                        </td>
                        <td className="actions-cell" style={{ textAlign: 'center' }}>
                          <div className="actions" style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button 
                              className="btn-small edit"
                              onClick={() => ad && handleEdit(ad)}
                              title="Edit ad"
                            >
                              <FiEdit2 />
                            </button>
                            <button 
                              className="btn-small delete"
                              onClick={() => ad?.id && handleDelete(ad.id)}
                              title="Delete ad"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#8696a0' }}>
                        No ads found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            )
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <div className="analytics-header-section">
            <h3>� Ad Performance Analytics</h3>
            <p>Real-time tracking of impressions, clicks, and engagement metrics</p>
          </div>

          {/* Enhanced Ads Performance Table */}
          <div className="ads-performance-table-wrapper">
            <h2>All Ads Performance Overview</h2>
            <div className="ads-performance-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div className="table-header" style={{ minWidth: 1100 }}>
                <div className="col-title">Ad Title</div>
                <div className="col-placement">Placement</div>
                <div className="col-impressions">Impressions</div>
                <div className="col-clicks">Clicks</div>
                <div className="col-dismisses">Dismisses</div>
                <div className="col-ctr">CTR %</div>
                <div className="col-engagement">Engagement %</div>
              </div>
              <div className="table-body">
                {ads && ads.length > 0 ? ads.filter(ad => !!ad).map(ad => {
                  if (!ad) return null;
                  return (
                    <div 
                      key={ad?.id} 
                      className={`table-row ${selectedAnalyticsAd?.id === ad?.id ? 'active' : ''}`}
                      onClick={() => {
                        ad && setSelectedAnalyticsAd(ad);
                        ad?.id && fetchAnalytics(ad.id);
                        ad?.id && fetchEngagement(ad.id);
                      }}
                    >
                      <div className="col-title">{ad?.title}</div>
                      <div className="col-placement">
                        <span className="placement-badge">{ad?.placement}</span>
                      </div>
                      <div className="col-impressions">{ad?.total_impressions || 0}</div>
                      <div className="col-clicks">{ad?.total_clicks || 0}</div>
                      <div className="col-dismisses">{ad?.total_dismisses || 0}</div>
                      <div className="col-ctr">
                        {(ad?.total_impressions || 0) > 0 
                          ? (((ad?.total_clicks || 0) / (ad?.total_impressions || 1)) * 100).toFixed(1)
                          : 0}%
                      </div>
                      <div className="col-engagement">
                        {(ad?.total_impressions || 0) > 0 
                          ? ((((ad?.total_clicks || 0) + (ad?.total_dismisses || 0)) / (ad?.total_impressions || 1)) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#8696a0' }}>
                    No ads to display
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedAnalyticsAd && (
            <>
              {/* Selected Ad Details Panel */}
              <div className="selected-ad-analytics-panel">
                <h2>📈 Analytics Details: {selectedAnalyticsAd.title}</h2>

                {/* Key Metrics Grid */}
                <div className="key-metrics-grid">
                  <div className="key-metric">
                    <span className="label">Total Impressions</span>
                    <span className="value">{selectedAnalyticsAd.total_impressions || 0}</span>
                  </div>
                  <div className="key-metric">
                    <span className="label">Total Clicks</span>
                    <span className="value highlight-blue">{selectedAnalyticsAd.total_clicks || 0}</span>
                  </div>
                  <div className="key-metric">
                    <span className="label">Total Dismisses</span>
                    <span className="value highlight-red">{selectedAnalyticsAd.total_dismisses || 0}</span>
                  </div>
                  <div className="key-metric">
                    <span className="label">Click-Through Rate</span>
                    <span className="value highlight-green">
                      {selectedAnalyticsAd.total_impressions > 0 
                        ? (((selectedAnalyticsAd.total_clicks || 0) / selectedAnalyticsAd.total_impressions) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="key-metric">
                    <span className="label">Engagement Rate</span>
                    <span className="value highlight-purple">
                      {selectedAnalyticsAd.total_impressions > 0 
                        ? (((selectedAnalyticsAd.total_clicks + selectedAnalyticsAd.total_dismisses) / selectedAnalyticsAd.total_impressions) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="key-metric">
                    <span className="label">Completion Rate</span>
                    <span className="value highlight-yellow">
                      {selectedAnalyticsAd.total_impressions > 0
                        ? (((selectedAnalyticsAd.total_impressions - selectedAnalyticsAd.total_dismisses) / selectedAnalyticsAd.total_impressions) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>

                {/* Ad Info & Device Breakdown */}
                <div className="analytics-grid">
                  {/* Ad Information */}
                  <div className="ad-info-card">
                    <h3>Ad Information</h3>
                    <div className="info-row">
                      <span className="label">Status:</span>
                      <span className={`value status-badge ${selectedAnalyticsAd.is_active ? 'active' : 'inactive'}`}>
                        {selectedAnalyticsAd.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Dismiss Rate:</span>
                      <span className="value">{selectedAnalyticsAd.dismissRate || 0}%</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Avg View Duration:</span>
                      <span className="value">{analytics?.metrics?.avgViewDuration || 0}s</span>
                    </div>
                  </div>

                  {/* Device Breakdown */}
                  <div className="device-breakdown-card">
                    <h3>Device Breakdown</h3>
                    {(() => {
                      const mobile = analytics?.metrics?.deviceBreakdown?.mobile || 0;
                      const tablet = analytics?.metrics?.deviceBreakdown?.tablet || 0;
                      const desktop = analytics?.metrics?.deviceBreakdown?.desktop || 0;
                      const total = mobile + tablet + desktop;
                      return (
                        <div className="device-rows">
                          <div className="device-item">
                            <span className="device-name">📱 Mobile</span>
                            <span className="device-count">{mobile}</span>
                            <div className="device-bar-small">
                              <div className="bar mobile" style={{width: total > 0 ? ((mobile / total) * 100) : 0 + '%'}}></div>
                            </div>
                            <span className="device-pct">{total > 0 ? ((mobile / total) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <div className="device-item">
                            <span className="device-name">📱 Tablet</span>
                            <span className="device-count">{tablet}</span>
                            <div className="device-bar-small">
                              <div className="bar tablet" style={{width: total > 0 ? ((tablet / total) * 100) : 0 + '%'}}></div>
                            </div>
                            <span className="device-pct">{total > 0 ? ((tablet / total) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <div className="device-item">
                            <span className="device-name">🖥️ Desktop</span>
                            <span className="device-count">{desktop}</span>
                            <div className="device-bar-small">
                              <div className="bar desktop" style={{width: total > 0 ? ((desktop / total) * 100) : 0 + '%'}}></div>
                            </div>
                            <span className="device-pct">{total > 0 ? ((desktop / total) * 100).toFixed(1) : 0}%</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Date Range & Engagement Timeline */}
                <div className="engagement-section">
                  <div className="engagement-header-row">
                    <h3>Daily Engagement Timeline</h3>
                    <div className="date-selector-inline">
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                        title="Start Date"
                      />
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                        title="End Date"
                      />
                      <button className="btn-refresh" onClick={refreshEngagement}>
                        Refresh
                      </button>
                    </div>
                  </div>

                  {engagement && Object.keys(engagement).length > 0 ? (
                    <div className="engagement-table">
                      <div className="table-header-row">
                        <div className="col date">Date</div>
                        <div className="col impressions">Impressions</div>
                        <div className="col clicks">Clicks</div>
                        <div className="col dismisses">Dismisses</div>
                        <div className="col avgTime">Avg Time</div>
                      </div>
                      <div className="table-body-rows">
                        {Object.entries(engagement).map(([date, data]) => (
                          <div key={date} className="table-row-item">
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
                    </div>
                  ) : (
                    <p className="no-data">No engagement data for selected date range</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Creators Tab - User Ad Submissions */}
      {activeTab === 'creators' && (
        <div className="creators-section">
          <div className="creators-header-section">
            <h3 style={{ color: '#cfe6e8', fontWeight: 600 }}>User Ads</h3>
          </div>

          {submissionsLoading ? (
            <div className="ads-loading">Loading submissions...</div>
          ) : userSubmissions.length === 0 ? (
            <div className="no-ads">
              <p>No user submissions yet</p>
            </div>
          ) : (
            <div className="submissions-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1c2a31', background: '#0f1419' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8696a0', fontWeight: '600', fontSize: '12px' }}>NAME</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8696a0', fontWeight: '600', fontSize: '12px' }}>EMAIL</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8696a0', fontWeight: '600', fontSize: '12px' }}>AD TITLE</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8696a0', fontWeight: '600', fontSize: '12px' }}>AD TYPE</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8696a0', fontWeight: '600', fontSize: '12px' }}>PLACEMENT</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8696a0', fontWeight: '600', fontSize: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8696a0', fontWeight: '600', fontSize: '12px' }}>SUBMITTED</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#8696a0', fontWeight: '600', fontSize: '12px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {userSubmissions.map((submission, idx) => {
                    const statusColor = submission.status === 'approved' 
                      ? '#00a884' 
                      : submission.status === 'rejected' 
                      ? '#f87171' 
                      : '#fb923c';

                    // Extract user name - prefer profileData from enrichment, then other fallbacks
                    const userName = submission.profileData?.full_name || submission.profileData?.display_name || submission.user_name || submission.userName || submission.raw_metadata?.user_name || 'Unknown User';
                    
                    // Extract user email - prefer profileData email if present
                    const userEmail = submission.profileData?.email || submission.user_email || submission.userEmail || submission.raw_metadata?.user_email || submission.email || 'N/A';

                    console.log(`🔍 [RENDER] Submission ${submission.id}:`, { userName, userEmail, user_name: submission.user_name, user_email: submission.user_email });

                    return (
                      <tr key={submission.id} style={{
                        borderBottom: '1px solid #1c2a31',
                        background: idx % 2 === 0 ? '#0a0e11' : '#0f1419'
                      }}>
                        <td style={{ padding: '12px 16px', color: '#e9edef', fontSize: '13px' }}>
                          {userName}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#8696a0', fontSize: '13px' }}>
                          {userEmail}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#e9edef', fontSize: '13px' }}>
                          {submission.title || 'Untitled'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: submission.adType === 'video' ? '#c864f0' : '#6478f0', fontWeight: '600' }}>
                          <button
                            onClick={() => {
                              if (submission.ad_type === 'video' && submission.video_url) {
                                setMediaToView(submission.video_url);
                                setMediaTypeToView('video');
                                setShowMediaViewer(true);
                              } else if (submission.image_url) {
                                setMediaToView(submission.image_url);
                                setMediaTypeToView('image');
                                setShowMediaViewer(true);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: submission.adType === 'video' ? '#c864f0' : '#6478f0',
                              fontWeight: '600',
                              cursor: (submission.ad_type === 'video' && submission.video_url) || submission.image_url ? 'pointer' : 'default',
                              textDecoration: 'underline',
                              fontSize: '13px',
                              padding: 0
                            }}
                            onMouseEnter={(e) => {
                              if ((submission.ad_type === 'video' && submission.video_url) || submission.image_url) {
                                e.currentTarget.style.opacity = '0.7';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            title={(submission.ad_type === 'video' && submission.video_url) || submission.image_url ? 'Click to view media' : 'No media available'}
                          >
                            {submission.adType ? submission.adType.charAt(0).toUpperCase() + submission.adType.slice(1) : 'Image'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#8696a0', fontSize: '13px' }}>
                          {submission.placement || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: statusColor, fontWeight: '600', textTransform: 'capitalize' }}>
                          {submission.status || 'pending'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#8696a0', fontSize: '13px' }}>
                          {submission.created_at 
                            ? new Date(submission.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                            : 'N/A'
                          }
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowSubmissionDetail(true);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'none',
                                border: '1px solid #6478f0',
                                color: '#6478f0',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#6478f020';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                              }}
                              title="View"
                            >
                              👁 View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Submission Detail Modal */}
      {showSubmissionDetail && selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowSubmissionDetail(false)}>
          <div style={{
            background: '#0b1216',
            borderRadius: '8px',
            border: '1px solid #1c2a31',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#e9edef', margin: 0 }}>
                🔍 Ad Submission Details
              </h2>
              <button
                onClick={() => setShowSubmissionDetail(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#8696a0'
                }}
              >
                ×
              </button>
            </div>

            {/* Media Preview */}
            {(selectedSubmission.image_url || selectedSubmission.video_url) && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>🖼️ Media Preview</h3>
                <div style={{ 
                  background: '#0a0e11', 
                  padding: '16px', 
                  borderRadius: '8px',
                  maxHeight: '350px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #1c2a31'
                }}>
                  {selectedSubmission.image_url && (
                    <img 
                      src={selectedSubmission.image_url} 
                      alt="Advertisement preview"
                      style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '4px' }}
                    />
                  )}
                  {selectedSubmission.video_url && (
                    <video
                      src={selectedSubmission.video_url}
                      controls
                      style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '4px' }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>ℹ️ Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#0a0e11', padding: '14px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>USER</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#e9edef', fontWeight: '500' }}>{selectedSubmission.user_name || 'Unknown User'}</p>
                </div>
                <div style={{ background: '#0a0e11', padding: '14px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>EMAIL</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#e9edef' }}>{selectedSubmission.user_email || 'N/A'}</p>
                </div>
                <div style={{ background: '#0a0e11', padding: '14px', borderRadius: '6px', border: '1px solid #1c2a31', gridColumn: '1 / -1' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TITLE</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#e9edef', fontWeight: '500' }}>{selectedSubmission.title || 'Untitled'}</p>
                </div>
                <div style={{ background: '#0a0e11', padding: '14px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AD TYPE</p>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    background: selectedSubmission.ad_type === 'video' ? '#c864f0' : '#6478f0',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {selectedSubmission.ad_type?.toUpperCase() || 'IMAGE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedSubmission.description && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>📝 Description</h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '13px', 
                  color: '#e9edef', 
                  background: '#0a0e11', 
                  padding: '16px', 
                  borderRadius: '6px',
                  lineHeight: '1.6',
                  border: '1px solid #1c2a31'
                }}>
                  {selectedSubmission.description}
                </p>
              </div>
            )}

            {/* Campaign Details */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>📅 Campaign Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {selectedSubmission.placement && (
                  <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PLACEMENT</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#e9edef' }}>{selectedSubmission.placement}</p>
                  </div>
                )}
                {selectedSubmission.start_date && (
                  <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>START DATE</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#e9edef' }}>{new Date(selectedSubmission.start_date).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedSubmission.end_date && (
                  <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>END DATE</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#e9edef' }}>{new Date(selectedSubmission.end_date).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedSubmission.budget && (
                  <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BUDGET</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#00a884', fontWeight: '600' }}>KES {parseFloat(selectedSubmission.budget || 0).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Budget & Performance */}
            {(selectedSubmission.daily_budget || selectedSubmission.cost_per_click) && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>💰 Budget & Performance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {selectedSubmission.daily_budget && (
                    <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DAILY BUDGET</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#e9edef' }}>KES {parseFloat(selectedSubmission.daily_budget || 0).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedSubmission.cost_per_click && (
                    <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>COST PER CLICK</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#e9edef' }}>KES {parseFloat(selectedSubmission.cost_per_click || 0).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Targeting */}
            {(selectedSubmission.min_age || selectedSubmission.target_gender) && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>👥 Audience Targeting</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {selectedSubmission.min_age && (
                    <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AGE RANGE</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#e9edef' }}>
                        {selectedSubmission.min_age}-{selectedSubmission.max_age}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.target_gender && (
                    <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GENDER</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#e9edef', textTransform: 'capitalize' }}>
                        {selectedSubmission.target_gender}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Call to Action */}
            {(selectedSubmission.cta_text || selectedSubmission.click_url) && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>🎯 Call to Action</h3>
                <div style={{ background: '#0a0e11', padding: '16px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                  {selectedSubmission.cta_text && (
                    <>
                      <p style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BUTTON TEXT</p>
                      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#e9edef', fontWeight: '500' }}>{selectedSubmission.cta_text}</p>
                    </>
                  )}
                  {selectedSubmission.click_url && (
                    <>
                      <p style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESTINATION URL</p>
                      <a 
                        href={selectedSubmission.click_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ margin: 0, fontSize: '12px', color: '#00a884', wordBreak: 'break-all', textDecoration: 'none', fontWeight: '500' }}
                      >
                        {selectedSubmission.click_url}
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {(selectedSubmission.priority || selectedSubmission.ab_test_group) && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>⚙️ Advanced Settings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {selectedSubmission.priority && (
                    <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRIORITY</p>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: selectedSubmission.priority === 'high' ? '#fb923c' : selectedSubmission.priority === 'medium' ? '#00a884' : '#6478f0',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {selectedSubmission.priority}
                      </span>
                    </div>
                  )}
                  {selectedSubmission.ab_test_group && (
                    <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AB TEST GROUP</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#e9edef', textTransform: 'capitalize' }}>
                        {selectedSubmission.ab_test_group}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submission Metadata */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#e9edef', marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', margin: '0 0 16px 0' }}>📋 Submission Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</p>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: selectedSubmission.status === 'approved' ? '#00a88420' : selectedSubmission.status === 'rejected' ? '#f8717120' : '#fb923c20',
                    color: selectedSubmission.status === 'approved' ? '#00a884' : selectedSubmission.status === 'rejected' ? '#f87171' : '#fb923c',
                    fontWeight: '600',
                    fontSize: '11px',
                    textTransform: 'capitalize'
                  }}>
                    {selectedSubmission.status || 'pending'}
                  </span>
                </div>
                <div style={{ background: '#0a0e11', padding: '12px', borderRadius: '6px', border: '1px solid #1c2a31' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#8696a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SUBMITTED</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#e9edef' }}>
                    {selectedSubmission.created_at 
                      ? new Date(selectedSubmission.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #1c2a31' }}>
              {selectedSubmission.status !== 'approved' && (
                <button
                  onClick={() => {
                    approveUserAd(selectedSubmission.id);
                    setShowSubmissionDetail(false);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#00a884',
                    color: '#fff',
                    border: '1px solid #00a884',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#06d755';
                    e.currentTarget.style.borderColor = '#06d755';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#00a884';
                    e.currentTarget.style.borderColor = '#00a884';
                  }}
                  title="Approve this ad"
                >
                  <FiCheck size={14} /> Approve
                </button>
              )}
              {selectedSubmission.status !== 'rejected' && (
                <button
                  onClick={() => {
                    rejectUserAd(selectedSubmission.id);
                    setShowSubmissionDetail(false);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#f87171',
                    color: '#fff',
                    border: '1px solid #f87171',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.borderColor = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f87171';
                    e.currentTarget.style.borderColor = '#f87171';
                  }}
                  title="Reject this ad"
                >
                  <FiX size={14} /> Reject
                </button>
              )}
              <button
                onClick={() => {
                  deleteUserAd(selectedSubmission.id);
                  setShowSubmissionDetail(false);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#6366f1',
                  color: '#fff',
                  border: '1px solid #6366f1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4f46e5';
                  e.currentTarget.style.borderColor = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#6366f1';
                  e.currentTarget.style.borderColor = '#6366f1';
                }}
                title="Permanently delete this ad"
              >
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Media Viewer */}
      {showMediaViewer && mediaToView && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }} onClick={() => setShowMediaViewer(false)}>
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setShowMediaViewer(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#fff',
                cursor: 'pointer',
                zIndex: 10002
              }}
              title="Close (ESC)"
            >
              ✕
            </button>

            {/* Image Viewer */}
            {mediaTypeToView === 'image' && (
              <img
                src={mediaToView}
                alt="Full screen media"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  borderRadius: '8px',
                  objectFit: 'contain'
                }}
              />
            )}

            {/* Video Viewer */}
            {mediaTypeToView === 'video' && (
              <video
                src={mediaToView}
                controls
                autoPlay
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  borderRadius: '8px',
                  objectFit: 'contain'
                }}
              />
            )}

            {/* Click anywhere to close hint */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              color: '#999',
              fontSize: '12px',
              textAlign: 'center',
              width: '100%'
            }}>
              Click outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

