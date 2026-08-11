'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  useGetMeQuery, 
  useUpdateMeMutation, 
  useChangePasswordMutation 
} from '@/store/services/apiService';
import { supabase } from '@/lib/supabase';

// ─── Shared Styles ────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '8px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#1E293B', outline: 'none', boxSizing: 'border-box' };
const disabledInputStyle: React.CSSProperties = { ...inputStyle, backgroundColor: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' };

const TABS = ['Profile', 'Security', 'Notifications', 'Preferences'];

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div style={{ paddingBottom: '64px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '6px' }}>Account Settings</h1>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>Manage your profile and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        {/* Sidebar Nav */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px',
                  borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? '#EFF4FF' : 'transparent',
                  color: isActive ? '#0B1F3A' : '#64748B',
                  borderLeft: isActive ? '3px solid #0B1F3A' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.color = '#0B1F3A';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, maxWidth: '640px' }}>
          {activeTab === 'Profile' && <ProfileTab />}
          {activeTab === 'Security' && <SecurityTab />}
          {activeTab === 'Notifications' && <NotificationsTab />}
          {activeTab === 'Preferences' && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ────────────────────────────────────────────────────────────
function ProfileTab() {
  const { data: user, isLoading } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  if (isLoading) return <div style={{ padding: '24px', color: '#6B7280', fontSize: '13px' }}>Loading profile...</div>;
  if (!user) return null;

  const handleSave = async () => {
    try {
      await updateMe({ name, phone, avatarUrl }).unwrap();
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setAvatarUrl(user.avatarUrl || '');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
      
      setAvatarUrl(publicUrlData.publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (n: string) => n.split(' ').map(part => part[0]).join('').substring(0,2).toUpperCase();

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '32px' }}>
      
      {/* Avatar Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#0B1F3A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, overflow: 'hidden' }}>
            {avatarUrl ? (
               <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
               getInitials(name || user.name)
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#0B1F3A' }}>
            {isUploading ? (
              <span style={{ fontSize: '10px' }}>...</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            )}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F3A', marginBottom: '4px' }}>{name || user.name}</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>{user.role}</div>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            Email Address
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01" stroke="#FFF"/></svg>
          </label>
          <input value={user.email} disabled style={disabledInputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Role</label>
          <input value={user.role} disabled style={disabledInputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={inputStyle} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button onClick={handleCancel} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'none', fontSize: '13px', fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={isUpdating} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0B1F3A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: isUpdating ? 'not-allowed' : 'pointer', opacity: isUpdating ? 0.7 : 1 }}>
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ─── Security Tab ───────────────────────────────────────────────────────────
function SecurityTab() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSave = async () => {
    if (newPassword !== confirmPassword) return alert("New passwords don't match");
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      alert('Password updated successfully');
      setCurrent(''); setNew(''); setConfirm('');
    } catch (err: any) {
      alert(err?.data?.error || 'Failed to update password');
    }
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '32px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F3A', marginBottom: '24px' }}>Change Password</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        <div>
          <label style={labelStyle}>Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrent(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>New Password</label>
          <input type="password" value={newPassword} onChange={e => setNew(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirm(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={isLoading || !currentPassword || !newPassword} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0B1F3A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: (isLoading || !currentPassword || !newPassword) ? 'not-allowed' : 'pointer', opacity: (isLoading || !currentPassword || !newPassword) ? 0.5 : 1 }}>
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}

// ─── Notifications Tab ──────────────────────────────────────────────────────
function NotificationsTab() {
  const { data: user, isLoading } = useGetMeQuery();
  const [updateMe] = useUpdateMeMutation();

  const [prefs, setPrefs] = useState({
    emailNewCases: true,
    emailDailySummary: false,
    emailSecurity: true,
    inAppAlerts: true
  });

  useEffect(() => {
    if (user?.notificationPrefs) {
      setPrefs(user.notificationPrefs);
    }
  }, [user]);

  if (isLoading) return null;

  const togglePref = async (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    await updateMe({ notificationPrefs: newPrefs });
  };

  const Toggle = ({ label, desc, checked, onChange }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{desc}</div>
      </div>
      <div onClick={onChange} style={{ width: '40px', height: '22px', borderRadius: '999px', background: checked ? '#0B1F3A' : '#E2E8F0', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#FFF', position: 'absolute', top: '2px', left: checked ? '20px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
      </div>
    </div>
  );

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '32px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F3A', marginBottom: '8px' }}>Email Notifications</h3>
      <div style={{ marginBottom: '32px' }}>
        <Toggle label="New Case Assignments" desc="Get notified when a new case is assigned to you." checked={prefs.emailNewCases} onChange={() => togglePref('emailNewCases')} />
        <Toggle label="Daily Summary" desc="Receive a daily morning summary of active alerts." checked={prefs.emailDailySummary} onChange={() => togglePref('emailDailySummary')} />
        <Toggle label="Security Alerts" desc="Critical security alerts regarding your account." checked={prefs.emailSecurity} onChange={() => togglePref('emailSecurity')} />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F3A', marginBottom: '8px' }}>In-App Notifications</h3>
      <div>
        <Toggle label="Push Alerts" desc="Receive real-time push alerts while using the portal." checked={prefs.inAppAlerts} onChange={() => togglePref('inAppAlerts')} />
      </div>
    </div>
  );
}

// ─── Preferences Tab ────────────────────────────────────────────────────────
function PreferencesTab() {
  const { data: user, isLoading } = useGetMeQuery();
  const [updateMe] = useUpdateMeMutation();

  const [prefs, setPrefs] = useState({ theme: 'System', timezone: 'UTC' });

  useEffect(() => {
    if (user?.systemPrefs) setPrefs(user.systemPrefs);
  }, [user]);

  if (isLoading) return null;

  const handleChange = async (key: string, val: string) => {
    const newPrefs = { ...prefs, [key]: val };
    setPrefs(newPrefs);
    await updateMe({ systemPrefs: newPrefs });
  };

  const selectStyle = { ...inputStyle, appearance: 'none' as any, backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer' };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={labelStyle}>Theme</label>
          <select value={prefs.theme} onChange={e => handleChange('theme', e.target.value)} style={selectStyle}>
            <option value="Light">Light</option>
            <option value="Dark">Dark</option>
            <option value="System">System Default</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Timezone</label>
          <select value={prefs.timezone} onChange={e => handleChange('timezone', e.target.value)} style={selectStyle}>
            <option value="UTC">UTC (Universal Coordinated Time)</option>
            <option value="EST">EST (Eastern Standard Time)</option>
            <option value="PST">PST (Pacific Standard Time)</option>
            <option value="IST">IST (Indian Standard Time)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
