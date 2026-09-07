/** Uploads package media and stores a durable API URL, with optional URL entry. */
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { api } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';

export function LensMediaInput({ label, value = '', kind = 'image', onChange, onBusyChange }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const upload = async (file) => {
    if (!file) return;
    const allowed =
      kind === 'video' ? ['video/mp4', 'video/webm'] : ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type) || file.size > 12 * 1024 * 1024) {
      toast.error('Choose a supported ' + kind + ' up to 12 MB.');
      return;
    }
    setBusy(true);
    onBusyChange?.(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await api.post('/admin/lens-media', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const path = response.data.data.url;
      const base = api.defaults.baseURL || '';
      onChange(/^https?:\/\//.test(base) ? new URL(path, base).href : path);
      toast.success('Media uploaded. Save the package to publish this change.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to upload media.');
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  };
  return (
    <div className="space-y-2 rounded-xl border border-navy-200 p-3">
      <Input
        label={label + ' URL'}
        value={value}
        disabled={busy}
        onChange={(event) => onChange(event.target.value)}
      />
      <label className="block text-sm font-medium text-brand-700">
        Upload {label.toLowerCase()}
        <input
          className="mt-2 block w-full text-xs"
          type="file"
          disabled={busy}
          accept={kind === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
          onChange={(event) => {
            upload(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      <p className="text-xs text-navy-500">
        {busy
          ? 'Uploading…'
          : kind === 'video'
            ? 'MP4 or WebM, up to 12 MB.'
            : 'JPG, PNG or WebP, up to 12 MB.'}
      </p>
      {value && (
        <>
          {kind === 'video' ? (
            <video controls preload="metadata" src={value} className="max-h-40 w-full rounded-lg">
              <track kind="captions" />
            </video>
          ) : (
            <img
              src={value}
              alt={label + ' preview'}
              className="max-h-32 w-full rounded-lg object-contain"
            />
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onChange('')}
          >
            Remove media
          </Button>
        </>
      )}
    </div>
  );
}
