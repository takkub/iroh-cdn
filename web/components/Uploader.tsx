'use client';
import { useEffect, useRef, useState } from 'react';

// Use production API endpoint (updated from env)
const API = 'https://apiupload.sabuytube.xyz';

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  totalSizeGB: string;
  disk: {
    size?: string;
    used?: string;
    available?: string;
    usedPercent?: string;
    error?: string;
  };
}
function smartDecodeName(input: string): string {
    if (!input) return input;

    // ถ้ามี %xx ให้ลองถอดรหัสแบบ URI ก่อน
    if (/%[0-9A-Fa-f]{2}/.test(input)) {
        try { return decodeURIComponent(input); } catch {}
    }

    // ถ้าเป็นอาการ mojibake (à¸ …) ให้ลองแก้แบบ UTF-8->Latin1
    const looksMojibake = /[à-ÿ]/.test(input);
    if (looksMojibake) {
        try { return decodeURIComponent(escape(input)); } catch {}
    }

    return input;
}
// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function Uploader() {
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      const res = await fetch(`${API}/assets`, { cache: 'no-store' });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setSelectedIds(new Set()); // Clear selection after refresh
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setItems([]);
    }
  }

  async function refreshStats() {
    try {
      const res = await fetch(`${API}/assets/stats/storage`, { cache: 'no-store' });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  useEffect(() => {
    refresh();
    refreshStats();
  }, []);

  function onPick() { inputRef.current?.click(); }

  function upload(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    const form = new FormData();
    form.append('file', file);
    setBusy(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.timeout = 2 * 60 * 60 * 1000; // 2 hours
    xhr.open('POST', `${API}/assets`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      setBusy(false);
      setProgress(0);
      if (xhr.status >= 200 && xhr.status < 300) {
        refresh();
        refreshStats();
      } else {
        alert(`อัปโหลดล้มเหลว: ${xhr.statusText}`);
      }
    };

    xhr.onerror = () => {
      setBusy(false);
      setProgress(0);
      alert('อัปโหลดล้มเหลว: เครือข่ายขัดข้อง หรือไฟล์ใหญ่เกินไป');
    };

    xhr.ontimeout = () => {
      setBusy(false);
      setProgress(0);
      alert('อัปโหลดล้มเหลว: ใช้เวลานานเกินไป (timeout 2 ชั่วโมง)');
    };

    xhr.send(form);
  }

  async function deleteFile(id: string) {
    if (!confirm('คุณต้องการลบไฟล์นี้ใช่หรือไม่?')) return;

    try {
      const res = await fetch(`${API}/assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        refresh();
        refreshStats();
      } else {
        alert('ลบไฟล์ไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('เกิดข้อผิดพลาดในการลบไฟล์');
    }
  }

  async function deleteSelected() {
    if (selectedIds.size === 0) {
      alert('กรุณาเลือกไฟล์ที่ต้องการลบ');
      return;
    }

    if (!confirm(`คุณต้องการลบ ${selectedIds.size} ไฟล์ใช่หรือไม่?`)) return;

    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`${API}/assets/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      refresh();
      refreshStats();
      alert(`ลบ ${selectedIds.size} ไฟล์สำเร็จ`);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('เกิดข้อผิดพลาดในการลบไฟล์');
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(it => it.id)));
    }
  }

  return (
    <div className="space-y-6">
      {/* Storage Stats */}
      {stats && (
        <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur shadow-soft border border-white/10">
          <h2 className="text-xl font-semibold mb-4">💾 พื้นที่จัดเก็บ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs opacity-70">ไฟล์ทั้งหมด</div>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs opacity-70">ขนาดรวม</div>
              <div className="text-2xl font-bold">{stats.totalSizeGB} GB</div>
            </div>
            {stats.disk?.available && (
              <>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-xs opacity-70">พื้นที่ว่าง</div>
                  <div className="text-2xl font-bold text-green-400">{stats.disk.available}</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-xs opacity-70">ใช้ไปแล้ว</div>
                  <div className="text-2xl font-bold text-orange-400">{stats.disk.usedPercent}</div>
                </div>
              </>
            )}
          </div>
          {stats.disk?.size && (
            <div className="mt-3 text-xs opacity-60">
              📊 Disk: {stats.disk.used} / {stats.disk.size}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl p-6 bg-white/5 backdrop-blur shadow-soft border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Upload</h2>
            <p className="text-sm opacity-70">ลาก‑วางไฟล์ หรือเลือกจากเครื่อง</p>
          </div>
          <button onClick={onPick}
            className="px-4 py-2 rounded-xl bg-[var(--brand)] hover:bg-indigo-600 transition shadow-soft">
            เลือกไฟล์
          </button>
          <input ref={inputRef} type="file" hidden onChange={e => upload(e.target.files)} />
        </div>
        {busy && (
          <div className="mt-4">
            <div className="text-sm mb-2">กำลังอัปโหลด... {progress}%</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6 bg-white/5 backdrop-blur shadow-soft border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">ล่าสุด ({items.length} ไฟล์)</h2>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition">
                ลบที่เลือก ({selectedIds.size})
              </button>
            )}
            <button onClick={() => { refresh(); refreshStats(); }}
              className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
              รีเฟรช
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-black/20 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">เลือกทั้งหมด</span>
            </label>
            {selectedIds.size > 0 && (
              <span className="text-sm opacity-70 ml-auto">
                เลือกแล้ว {selectedIds.size} จาก {items.length} ไฟล์
              </span>
            )}
          </div>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <li key={it.id} className={`p-4 rounded-xl border transition ${
              selectedIds.has(it.id) 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-white/10 bg-black/20'
            }`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(it.id)}
                  onChange={() => toggleSelect(it.id)}
                  className="w-5 h-5 rounded mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate mb-1" title={smartDecodeName(it.filename)}>
                    📄 {smartDecodeName(it.filename)}
                  </div>
                  <div className="text-xs opacity-70 space-y-1">
                    <div>ขนาด: {formatFileSize(it.size)}</div>
                    <div>{new Date(it.createdAt).toLocaleString('th-TH', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 transition inline-flex items-center gap-1 flex-1 justify-center"
                      href={`${API}/assets/${it.cid}/content`}
                      download={decodeURIComponent(it.filename)}>
                      <span>⬇</span> ดาวน์โหลด
                    </a>
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 transition inline-flex items-center gap-1"
                      onClick={() => deleteFile(it.id)}>
                      <span>🗑</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <div className="text-center py-12 opacity-70 text-sm">
              ยังไม่มีไฟล์ ลองอัปโหลดไฟล์ใหม่
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

