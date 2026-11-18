'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface QrCodeModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: 'blue' | 'emerald' | 'purple' | 'slate';
  url: string;
}

export default function QrCodeModal({
  open,
  onClose,
  title,
  subtitle,
  badgeText,
  badgeColor = 'slate',
  url,
}: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !url) return;
    QRCode.toDataURL(url, { width: 320, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [open, url]);

  if (!open) return null;

  const badgeCls =
    badgeColor === 'blue'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : badgeColor === 'emerald'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : badgeColor === 'purple'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-slate-100 text-slate-800 border-slate-200';

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Bağlantı kopyalandı!');
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 relative">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 absolute right-4 top-4 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {badgeText && (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${badgeCls}`}>
            {badgeText}
          </span>
        )}
        <h3 className="text-lg font-bold text-slate-900 pr-8">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}

        <div className="mt-5 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 p-5">
          {dataUrl ? (
            <img src={dataUrl} alt={title} className="w-56 h-56 rounded-xl bg-white p-2 shadow-xs" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
              QR oluşturuluyor...
            </div>
          )}
          <p className="mt-3 text-[11px] text-slate-500 break-all text-center line-clamp-2">{url}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopyalandı' : 'Linki Kopyala'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!dataUrl}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            QR PNG İndir
          </button>
        </div>
      </div>
    </div>
  );
}
