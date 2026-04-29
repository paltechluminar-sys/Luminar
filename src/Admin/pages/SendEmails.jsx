import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { FiSend } from 'react-icons/fi';
import { API_URL } from '../../config';
import './SendEmails.css';

const NOTIFICATION_TYPES = [
  { value: 'update', label: 'System Update', color: '#3498db' },
  { value: 'new_feature', label: 'New Feature', color: '#2ecc71' },
  { value: 'system_downtime', label: 'System Downtime', color: '#e74c3c' },
  { value: 'congratulation', label: 'Congratulation', color: '#f39c12' },
  { value: 'general', label: 'General Message', color: '#95a5a6' },
];

const RECIPIENT_TYPES = [
  { value: 'all_users', label: 'All Users' },
  { value: 'by_role', label: 'By Role (Admin, Editor, etc)' },
  { value: 'by_tier', label: 'By Subscription Tier' },
  { value: 'specific_users', label: 'Specific Users (Enter emails)' },
];

const EMAIL_TEMPLATES = [
  {
    id: 'template_update',
    category: 'update',
    name: 'System Update',
    subject: 'Important System Update - Somalux',
    body: 'Dear User,\n\nWe are excited to announce an important update to Somalux:\n\n{{update_details}}\n\nThis update improves your experience and adds new capabilities.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_feature',
    category: 'new_feature',
    name: 'New Feature Announcement',
    subject: '🎉 New Feature Available - Somalux',
    body: 'Dear User,\n\nWe are thrilled to introduce a new feature to Somalux:\n\n{{feature_description}}\n\nYou can start using it today!\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_downtime',
    category: 'system_downtime',
    name: 'Scheduled Downtime',
    subject: '⚠️ Scheduled System Maintenance - Somalux',
    body: 'Dear User,\n\nWe will be performing scheduled maintenance on:\n\nDate: {{maintenance_date}}\nTime: {{maintenance_time}}\nExpected Duration: {{duration}}\n\nDuring this time, Somalux may be unavailable.\n\nWe apologize for any inconvenience.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_congrats',
    category: 'congratulation',
    name: 'Congratulations',
    subject: '🎊 Congratulations! - Somalux',
    body: 'Dear {{user_name}},\n\nWe want to congratulate you on {{achievement}}!\n\nYour dedication and contributions are greatly appreciated.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_security',
    category: 'update',
    name: 'Security Alert',
    subject: '🔒 Important Security Alert - Somalux',
    body: 'Dear User,\n\nFor your account security, we need to inform you about:\n\n{{security_details}}\n\nAction Required: {{required_action}}\n\nIf you did not perform this action, please contact our support team immediately.\n\nBest regards,\nThe Somalux Security Team',
  },
  {
    id: 'template_policy',
    category: 'update',
    name: 'Policy Update',
    subject: '📋 Important Policy Update - Somalux',
    body: 'Dear User,\n\nWe are updating our policies to better serve you:\n\n{{policy_details}}\n\nEffective Date: {{effective_date}}\n\nPlease review the updated terms at your earliest convenience.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_promotion',
    category: 'new_feature',
    name: 'Special Offer',
    subject: '🎁 Exclusive Offer Just for You - Somalux',
    body: 'Dear {{user_name}},\n\nWe have a special offer exclusively for you:\n\n{{offer_details}}\n\nDiscount Code: {{discount_code}}\nValid Until: {{expiration_date}}\n\nDon\'t miss out on this exclusive opportunity!\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_welcome',
    category: 'congratulation',
    name: 'Welcome New User',
    subject: '👋 Welcome to Somalux!',
    body: 'Dear {{user_name}},\n\nWelcome to Somalux! We are thrilled to have you join our community.\n\nHere are some resources to get you started:\n{{getting_started_tips}}\n\nIf you have any questions, our support team is here to help.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_bug_fix',
    category: 'update',
    name: 'Bug Fix Release',
    subject: '🐛 Bug Fix Release - Somalux',
    body: 'Dear User,\n\nWe have released a bug fix to improve your experience:\n\n{{bug_details}}\nFix Description: {{fix_description}}\n\nThis fix has been deployed to all systems.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_performance',
    category: 'update',
    name: 'Performance Update',
    subject: '⚡ Performance Improvements - Somalux',
    body: 'Dear User,\n\nWe have made significant performance improvements:\n\n{{performance_details}}\n\nYou should notice faster load times and smoother operations.\n\nThank you for your patience!\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_emergency',
    category: 'system_downtime',
    name: 'Emergency Notice',
    subject: '🚨 Emergency Alert - Somalux',
    body: 'Dear User,\n\nThis is an urgent emergency notice:\n\n{{emergency_details}}\n\nAction Required: {{action_required}}\n\nPlease take immediate action to protect your account.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_announcement',
    category: 'general',
    name: 'General Announcement',
    subject: '📢 Important Announcement - Somalux',
    body: 'Dear User,\n\nWe have an important announcement to share:\n\n{{announcement_details}}\n\nFor more information: {{info_link}}\n\nThank you for being part of our community!\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_survey',
    category: 'general',
    name: 'Feedback Survey',
    subject: '📝 We Value Your Feedback - Somalux',
    body: 'Dear {{user_name}},\n\nWe would love to hear your thoughts about Somalux!\n\nPlease take a few minutes to complete our survey:\n{{survey_link}}\n\nYour feedback helps us improve the platform.\n\nThank you!\nThe Somalux Team',
  },
  {
    id: 'template_verification',
    category: 'update',
    name: 'Account Verification',
    subject: '✅ Verify Your Account - Somalux',
    body: 'Dear {{user_name}},\n\nPlease verify your account to complete the setup:\n\nVerification Code: {{verification_code}}\n\nOr click here: {{verification_link}}\n\nThis code expires in {{expiration_time}}.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_password_reset',
    category: 'update',
    name: 'Password Reset',
    subject: '🔐 Password Reset Request - Somalux',
    body: 'Dear {{user_name}},\n\nWe received a request to reset your password.\n\nReset Link: {{reset_link}}\n\nThis link expires in {{expiration_time}}.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_content',
    category: 'new_feature',
    name: 'New Content Available',
    subject: '📚 New Content Available - Somalux',
    body: 'Dear {{user_name}},\n\nNew content has been added to Somalux:\n\n{{content_title}}\n{{content_description}}\n\nView Now: {{content_link}}\n\nHappy learning!\nThe Somalux Team',
  },
  {
    id: 'template_event',
    category: 'congratulation',
    name: 'Event Notification',
    subject: '🎪 Upcoming Event - Somalux',
    body: 'Dear {{user_name}},\n\nWe are hosting an exciting event:\n\nEvent: {{event_name}}\nDate: {{event_date}}\nTime: {{event_time}}\nLocation: {{event_location}}\n\nRegister Now: {{registration_link}}\n\nWe look forward to seeing you!\nThe Somalux Team',
  },
  {
    id: 'template_milestone',
    category: 'congratulation',
    name: 'Milestone Celebration',
    subject: '🏆 You\'ve Reached a Milestone! - Somalux',
    body: 'Dear {{user_name}},\n\nCongratulations! You\'ve reached {{milestone}}!\n\n{{milestone_details}}\n\nKeep up the great work!\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_subscription',
    category: 'update',
    name: 'Subscription Renewal',
    subject: '💳 Subscription Renewal Reminder - Somalux',
    body: 'Dear {{user_name}},\n\nYour subscription will renew on {{renewal_date}}.\n\nSubscription Plan: {{plan_name}}\nAmount: {{amount}}\n\nManage Subscription: {{manage_link}}\n\nIf you have questions, contact our support team.\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_resources',
    category: 'general',
    name: 'Help & Resources',
    subject: '❓ Help & Resources - Somalux',
    body: 'Dear {{user_name}},\n\nWe\'ve compiled helpful resources for you:\n\n{{resources_list}}\n\nOur Knowledge Base: {{kb_link}}\nContact Support: {{support_link}}\n\nWe\'re here to help!\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_report',
    category: 'update',
    name: 'Monthly Report',
    subject: '📊 Your Monthly Report - Somalux',
    body: 'Dear {{user_name}},\n\nHere\'s your activity report for {{month}}:\n\n{{report_summary}}\n\nView Full Report: {{report_link}}\n\nWe appreciate your continued engagement!\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_guidelines',
    category: 'update',
    name: 'Community Guidelines',
    subject: '📖 Community Guidelines Update - Somalux',
    body: 'Dear User,\n\nWe\'ve updated our community guidelines to ensure a positive environment:\n\n{{guidelines_summary}}\n\nRead Full Guidelines: {{guidelines_link}}\n\nThank you for helping keep our community great!\n\nBest regards,\nThe Somalux Team',
  },
  {
    id: 'template_data_retention',
    category: 'update',
    name: 'Data Retention Notice',
    subject: '📋 Data Retention Notice - Somalux',
    body: 'Dear User,\n\nThis is to inform you about our data retention policy:\n\n{{retention_details}}\n\nFor more information: {{privacy_link}}\n\nIf you have concerns, please contact us.\n\nBest regards,\nThe Somalux Team',
  },
];

const SendEmails = () => {
  const [tabValue, setTabValue] = useState(0);

  // Form states for sending emails
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState('general');
  const [recipientType, setRecipientType] = useState('all_users');
  const [recipientRole, setRecipientRole] = useState('admin');
  const [recipientTier, setRecipientTier] = useState('premium');
  const [tags, setTags] = useState([]);
  const [isUrgent, setIsUrgent] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [message_notification, setMessageNotification] = useState('');
  const [notificationType_ui, setNotificationTypeUI] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // History states
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationStats, setNotificationStats] = useState({});
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [notificationLogs, setNotificationLogs] = useState({});
  const [logsLoading, setLogsLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // User selection states
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Scheduling states
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [scheduledLoading, setScheduledLoading] = useState(false);

  // Analytics states
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Initialize page data on mount
  useEffect(() => {
    // Initialize first tab data if needed
  }, []);

  // Fetch notifications on mount or when tab changes
  useEffect(() => {
    if (tabValue === 2) {
      fetchScheduledEmails();
    }
    if (tabValue === 3) {
      // Analytics tab - no auto-fetch, user will select notification
    }
    if (tabValue === 4) {
      fetchNotifications();
      fetchStats();
    }
  }, [tabValue]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled || tabValue !== 4) return;

    const interval = setInterval(() => {
      fetchNotifications();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, tabValue]);

  // Fetch users when specific_users is selected
  useEffect(() => {
    if (recipientType === 'specific_users' && availableUsers.length === 0) {
      fetchAvailableUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientType]);

  // Fetch notification history
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/notifications?limit=100`);
      const data = await response.json();
      if (data.success) {
        // Sort by newest first
        const sorted = (data.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(sorted);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch detailed logs for a specific notification
  const fetchNotificationLogs = async (notificationId) => {
    if (notificationLogs[notificationId]) return; // Already loaded

    setLogsLoading((prev) => ({ ...prev, [notificationId]: true }));
    try {
      const response = await fetch(`${API_URL}/api/admin/notifications/${notificationId}`);
      const data = await response.json();
      if (data.success) {
        setNotificationLogs((prev) => ({
          ...prev,
          [notificationId]: data.logs || [],
        }));
      }
    } catch (error) {
      console.error('Error fetching notification logs:', error);
    } finally {
      setLogsLoading((prev) => ({ ...prev, [notificationId]: false }));
    }
  };

  // Fetch notification statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/notification-stats`);
      const data = await response.json();
      if (data.success) {
        setNotificationStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch available users from database
  const fetchAvailableUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.users)) {
        setAvailableUsers(data.users);
        console.log('✅ Loaded', data.users.length, 'users');
      } else {
        console.warn('No users returned from API');
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setMessageNotification('Failed to load users: ' + error.message);
      setNotificationTypeUI('error');
      setAvailableUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (userId, email) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.find((u) => u.id === userId);
      if (isSelected) {
        return prev.filter((u) => u.id !== userId);
      } else {
        return [...prev, { id: userId, email }];
      }
    });
  };

  // Check if user is selected
  const isUserSelected = (userId) => {
    return selectedUsers.some((u) => u.id === userId);
  };

  // Filter users based on search query
  const filteredUsers = availableUsers.filter((user) => {
    const searchLower = userSearchQuery.toLowerCase();
    const userName = (user.full_name || user.email.split('@')[0]).toLowerCase();
    const userEmail = user.email.toLowerCase();
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) {
      // Deselect all
      setSelectedUsers([]);
    } else {
      // Select all filtered users
      const allFilteredUserIds = filteredUsers.map((user) => ({
        id: user.id,
        email: user.email,
      }));
      setSelectedUsers(allFilteredUserIds);
    }
  };

  // Apply template
  const applyTemplate = (template) => {
    setTitle(template.subject);
    setMessage(template.body);
    setNotificationType(template.category);
    setSelectedTemplate(template);
    setTabValue(0); // Switch back to compose tab
  };

  // Validate form
  const validateForm = () => {
    if (!title.trim()) {
      setMessageNotification('Title is required');
      setNotificationTypeUI('error');
      return false;
    }
    if (!message.trim()) {
      setMessageNotification('Message is required');
      setNotificationTypeUI('error');
      return false;
    }
    if (recipientType === 'specific_users' && selectedUsers.length === 0) {
      setMessageNotification('Please select at least one user');
      setNotificationTypeUI('error');
      return false;
    }
    return true;
  };

  // Handle send email
  const handleSendEmail = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessageNotification('');

    try {
      // Prepare recipient list
      let recipientFilter = {};
      let recipientsList = [];

      if (recipientType === 'by_role') {
        recipientFilter = { role: recipientRole };
      } else if (recipientType === 'by_tier') {
        recipientFilter = { tier: recipientTier };
      } else if (recipientType === 'specific_users') {
        recipientsList = selectedUsers.map((user) => ({ email: user.email }));
      }

      const payload = {
        title: title.trim(),
        message: message.trim(),
        notificationType,
        recipientType,
        recipientFilter,
        recipientsList,
        adminName: 'Admin', // You can replace with actual admin name
        adminEmail: 'admin@somalux.com',
        tags,
        isUrgent,
      };

      const response = await fetch(`${API_URL}/api/admin/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setMessageNotification(
          `✅ Emails queued for sending to ${data.recipientCount} recipient(s). Check History tab for delivery status.`
        );
        setNotificationTypeUI('success');

        // Switch to History tab to show the notification
        setTimeout(() => setTabValue(2), 1500);

        // Reset form
        setTimeout(() => {
          setTitle('');
          setMessage('');
          setNotificationType('general');
          setRecipientType('all_users');
          setTags([]);
          setIsUrgent(false);
          setSelectedTemplate(null);
        }, 2000);

        // Refresh history multiple times to catch the background job completion
        setTimeout(() => {
          fetchNotifications();
          fetchStats();
        }, 1000);
        
        setTimeout(() => {
          fetchNotifications();
          fetchStats();
        }, 3000);
        
        setTimeout(() => {
          fetchNotifications();
          fetchStats();
        }, 5000);
      } else {
        setMessageNotification(`❌ Error: ${data.error}`);
        setNotificationTypeUI('error');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setMessageNotification(`❌ Failed to send email: ${error.message}`);
      setNotificationTypeUI('error');
    } finally {
      setLoading(false);
    }
  };

  // Schedule email functionality
  const handleScheduleEmail = async () => {
    if (!title || !message || !scheduledTime) {
      setMessageNotification('Please fill all fields');
      setNotificationTypeUI('error');
      return;
    }

    setScheduledLoading(true);
    try {
      // First send the email 
      let recipientFilter = {};
      let recipientsList = [];

      if (recipientType === 'by_role') {
        recipientFilter = { role: recipientRole };
      } else if (recipientType === 'by_tier') {
        recipientFilter = { tier: recipientTier };
      } else if (recipientType === 'specific_users') {
        recipientsList = selectedUsers.map((user) => ({ email: user.email }));
      }

      const payload = {
        title: title.trim(),
        message: message.trim(),
        notificationType,
        recipientType,
        recipientFilter,
        recipientsList,
        adminName: 'Admin',
        adminEmail: 'admin@somalux.com',
        tags,
        isUrgent,
      };

      // Send the email and get its ID
      const sendResponse = await fetch(`${API_URL}/api/admin/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!sendResponse.ok) throw new Error('Failed to send email');
      
      const sendData = await sendResponse.json();
      const notificationId = sendData.notificationId;

      // Now schedule it
      const scheduleResponse = await fetch(`${API_URL}/api/admin/notifications/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          scheduledTime,
          timezone,
        }),
      });

      const scheduleData = await scheduleResponse.json();
      
      if (scheduleData.success) {
        setMessageNotification(`✅ Email scheduled for ${new Date(scheduledTime).toLocaleString()}`);
        setNotificationTypeUI('success');
        setScheduledTime('');
        fetchScheduledEmails();
      } else {
        setMessageNotification(`❌ Error: ${scheduleData.error}`);
        setNotificationTypeUI('error');
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      setMessageNotification(`❌ Failed to schedule email: ${error.message}`);
      setNotificationTypeUI('error');
    } finally {
      setScheduledLoading(false);
    }
  };

  // Fetch scheduled emails
  const fetchScheduledEmails = async () => {
    setScheduledLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/notifications/scheduled`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        setScheduledEmails(data.scheduled || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled emails:', error);
    } finally {
      setScheduledLoading(false);
    }
  };

  // Cancel scheduled email
  const handleCancelSchedule = async (scheduleId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/notifications/scheduled/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        setMessageNotification('✅ Schedule cancelled successfully');
        setNotificationTypeUI('success');
        fetchScheduledEmails();
      } else {
        setMessageNotification(`❌ Error: ${data.error}`);
        setNotificationTypeUI('error');
      }
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      setMessageNotification(`❌ Failed to cancel schedule: ${error.message}`);
      setNotificationTypeUI('error');
    }
  };

  // Fetch analytics for a notification
  const fetchAnalytics = async (notificationId) => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/notifications/${notificationId}/analytics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data);
      } else {
        setMessageNotification(`❌ Error: ${data.error}`);
        setNotificationTypeUI('error');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setMessageNotification(`❌ Failed to fetch analytics: ${error.message}`);
      setNotificationTypeUI('error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  return (
    <Box className="send-emails-container">
      <Box className="analytics-header">
        <h1>📧 Email Notifications & Communication Center</h1>
        <p>Send system updates, feature announcements, and messages to users</p>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        className="send-emails-tabs"
      >
        <Tab label="📧 Compose" />
        <Tab label="📋 Templates" />
        <Tab label="⏰ Schedule Send" />
        <Tab label="📊 Analytics" />
        <Tab label="📜 History" />
      </Tabs>

      {/* TAB 0: Compose Email */}
      {tabValue === 0 && (
        <Box className="send-emails-content">
          <Card className="send-emails-card">
            <CardContent>
              <h2>New Notification</h2>

              {message_notification && (
                <Alert severity={notificationType_ui} style={{ marginBottom: '20px' }}>
                  {message_notification}
                </Alert>
              )}

              {selectedTemplate && (
                <Alert severity="info" style={{ marginBottom: '20px' }}>
                  Using template: <strong>{selectedTemplate.name}</strong>
                </Alert>
              )}

              {/* Three-Column Layout: Notification Type, Recipient Type, and Select Role */}
              <Box className="form-row-three">
                <Box className="form-group">
                  <label>Notification Type *</label>
                  <FormControl fullWidth>
                    <Select
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value)}
                      MenuProps={{
                        disablePortal: true,
                        PaperProps: {
                          sx: {
                            maxHeight: '300px',
                            backgroundColor: '#0b1216',
                            border: '1px solid #34556e',
                            borderRadius: '4px',
                            marginTop: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#e9edef',
                          backgroundColor: '#0b1216',
                          '& fieldset': { borderColor: '#34556e' },
                          '&:hover fieldset': { borderColor: '#5a8fb8' },
                          '&.Mui-focused fieldset': { borderColor: '#34B7F1' },
                        },
                        '& .MuiSvgIcon-root': { color: '#34B7F1' },
                      }}
                    >
                      {NOTIFICATION_TYPES.map((type) => (
                        <MenuItem 
                          key={type.value} 
                          value={type.value}
                          sx={{
                            backgroundColor: notificationType === type.value ? 'rgba(52,183,241,0.15)' : 'transparent',
                            color: '#e9edef',
                            borderLeft: notificationType === type.value ? `4px solid ${type.color}` : '4px solid transparent',
                            paddingLeft: '12px',
                            '&:hover': {
                              backgroundColor: 'rgba(52,183,241,0.1)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: `rgba(${parseInt(type.color.slice(1,3),16)},${parseInt(type.color.slice(3,5),16)},${parseInt(type.color.slice(5,7),16)},0.2)`,
                            }
                          }}
                        >
                          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Box style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: type.color }}></Box>
                            {type.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-group">
                  <label>Who should receive this? *</label>
                  <FormControl fullWidth>
                    <Select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value)}
                      MenuProps={{
                        disablePortal: true,
                        PaperProps: {
                          sx: {
                            maxHeight: '300px',
                            backgroundColor: '#0b1216',
                            border: '1px solid #34556e',
                            borderRadius: '4px',
                            marginTop: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#e9edef',
                          backgroundColor: '#0b1216',
                          '& fieldset': { borderColor: '#34556e' },
                          '&:hover fieldset': { borderColor: '#5a8fb8' },
                          '&.Mui-focused fieldset': { borderColor: '#34B7F1' },
                        },
                        '& .MuiSvgIcon-root': { color: '#34B7F1' },
                      }}
                    >
                      {RECIPIENT_TYPES.map((type) => (
                        <MenuItem 
                          key={type.value} 
                          value={type.value}
                          sx={{
                            backgroundColor: recipientType === type.value ? 'rgba(0,168,132,0.15)' : 'transparent',
                            color: '#e9edef',
                            borderLeft: recipientType === type.value ? '4px solid #00a884' : '4px solid transparent',
                            paddingLeft: '12px',
                            '&:hover': {
                              backgroundColor: 'rgba(52,183,241,0.1)',
                            },
                          }}
                        >
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {recipientType === 'by_role' && (
                  <Box className="form-group">
                    <label>Select Role</label>
                    <FormControl fullWidth>
                      <Select
                        value={recipientRole}
                        onChange={(e) => setRecipientRole(e.target.value)}
                        MenuProps={{
                          disablePortal: true,
                          PaperProps: {
                            sx: {
                              maxHeight: '400px',
                              overflow: 'auto',
                              backgroundColor: '#0b1216',
                              border: '1px solid #34556e',
                              borderRadius: '4px',
                              marginTop: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            }
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#e9edef',
                            backgroundColor: '#0b1216',
                            '& fieldset': { borderColor: '#34556e' },
                            '&:hover fieldset': { borderColor: '#5a8fb8' },
                            '&.Mui-focused fieldset': { borderColor: '#34B7F1' },
                          },
                          '& .MuiSvgIcon-root': { color: '#34B7F1' },
                        }}
                      >
                        <MenuItem value="admin" sx={{ backgroundColor: recipientRole === 'admin' ? 'rgba(241,94,108,0.15)' : 'transparent', color: '#e9edef', borderLeft: recipientRole === 'admin' ? '4px solid #f15e6c' : '4px solid transparent', paddingLeft: '12px', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>
                          👑 Admin - Full Access
                        </MenuItem>
                        <MenuItem value="editor" sx={{ backgroundColor: recipientRole === 'editor' ? 'rgba(255,192,61,0.15)' : 'transparent', color: '#e9edef', borderLeft: recipientRole === 'editor' ? '4px solid #ffc03d' : '4px solid transparent', paddingLeft: '12px', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>
                          ✏️ Editor - Can Edit
                        </MenuItem>
                        <MenuItem value="viewer" sx={{ backgroundColor: recipientRole === 'viewer' ? 'rgba(52,183,241,0.15)' : 'transparent', color: '#e9edef', borderLeft: recipientRole === 'viewer' ? '4px solid #34B7F1' : '4px solid transparent', paddingLeft: '12px', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>
                          👁️ Viewer - View Only
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {recipientType === 'by_tier' && (
                  <Box className="form-group">
                    <label>Select Subscription Tier</label>
                    <FormControl fullWidth>
                      <Select
                        value={recipientTier}
                        onChange={(e) => setRecipientTier(e.target.value)}
                        MenuProps={{
                          disablePortal: true,
                          PaperProps: {
                            sx: {
                              maxHeight: '400px',
                              overflow: 'auto',
                              backgroundColor: '#0b1216',
                              border: '1px solid #34556e',
                              borderRadius: '4px',
                              marginTop: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            }
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#e9edef',
                            backgroundColor: '#0b1216',
                            '& fieldset': { borderColor: '#34556e' },
                            '&:hover fieldset': { borderColor: '#5a8fb8' },
                            '&.Mui-focused fieldset': { borderColor: '#34B7F1' },
                          },
                          '& .MuiSvgIcon-root': { color: '#34B7F1' },
                        }}
                      >
                        <MenuItem value="free" sx={{ backgroundColor: recipientTier === 'free' ? 'rgba(134,142,150,0.15)' : 'transparent', color: '#e9edef', borderLeft: recipientTier === 'free' ? '4px solid #868e96' : '4px solid transparent', paddingLeft: '12px', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>
                          🆓 Free - Basic Access
                        </MenuItem>
                        <MenuItem value="premium" sx={{ backgroundColor: recipientTier === 'premium' ? 'rgba(255,192,61,0.15)' : 'transparent', color: '#e9edef', borderLeft: recipientTier === 'premium' ? '4px solid #ffc03d' : '4px solid transparent', paddingLeft: '12px', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>
                          ⭐ Premium - Advanced Features
                        </MenuItem>
                        <MenuItem value="enterprise" sx={{ backgroundColor: recipientTier === 'enterprise' ? 'rgba(52,183,241,0.15)' : 'transparent', color: '#e9edef', borderLeft: recipientTier === 'enterprise' ? '4px solid #34B7F1' : '4px solid transparent', paddingLeft: '12px', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>
                          🏢 Enterprise - Full Suite
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {recipientType === 'specific_users' && (
                  <Box className="form-group">
                    <label>Select Users *</label>
                    {usersLoading ? (
                      <Box style={{ padding: '8px', textAlign: 'center' }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : availableUsers.length === 0 ? (
                      <Box style={{ padding: '8px', color: '#8696a0', fontSize: '12px' }}>
                        No users found
                      </Box>
                    ) : (
                      <Box>
                        {/* Search Input + Select All Row */}
                        <Box style={{
                          display: 'flex',
                          gap: '12px',
                          marginBottom: '8px',
                          alignItems: 'center'
                        }}>
                          {/* Search Input */}
                          <TextField
                            placeholder="Search..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            size="small"
                            sx={{
                              width: '330px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                color: '#e9edef',
                                backgroundColor: '#0b1216',
                                '& fieldset': { borderColor: '#4a5a68' },
                                '&:hover fieldset': { borderColor: '#5a6b78' },
                              },
                              '& .MuiOutlinedInput-input::placeholder': {
                                color: '#8696a0',
                                opacity: 1,
                              },
                            }}
                          />

                          {/* Select All / Deselect All */}
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                            }}
                            onClick={handleSelectAll}
                          >
                            <Checkbox
                              checked={
                                filteredUsers.length > 0 &&
                                selectedUsers.length === filteredUsers.length
                              }
                              indeterminate={
                                selectedUsers.length > 0 &&
                                selectedUsers.length < filteredUsers.length
                              }
                              onChange={handleSelectAll}
                              size="small"
                              style={{ margin: 0 }}
                            />
                            <span style={{ color: '#b4d7cc', fontSize: '12px', fontWeight: '500' }}>
                              All
                            </span>
                          </Box>
                        </Box>

                        {/* Users List */}
                        <Box style={{
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          borderRadius: '6px',
                          maxHeight: '200px',
                          width: '390px',
                          overflowY: 'auto',
                          backgroundColor: '#1a2328'
                        }}>
                          {filteredUsers.length === 0 && userSearchQuery && (
                            <Box
                              style={{
                                padding: '8px',
                                color: '#8696a0',
                                fontSize: '12px',
                                textAlign: 'center',
                              }}
                            >
                              No users match your search
                            </Box>
                          )}
                          {filteredUsers.map((user) => (
                            <Box
                              key={user.id}
                              style={{
                                padding: '6px 8px',
                                borderBottom: '1px solid #0f1b20',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                backgroundColor: isUserSelected(user.id) ? '#1a3a3a' : 'transparent'
                              }}
                              onClick={() => handleUserSelect(user.id, user.email)}
                            >
                              <Checkbox
                                checked={isUserSelected(user.id)}
                                onChange={() => handleUserSelect(user.id, user.email)}
                                size="small"
                                style={{ margin: 0, marginRight: '2px' }}
                              />
                              
                              {/* Compact Avatar */}
                              <Box
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: user.avatar_url ? 'transparent' : '#4a5a68',
                                  backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  color: '#e9edef'
                                }}
                              >
                                {!user.avatar_url && (user.full_name || user.email).charAt(0).toUpperCase()}
                              </Box>
                              
                              {/* Compact User Info */}
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  color: '#e9edef',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {user.full_name || user.email.split('@')[0]}
                                </div>
                                <div style={{
                                  color: '#8696a0',
                                  fontSize: '10px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {user.email}
                                </div>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              <Box className="form-group">
                <label>Subject/Title *</label>
                <TextField
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Important System Update"
                  multiline
                  rows={1}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Box>

              <Box className="form-group">
                <label>Message Body *</label>
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message here. Use {{variable}} for placeholders"
                  multiline
                  rows={20}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <small style={{ color: '#666', marginTop: '5px' }}>
                  Tip: Use {`{{username}}`}, {`{{date}}`}, etc. for dynamic content
                </small>
              </Box>

              <Box className="form-group">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                      />
                    }
                    label="🔴 Mark as Urgent (highlights in red)"
                  />
                </FormGroup>
              </Box>

              <Box className="form-group">
                <label>Tags (for organization)</label>
                <TextField
                  fullWidth
                  value={tags.join(', ')}
                  onChange={(e) =>
                    setTags(
                      e.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0)
                    )
                  }
                  placeholder="e.g., maintenance, feature, urgent"
                  helperText="Separate with commas"
                />
              </Box>

              <Box className="form-actions">
                <Button
                  variant="contained"
                  onClick={() => setPreviewOpen(true)}
                  sx={{
                    backgroundColor: '#95a5a6',
                    '&:hover': { backgroundColor: '#7f8c8d' }
                  }}
                >
                  Preview Email
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendEmail}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#00a884',
                    '&:hover': { backgroundColor: '#009670' }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} style={{ marginRight: '10px' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend style={{ marginRight: '8px' }} />
                      Send Email
                    </>
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 1: Templates */}
      {tabValue === 1 && (
        <Box className="send-emails-content">
          <Box style={{ marginBottom: '20px' }}>
            <h2>Email Templates</h2>
            <p>Choose a template to quickly compose your email</p>
          </Box>

          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
            {EMAIL_TEMPLATES.map((template) => (
              <Card key={template.id} className="template-card">
                <CardContent>
                  <h3>{template.name}</h3>
                  <p style={{ color: '#666', fontSize: '13px', marginBottom: '10px' }}>
                    {template.subject}
                  </p>
                  <Box style={{ marginBottom: '10px' }}>
                    <Chip label={template.category} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => applyTemplate(template)}
                    sx={{
                      backgroundColor: '#1a7a9f',
                      width: '100%',
                      '&:hover': { backgroundColor: '#2a9bb8' }
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* TAB 2: Schedule Send */}
      {tabValue === 2 && (
        <Box className="send-emails-content">
          <Card className="send-emails-card" style={{ marginBottom: '20px' }}>
            <CardContent>
              <h2>⏰ Schedule Email for Later</h2>
              <Alert severity="info" style={{ marginBottom: '15px' }}>
                Schedule emails to send at a specific date and time. The system will automatically send them at the scheduled time without you need to manually trigger it.
              </Alert>

              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <TextField
                  label="Scheduled Send Time"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#e9edef',
                      '& fieldset': { borderColor: '#34556e' },
                      '&:hover fieldset': { borderColor: '#4a7090' },
                      '&.Mui-focused fieldset': { borderColor: '#34B7F1' },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#e9edef',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#8696a0',
                      opacity: 1,
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel style={{ color: '#8696a0' }}>Timezone</InputLabel>
                  <Select 
                    value={timezone} 
                    onChange={(e) => setTimezone(e.target.value)}
                    label="Timezone"
                    MenuProps={{
                      disablePortal: true,
                      PaperProps: {
                        sx: {
                          maxHeight: '400px',
                          overflow: 'auto',
                          backgroundColor: '#0b1216',
                          border: '1px solid #34556e',
                          borderRadius: '4px',
                          marginTop: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }
                      }
                    }}
                    sx={{
                      color: '#e9edef',
                      backgroundColor: '#0b1216',
                      borderColor: '#34556e',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#34556e' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#5a8fb8' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#34B7F1' },
                      '& .MuiSvgIcon-root': { color: '#34B7F1' },
                    }}
                  >
                    <MenuItem disabled style={{ color: '#8696a0', fontWeight: 'bold' }}>🌍 UTC & GMT</MenuItem>
                    <MenuItem value="UTC" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'UTC' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>UTC (GMT+0)</MenuItem>
                    
                    <MenuItem disabled style={{ color: '#8696a0', fontWeight: 'bold', marginTop: '8px' }}>🇺🇸 Americas</MenuItem>
                    <MenuItem value="America/New_York" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'America/New_York' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>New York (EST)</MenuItem>
                    <MenuItem value="America/Chicago" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'America/Chicago' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>Chicago (CST)</MenuItem>
                    <MenuItem value="America/Denver" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'America/Denver' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>Denver (MST)</MenuItem>
                    <MenuItem value="America/Los_Angeles" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'America/Los_Angeles' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>Los Angeles (PST)</MenuItem>
                    
                    <MenuItem disabled style={{ color: '#8696a0', fontWeight: 'bold', marginTop: '8px' }}>🇪🇺 Europe</MenuItem>
                    <MenuItem value="Europe/London" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'Europe/London' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>London (GMT)</MenuItem>
                    <MenuItem value="Europe/Paris" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'Europe/Paris' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>Paris (CET)</MenuItem>
                    
                    <MenuItem disabled style={{ color: '#8696a0', fontWeight: 'bold', marginTop: '8px' }}>🌏 Asia & Pacific</MenuItem>
                    <MenuItem value="Asia/Tokyo" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'Asia/Tokyo' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>Tokyo (JST)</MenuItem>
                    <MenuItem value="Australia/Sydney" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: timezone === 'Australia/Sydney' ? 'rgba(52,183,241,0.1)' : 'transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>Sydney (AEDT)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {scheduledTime && (
                <Alert severity="success" style={{ marginBottom: '15px' }}>
                  Email will be sent on {new Date(scheduledTime).toLocaleString()}
                </Alert>
              )}

              <Box style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#1a2332', borderRadius: '6px', borderLeft: '3px solid #34B7F1' }}>
                <p style={{ fontSize: '12px', color: '#8696a0', margin: '0 0 8px 0' }}>
                  💡 <strong>How it works:</strong> Your email will be queued for sending at the scheduled time. The backend processor automatically checks every 60 seconds and sends due emails. No manual intervention needed!
                </p>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  if (!scheduledTime) {
                    setMessageNotification('Please select a scheduled time');
                    setNotificationTypeUI('error');
                    return;
                  }
                  if (!title || !message) {
                    setMessageNotification('Please fill in title and message in Compose tab first');
                    setNotificationTypeUI('error');
                    return;
                  }
                  handleScheduleEmail();
                }}
                style={{
                  background: 'linear-gradient(135deg, #34B7F1 0%, #2196F3 100%)',
                  marginTop: '10px',
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                📅 Schedule This Email
              </Button>
            </CardContent>
          </Card>

          <h3 style={{ color: '#e9edef', marginTop: '30px' }}>Scheduled Emails Queue</h3>
          {scheduledLoading ? (
            <CircularProgress />
          ) : scheduledEmails.length === 0 ? (
            <Card style={{ padding: '20px', background: '#111b21', border: '1px dashed #222', textAlign: 'center' }}>
              <p style={{ color: '#8696a0' }}>No scheduled emails yet</p>
            </Card>
          ) : (
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {scheduledEmails.map((schedule) => (
                <Card key={schedule.id} style={{ padding: '15px', background: '#111b21', border: '1px solid #222' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#34B7F1', fontWeight: 'bold', fontSize: '12px' }}>
                    {new Date(schedule.scheduled_time).toLocaleString()}
                  </p>
                  <p style={{ margin: '0 0 10px 0', color: '#e9edef', fontSize: '14px' }}>Status: <Chip label={schedule.status} size="small" /></p>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => handleCancelSchedule(schedule.id)}
                    fullWidth
                  >
                    Cancel Schedule
                  </Button>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 3: Analytics */}
      {tabValue === 3 && (
        <Box className="send-emails-content">
          <Card className="send-emails-card" style={{ marginBottom: '20px' }}>
            <CardContent>
              <h2>📊 Email Analytics & Engagement</h2>
              <Alert severity="info" style={{ marginBottom: '15px' }}>
                View detailed analytics for your email notifications including open rates, click rates, device types, and email clients.
              </Alert>

              <FormControl fullWidth style={{ marginBottom: '20px' }}>
                <InputLabel style={{ color: '#8696a0' }}>Select Notification to View Analytics</InputLabel>
                <Select
                  value={selectedAnalyticsId}
                  onChange={(e) => {
                    setSelectedAnalyticsId(e.target.value);
                    if (e.target.value) fetchAnalytics(e.target.value);
                  }}
                  label="Select Notification"
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        maxHeight: '400px',
                        overflow: 'auto',
                        backgroundColor: '#0b1216',
                        border: '1px solid #34556e',
                        borderRadius: '4px',
                        marginTop: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      }
                    }
                  }}
                  sx={{
                    color: '#e9edef',
                    backgroundColor: '#0b1216',
                    borderColor: '#34556e',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#34556e' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#5a8fb8' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#34B7F1' },
                    '& .MuiSvgIcon-root': { color: '#34B7F1' },
                  }}
                >
                  {notifications.map((notif) => (
                    <MenuItem 
                      key={notif.id} 
                      value={notif.id}
                      sx={{
                        backgroundColor: selectedAnalyticsId === notif.id ? 'rgba(52,183,241,0.1)' : 'transparent',
                        color: '#e9edef',
                        borderLeft: selectedAnalyticsId === notif.id ? '4px solid #34B7F1' : '4px solid transparent',
                        paddingLeft: '12px',
                        '&:hover': {
                          backgroundColor: 'rgba(52,183,241,0.1)',
                        },
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                        <span>{notif.title}</span>
                        <span style={{ color: '#8696a0', fontSize: '12px' }}>{new Date(notif.created_at).toLocaleDateString()}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {analyticsLoading && <CircularProgress />}

              {analyticsData && (
                <Box>
                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <Card style={{ padding: '15px', background: 'linear-gradient(135deg, rgba(52,183,241,0.1) 0%, rgba(52,183,241,0.05) 100%)', border: '1px solid #34B7F1', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#8696a0', textTransform: 'uppercase' }}>OPEN RATE</p>
                      <h3 style={{ margin: '5px 0 0 0', color: '#34B7F1', fontSize: '20px', fontWeight: 'bold' }}>
                        {analyticsData?.analytics?.open_rate?.toFixed(2) || 0}%
                      </h3>
                    </Card>
                    <Card style={{ padding: '15px', background: 'linear-gradient(135deg, rgba(0,168,132,0.1) 0%, rgba(0,168,132,0.05) 100%)', border: '1px solid #00a884', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#8696a0', textTransform: 'uppercase' }}>CLICK RATE</p>
                      <h3 style={{ margin: '5px 0 0 0', color: '#00a884', fontSize: '20px', fontWeight: 'bold' }}>
                        {analyticsData?.analytics?.click_rate?.toFixed(2) || 0}%
                      </h3>
                    </Card>
                    <Card style={{ padding: '15px', background: 'linear-gradient(135deg, rgba(241,94,108,0.1) 0%, rgba(241,94,108,0.05) 100%)', border: '1px solid #f15e6c', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#8696a0', textTransform: 'uppercase' }}>CTR</p>
                      <h3 style={{ margin: '5px 0 0 0', color: '#f15e6c', fontSize: '20px', fontWeight: 'bold' }}>
                        {analyticsData?.analytics?.click_through_rate?.toFixed(2) || 0}%
                      </h3>
                    </Card>
                    <Card style={{ padding: '15px', background: 'linear-gradient(135deg, rgba(255,204,0,0.1) 0%, rgba(255,204,0,0.05) 100%)', border: '1px solid #FFCC00', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#8696a0', textTransform: 'uppercase' }}>UNIQUE OPENS</p>
                      <h3 style={{ margin: '5px 0 0 0', color: '#FFCC00', fontSize: '20px', fontWeight: 'bold' }}>
                        {analyticsData?.analytics?.unique_opens || 0}
                      </h3>
                    </Card>
                  </Box>
                  
                  <Box style={{ padding: '15px', background: '#1a2332', borderRadius: '6px', marginTop: '15px' }}>
                    <h4 style={{ color: '#e9edef', marginTop: 0 }}>Detailed Metrics</h4>
                    <Box style={{ displayGrid: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <p style={{ margin: 0, color: '#8696a0', fontSize: '13px' }}>
                        <strong style={{ color: '#e9edef' }}>Total Sent:</strong> {analyticsData?.analytics?.total_sent || 0}
                      </p>
                      <p style={{ margin: 0, color: '#8696a0', fontSize: '13px' }}>
                        <strong style={{ color: '#e9edef' }}>Total Opened:</strong> {analyticsData?.analytics?.total_opened || 0}
                      </p>
                      <p style={{ margin: 0, color: '#8696a0', fontSize: '13px' }}>
                        <strong style={{ color: '#e9edef' }}>Total Clicks:</strong> {analyticsData?.analytics?.total_clicks || 0}
                      </p>
                      <p style={{ margin: 0, color: '#8696a0', fontSize: '13px' }}>
                        <strong style={{ color: '#e9edef' }}>Unique Click Rate:</strong> {analyticsData?.analytics?.click_rate?.toFixed(2) || 0}%
                      </p>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 4: History - Enhanced Dashboard */}
      {tabValue === 4 && (
        <Box className="send-emails-content">
          {/* Refresh and Filter Controls */}
          <Box style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Box style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  fetchNotifications();
                  fetchStats();
                }}
                disabled={notificationsLoading}
                sx={{ fontSize: '12px', padding: '4px 8px' }}
              >
                🔄 Refresh
              </Button>
              <FormControlLabel
                control={<Checkbox checked={autoRefreshEnabled} onChange={(e) => setAutoRefreshEnabled(e.target.checked)} size="small" />}
                label={<span style={{ fontSize: '12px' }}>Auto-refresh</span>}
              />
            </Box>
          </Box>

          {/* Statistics Cards - Using Dashboard Colors */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <Card style={{ padding: '12px', background: '#111b21', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.3)', border: 'none' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#8696a0', marginBottom: '6px', textTransform: 'uppercase' }}>TOTAL SENT</p>
              <h3 style={{ margin: 0, color: '#e9edef', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{notificationStats.total || 0}</h3>
              <Box style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(52,183,241,0.1)', color: '#34B7F1', width: 'fit-content' }}>
                All notifications
              </Box>
            </Card>
            <Card style={{ padding: '12px', background: '#111b21', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.3)', border: 'none' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#8696a0', marginBottom: '6px', textTransform: 'uppercase' }}>✅ SUCCESSFULLY SENT</p>
              <h3 style={{ margin: 0, color: '#e9edef', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{notificationStats.sent || 0}</h3>
              <Box style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(0,168,132,0.1)', color: '#00a884', width: 'fit-content' }}>
                Delivered
              </Box>
            </Card>
            <Card style={{ padding: '12px', background: '#111b21', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.3)', border: 'none' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#8696a0', marginBottom: '6px', textTransform: 'uppercase' }}>❌ FAILED</p>
              <h3 style={{ margin: 0, color: '#e9edef', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{notificationStats.failed || 0}</h3>
              <Box style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(241,94,108,0.1)', color: '#f15e6c', width: 'fit-content' }}>
                Delivery errors
              </Box>
            </Card>
            <Card style={{ padding: '12px', background: '#111b21', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.3)', border: 'none' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#8696a0', marginBottom: '6px', textTransform: 'uppercase' }}>⏳ PENDING RETRY</p>
              <h3 style={{ margin: 0, color: '#e9edef', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{notificationStats.pending || 0}</h3>
              <Box style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(255,204,0,0.1)', color: '#FFCC00', width: 'fit-content' }}>
                Retry tomorrow
              </Box>
            </Card>
            <Card style={{ padding: '12px', background: '#111b21', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.3)', border: 'none' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#8696a0', marginBottom: '6px', textTransform: 'uppercase' }}>📊 PARTIAL</p>
              <h3 style={{ margin: 0, color: '#e9edef', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{notificationStats.partial || 0}</h3>
              <Box style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(139,92,246,0.1)', color: '#bb86fc', width: 'fit-content' }}>
                Partial send
              </Box>
            </Card>
          </Box>

          {/* Filter Controls */}
          <Box style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl style={{ minWidth: '300px' }}>
              <InputLabel style={{ color: '#8696a0' }}>Filter by Status</InputLabel>
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                label="Filter by Status"
                MenuProps={{
                  disablePortal: true,
                  PaperProps: {
                    sx: {
                      maxHeight: '400px',
                      overflow: 'auto',
                      backgroundColor: '#0b1216',
                      border: '1px solid #34556e',
                      borderRadius: '4px',
                      marginTop: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }
                  }
                }}
                sx={{
                  color: '#e9edef',
                  backgroundColor: '#0b1216',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#34556e',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#5a8fb8',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#34B7F1',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#34B7F1',
                  },
                }}
              >
                <MenuItem disabled style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px' }}>📋 All Notifications</MenuItem>
                <MenuItem value="all" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: statusFilter === 'all' ? 'rgba(52,183,241,0.15)' : 'transparent', borderLeft: statusFilter === 'all' ? '4px solid #34B7F1' : '4px solid transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34B7F1' }}></Box>
                    All Statuses
                  </Box>
                </MenuItem>

                <MenuItem disabled style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px', marginTop: '8px' }}>✅ Successful</MenuItem>
                <MenuItem value="sent" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: statusFilter === 'sent' ? 'rgba(0,168,132,0.15)' : 'transparent', borderLeft: statusFilter === 'sent' ? '4px solid #00a884' : '4px solid transparent', '&:hover': { backgroundColor: 'rgba(0,168,132,0.1)' } }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00a884' }}></Box>
                    Successfully Sent
                  </Box>
                </MenuItem>

                <MenuItem disabled style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px', marginTop: '8px' }}>⚠️ Issues</MenuItem>
                <MenuItem value="failed" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: statusFilter === 'failed' ? 'rgba(241,94,108,0.15)' : 'transparent', borderLeft: statusFilter === 'failed' ? '4px solid #f15e6c' : '4px solid transparent', '&:hover': { backgroundColor: 'rgba(241,94,108,0.1)' } }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f15e6c' }}></Box>
                    Failed
                  </Box>
                </MenuItem>
                <MenuItem value="pending" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: statusFilter === 'pending' ? 'rgba(255,204,0,0.15)' : 'transparent', borderLeft: statusFilter === 'pending' ? '4px solid #FFCC00' : '4px solid transparent', '&:hover': { backgroundColor: 'rgba(255,204,0,0.1)' } }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFCC00' }}></Box>
                    Pending Retry
                  </Box>
                </MenuItem>
                <MenuItem value="partial" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: statusFilter === 'partial' ? 'rgba(187,134,252,0.15)' : 'transparent', borderLeft: statusFilter === 'partial' ? '4px solid #bb86fc' : '4px solid transparent', '&:hover': { backgroundColor: 'rgba(187,134,252,0.1)' } }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#bb86fc' }}></Box>
                    Partial
                  </Box>
                </MenuItem>

                <MenuItem disabled style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px', marginTop: '8px' }}>📤 In Progress</MenuItem>
                <MenuItem value="sending" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: statusFilter === 'sending' ? 'rgba(52,183,241,0.15)' : 'transparent', borderLeft: statusFilter === 'sending' ? '4px solid #34B7F1' : '4px solid transparent', '&:hover': { backgroundColor: 'rgba(52,183,241,0.1)' } }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34B7F1' }}></Box>
                    Sending
                  </Box>
                </MenuItem>
                <MenuItem value="draft" sx={{ paddingLeft: '20px', color: '#e9edef', backgroundColor: statusFilter === 'draft' ? 'rgba(149,165,166,0.15)' : 'transparent', borderLeft: statusFilter === 'draft' ? '4px solid #95a5a6' : '4px solid transparent', '&:hover': { backgroundColor: 'rgba(149,165,166,0.1)' } }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#95a5a6' }}></Box>
                    Draft
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Notifications Table */}
          {notificationsLoading ? (
            <Box style={{ textAlign: 'center', padding: '60px 20px' }}>
              <CircularProgress />
              <p style={{ color: '#999', marginTop: '10px' }}>Loading notification history...</p>
            </Box>
          ) : notifications.length === 0 ? (
            <Card style={{ padding: '40px', textAlign: 'center', background: '#111b21', border: '1px dashed #222' }}>
              <p style={{ fontSize: '16px', color: '#e9edef', margin: 0, fontWeight: 'bold' }}>📭 No notifications sent yet</p>
              <p style={{ fontSize: '13px', color: '#8696a0', margin: '5px 0 0 0' }}>Send your first email notification to get started</p>
            </Card>
          ) : (
            <TableContainer component={Paper} style={{ background: '#111b21', border: '1px solid #222' }}>
              <Table>
                <TableHead style={{ backgroundColor: '#0f1419', borderBottom: '1px solid #222' }}>
                  <TableRow>
                    <TableCell style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px' }}>Expand</TableCell>
                    <TableCell style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px' }}>Type</TableCell>
                    <TableCell style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px' }}>Subject</TableCell>
                    <TableCell style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px' }}>Status</TableCell>
                    <TableCell style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px' }}>Delivery</TableCell>
                    <TableCell style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px' }}>Sent Date</TableCell>
                    <TableCell style={{ color: '#8696a0', fontWeight: 'bold', fontSize: '12px' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(statusFilter === 'all' ? notifications : notifications.filter((n) => n.status === statusFilter)).map((notif) => (
                    <React.Fragment key={notif.id}>
                      <TableRow style={{ borderBottom: '1px solid #222', backgroundColor: expandedNotification === notif.id ? '#0f1419' : '#0a0e13' }} hover>
                        <TableCell style={{ color: '#8696a0' }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                              if (expandedNotification === notif.id) {
                                setExpandedNotification(null);
                              } else {
                                setExpandedNotification(notif.id);
                                fetchNotificationLogs(notif.id);
                              }
                            }}
                          >
                            {expandedNotification === notif.id ? '▼' : '▶'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={notif.notification_type || 'general'}
                            size="small"
                            variant="outlined"
                            style={{
                              borderColor: NOTIFICATION_TYPES.find((t) => t.value === notif.notification_type)?.color || '#666',
                              color: NOTIFICATION_TYPES.find((t) => t.value === notif.notification_type)?.color || '#999',
                            }}
                          />
                        </TableCell>
                        <TableCell style={{ color: '#e9edef' }}>
                          <strong>{notif.title || '(No Subject)'}</strong>
                          <br />
                          <small style={{ color: '#8696a0' }}>{notif.recipient_type}</small>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={notif.status || 'unknown'}
                            size="small"
                            style={{
                              backgroundColor:
                                notif.status === 'sent'
                                  ? 'rgba(0,168,132,0.15)'
                                  : notif.status === 'failed'
                                  ? 'rgba(241,94,108,0.15)'
                                  : notif.status === 'pending'
                                  ? 'rgba(255,204,0,0.15)'
                                  : notif.status === 'partial'
                                  ? 'rgba(139,92,246,0.15)'
                                  : 'rgba(134,150,160,0.15)',
                              color:
                                notif.status === 'sent'
                                  ? '#00a884'
                                  : notif.status === 'failed'
                                  ? '#f15e6c'
                                  : notif.status === 'pending'
                                  ? '#FFCC00'
                                  : notif.status === 'partial'
                                  ? '#bb86fc'
                                  : '#8696a0',
                            }}
                          />
                        </TableCell>
                        <TableCell style={{ color: '#8696a0', fontSize: '13px' }}>
                          <div style={{ color: notif.sent_count > 0 ? '#00a884' : '#f15e6c' }}>
                            <strong>{notif.sent_count || 0}</strong>
                            <span style={{ color: '#8696a0' }}>/{notif.recipient_count || 0}</span>
                          </div>
                          {notif.failed_count > 0 && <div style={{ color: '#f15e6c', fontSize: '11px' }}>Failed: {notif.failed_count}</div>}
                        </TableCell>
                        <TableCell style={{ color: '#8696a0', fontSize: '12px' }}>
                          {notif.created_at && (
                            <>
                              <div>{new Date(notif.created_at).toLocaleDateString()}</div>
                              <small style={{ color: '#5a7f8c' }}>{new Date(notif.created_at).toLocaleTimeString()}</small>
                            </>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => { setSelectedNotificationId(notif.id); setDetailsDialogOpen(true); }}>
                            📋 Details
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Delivery Logs */}
                      {expandedNotification === notif.id && (
                        <TableRow style={{ backgroundColor: '#0f1419', borderBottom: '2px solid #222' }}>
                          <TableCell colSpan={7} style={{ padding: '20px' }}>
                            <Box>
                              <h4 style={{ margin: '0 0 15px 0', color: '#34B7F1', fontSize: '14px' }}>📧 Delivery Details ({(notificationLogs[notif.id] || []).length} recipients)</h4>
                              {logsLoading[notif.id] ? (
                                <Box style={{ textAlign: 'center', padding: '20px' }}>
                                  <CircularProgress size={30} />
                                </Box>
                              ) : (notificationLogs[notif.id] || []).length === 0 ? (
                                <p style={{ color: '#8696a0', margin: 0 }}>No delivery logs yet</p>
                              ) : (
                                <Table size="small" style={{ marginTop: '10px' }}>
                                  <TableHead style={{ backgroundColor: '#0a0e13' }}>
                                    <TableRow>
                                      <TableCell style={{ color: '#5a7f8c', fontSize: '12px' }}>Email</TableCell>
                                      <TableCell style={{ color: '#5a7f8c', fontSize: '12px' }}>Status</TableCell>
                                      <TableCell style={{ color: '#5a7f8c', fontSize: '12px' }}>Message</TableCell>
                                      <TableCell style={{ color: '#5a7f8c', fontSize: '12px' }}>Sent Time</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {(notificationLogs[notif.id] || []).map((log, idx) => (
                                      <TableRow key={idx} style={{ backgroundColor: '#0a0e13' }}>
                                        <TableCell style={{ color: '#8696a0', fontSize: '12px' }}>{log.user_email || 'N/A'}</TableCell>
                                        <TableCell style={{ fontSize: '12px' }}>
                                          <Chip
                                            label={log.status || 'unknown'}
                                            size="small"
                                            style={{
                                              backgroundColor:
                                                log.status === 'sent'
                                                  ? 'rgba(0,168,132,0.15)'
                                                  : log.status === 'failed'
                                                  ? 'rgba(241,94,108,0.15)'
                                                  : log.status === 'pending'
                                                  ? 'rgba(255,204,0,0.15)'
                                                  : 'rgba(134,150,160,0.15)',
                                              color:
                                                log.status === 'sent'
                                                  ? '#00a884'
                                                  : log.status === 'failed'
                                                  ? '#f15e6c'
                                                  : log.status === 'pending'
                                                  ? '#FFCC00'
                                                  : '#8696a0',
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell style={{ color: '#8696a0', fontSize: '11px' }}>
                                          {log.error_message
                                            ? log.error_message.substring(0, 50) + (log.error_message.length > 50 ? '...' : '')
                                            : 'Delivered successfully'}
                                        </TableCell>
                                        <TableCell style={{ color: '#8696a0', fontSize: '11px' }}>
                                          {log.sent_at && new Date(log.sent_at).toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ backgroundColor: '#111b21', color: '#e9edef', borderBottom: '1px solid #222' }}>
          📋 Notification Details
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#0a0e13', color: '#e9edef' }}>
          {selectedNotificationId && notifications.find((n) => n.id === selectedNotificationId) && (
            <Box style={{ marginTop: '20px' }}>
              {(() => {
                const notif = notifications.find((n) => n.id === selectedNotificationId);
                return (
                  <>
                    <Box style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#111b21', borderRadius: '8px', border: '1px solid #222' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#8696a0', textTransform: 'uppercase' }}>
                        <strong>Title:</strong>
                      </p>
                      <p style={{ margin: 0, color: '#e9edef' }}>{notif.title}</p>

                      <p style={{ margin: '12px 0 8px 0', fontSize: '12px', color: '#8696a0', textTransform: 'uppercase' }}>
                        <strong>Type:</strong>
                      </p>
                      <p style={{ margin: 0, color: '#e9edef' }}>{notif.notification_type}</p>

                      <p style={{ margin: '12px 0 8px 0', fontSize: '12px', color: '#8696a0', textTransform: 'uppercase' }}>
                        <strong>Recipients:</strong>
                      </p>
                      <p style={{ margin: 0, color: '#e9edef' }}>{notif.recipient_type} ({notif.recipient_count} total)</p>

                      <p style={{ margin: '12px 0 8px 0', fontSize: '12px', color: '#8696a0', textTransform: 'uppercase' }}>
                        <strong>Status:</strong>
                      </p>
                      <Chip 
                        label={notif.status} 
                        style={{ marginTop: '5px' }}
                      />

                      <p style={{ margin: '12px 0 8px 0', fontSize: '12px', color: '#8696a0', textTransform: 'uppercase' }}>
                        <strong>Delivery Summary:</strong>
                      </p>
                      <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(0,168,132,0.15)', borderRadius: '4px', border: '1px solid rgba(0,168,132,0.3)' }}>
                          <p style={{ margin: 0, fontSize: '12px', color: '#8696a0' }}>Sent</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#00a884', fontWeight: 'bold' }}>
                            {notif.sent_count || 0}/{notif.recipient_count || 0}
                          </p>
                        </div>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(241,94,108,0.15)', borderRadius: '4px', border: '1px solid rgba(241,94,108,0.3)' }}>
                          <p style={{ margin: 0, fontSize: '12px', color: '#8696a0' }}>Failed</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#f15e6c', fontWeight: 'bold' }}>
                            {notif.failed_count || 0}
                          </p>
                        </div>
                      </Box>

                      <p style={{ margin: '12px 0 8px 0', fontSize: '12px', color: '#8696a0', textTransform: 'uppercase' }}>
                        <strong>Created:</strong>
                      </p>
                      <p style={{ margin: 0, color: '#e9edef', fontSize: '13px' }}>
                        {notif.created_at && new Date(notif.created_at).toLocaleString()}
                      </p>
                    </Box>
                  </>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#111b21', borderTop: '1px solid #222' }}>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Email Preview</DialogTitle>
        <DialogContent>
          <Box style={{ marginTop: '15px' }}>
            <Box style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>
                <strong>From:</strong> Somalux &lt;admin@somalux.com&gt;
              </p>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>
                <strong>Subject:</strong> {title || '(No subject)'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                <strong>Recipients:</strong> {recipientType === 'all_users' ? 'All Users' : recipientType}
              </p>
            </Box>

            <Box style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
              <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px' }}>
                {message || '(Empty message)'}
              </p>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendEmails;
