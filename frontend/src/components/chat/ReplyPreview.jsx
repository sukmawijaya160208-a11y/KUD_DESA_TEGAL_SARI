'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ReplyPreview({ message, onCancel }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 border-l-4 border-wa-primary rounded-t-xl">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-wa-primary">Balas pesan</p>
        <p className="text-xs text-gray-500 truncate">
          {message.attachment
            ? message.attachment.type?.startsWith('image/') ? '[Foto]'
              : message.attachment.type?.startsWith('audio/') ? '[Pesan Suara]'
              : '[File]'
            : message.message || ''}
        </p>
      </div>
      <button onClick={onCancel} className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer shrink-0">
        <XMarkIcon className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
