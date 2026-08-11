'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  useCreateAnnouncementMutation, 
  useUpdateAnnouncementMutation,
  useGetAnnouncementByIdQuery 
} from '@/store/services/apiService';
import { supabase } from '@/lib/supabase';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Link from 'next/link';

export default function AnnouncementFormScreen() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const id = params?.id as string;

  const { data: existingData, isLoading: isFetching } = useGetAnnouncementByIdQuery(id, { skip: !isEdit });
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Update');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit && existingData) {
      setTitle(existingData.title);
      setCategory(existingData.category);
      setMessage(existingData.message);
    }
  }, [isEdit, existingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = existingData?.imageUrl || ''; // Keep old image by default if editing

    if (file) {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `announcements/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please ensure the "images" bucket exists and is public.');
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
        
      imageUrl = publicUrlData.publicUrl;
      setUploading(false);
    }

    try {
      if (isEdit) {
        await updateAnnouncement({ id, data: { title, category, message, imageUrl } }).unwrap();
      } else {
        await createAnnouncement({ title, category, message, imageUrl }).unwrap();
      }
      router.push('/announcements');
    } catch (err) {
      console.error('Failed to save announcement:', err);
      alert('Failed to save announcement. Check console.');
    }
  };

  const isSaving = isCreating || isUpdating || uploading;

  if (isEdit && isFetching) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6B7280' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '64px' }}>
      <Link href="/announcements" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', textDecoration: 'none', fontSize: '13px', marginBottom: '32px', fontWeight: 500 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Announcements
      </Link>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0B1F3A', marginBottom: '24px' }}>
          {isEdit ? 'Edit Announcement' : 'Create Announcement'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input 
            label="Title" 
            placeholder="Announcement Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
            >
              <option value="Update">Update</option>
              <option value="Important">Important</option>
              <option value="Milestone">Milestone</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>Message</label>
            <textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              rows={8}
              required
              placeholder="Write your announcement here..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>Image Attachment (Optional)</label>
            {isEdit && existingData?.imageUrl && !file && (
              <div style={{ marginBottom: '12px', fontSize: '12px', color: '#6B7280' }}>
                Currently attached: <a href={existingData.imageUrl} target="_blank" rel="noreferrer" style={{ color: '#3B82F6' }}>View Image</a>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                } else {
                  setFile(null);
                }
              }}
              style={{ fontSize: '13px' }}
            />
            {isEdit && <div style={{ marginTop: '6px', fontSize: '11px', color: '#9CA3AF' }}>Selecting a new image will replace the existing one.</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Link href={isEdit ? `/announcements/${id}` : "/announcements"} style={{ textDecoration: 'none' }}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {uploading ? 'Uploading Image...' : isEdit ? (isUpdating ? 'Saving...' : 'Save Changes') : (isCreating ? 'Publishing...' : 'Publish Announcement')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
