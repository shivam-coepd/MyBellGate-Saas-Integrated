import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../services/api';
import { requestFirebasePermission, onMessageListener } from '../services/fcmService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  action_url: string | null;
  reference_id: number | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  visitor_request:          { icon: '🚶', color: '#6366f1' },
  visitor_status:           { icon: '🚪', color: '#8b5cf6' },
  visitor_pre_approval:     { icon: '✅', color: '#10b981' },
  ticket_created:           { icon: '🎫', color: '#f59e0b' },
  ticket_assigned:          { icon: '📋', color: '#f97316' },
  invoice_generated:        { icon: '💵', color: '#0ea5e9' },
  payment_received:         { icon: '💳', color: '#22c55e' },
  notice_created:           { icon: '📢', color: '#3b82f6' },
  announcement_created:     { icon: '📣', color: '#a855f7' },
  poll_created:             { icon: '🗳️', color: '#ec4899' },
  amenity_booking_requested:{ icon: '🏊', color: '#14b8a6' },
  booking_status_updated:   { icon: '📅', color: '#64748b' },
  security_alert:           { icon: '🚨', color: '#ef4444' },
  general:                  { icon: '🔔', color: '#6b7280' },
};

function getTypeInfo(type: string) {
  return TYPE_ICON[type] ?? TYPE_ICON['general'];
}

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationBell: React.FC = () => {
  const [open, setOpen]                 = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [loading, setLoading]           = useState(false);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef  = useRef<HTMLButtonElement>(null);
  const LIMIT = 12;

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async (pageNum = 1, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await apiClient.getNotifications({ page: pageNum, limit: LIMIT });
      const items: Notification[] = Array.isArray(res.data) ? res.data : [];
      setNotifications(prev => reset ? items : [...prev, ...items]);
      setHasMore(items.length === LIMIT);
    } catch (e) {
      console.error('[NotificationBell] fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiClient.getUnreadNotificationCount();
      setUnreadCount((res.data as any)?.count ?? 0);
    } catch (e) {
      // silently fail
    }
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for real-time feel as fallback
    const interval = setInterval(fetchUnreadCount, 30_000);
    
    // Setup FCM
    requestFirebasePermission();
    
    const listenForMessages = async () => {
      try {
        const payload = await onMessageListener();
        console.log("Foreground notification received:", payload);
        // Refresh notifications when message is received
        fetchUnreadCount();
        if (open) {
          setPage(1);
          fetchNotifications(1, true);
        }
        // Rekindle listener
        listenForMessages();
      } catch (err) {
        console.log("Failed to listen for messages", err);
      }
    };
    
    listenForMessages();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      setPage(1);
      fetchNotifications(1, true);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current  && !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = async (n: Notification) => {
    if (!n.is_read) {
      try {
        await apiClient.markNotificationRead(n.id);
        setNotifications(prev =>
          prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x)
        );
        setUnreadCount(c => Math.max(0, c - 1));
      } catch (e) {
        console.error('[NotificationBell] mark read error:', e);
      }
    }
    if (n.action_url) window.location.href = n.action_url;
  };

  const markAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(prev => prev.map(x => ({ ...x, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {
      console.error('[NotificationBell] mark all read error:', e);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNotifications(next);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        ref={bellRef}
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: open ? 'rgba(99,102,241,0.1)' : 'transparent',
          border: 'none',
          borderRadius: '12px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={open ? '#6366f1' : '#64748b'} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '6px', right: '6px',
            background: '#ef4444',
            color: '#fff',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: 700,
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            lineHeight: 1,
            border: '2px solid #fff',
            animation: 'pulse 2s infinite',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          id="notification-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '380px',
            maxWidth: '95vw',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {notifications.length === 0 && !loading ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '48px 24px', color: '#94a3b8',
              }}>
                <span style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</span>
                <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>All caught up!</p>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>No notifications yet.</p>
              </div>
            ) : (
              <>
                {notifications.map(n => {
                  const { icon, color } = getTypeInfo(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '14px 20px',
                        cursor: n.action_url ? 'pointer' : 'default',
                        background: n.is_read ? '#fff' : '#f8f7ff',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s',
                        borderLeft: n.is_read ? 'none' : `3px solid ${color}`,
                      }}
                    >
                      {/* Icon Badge */}
                      <div style={{
                        width: '40px', height: '40px', flexShrink: 0,
                        background: `${color}18`,
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px',
                      }}>
                        {icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: '0 0 2px',
                          fontSize: '13px',
                          fontWeight: n.is_read ? 500 : 700,
                          color: '#1e293b',
                          lineHeight: 1.4,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {n.title}
                        </p>
                        <p style={{
                          margin: '0 0 4px',
                          fontSize: '12px',
                          color: '#64748b',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {timeAgo(n.created_at)}
                        </span>
                      </div>

                      {/* Unread dot */}
                      {!n.is_read && (
                        <div style={{
                          width: '8px', height: '8px',
                          borderRadius: '50%',
                          background: color,
                          flexShrink: 0,
                          marginTop: '6px',
                        }} />
                      )}
                    </div>
                  );
                })}

                {/* Load more */}
                {hasMore && (
                  <div style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      style={{
                        background: 'transparent',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#6366f1',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? 'Loading…' : 'Load more'}
                    </button>
                  </div>
                )}

                {loading && notifications.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading notifications…
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
