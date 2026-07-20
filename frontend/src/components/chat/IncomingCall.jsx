'use client';

import { motion } from 'framer-motion';
import { PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCall } from './CallProvider';

export default function IncomingCall() {
  const { incoming, answerCall, rejectCall } = useCall();

  if (incoming.length === 0) return null;

  const call = incoming[0];
  const caller = call.caller;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-wa-primary to-wa-primary-dark text-white px-6 py-5 shadow-2xl"
    >
      <div className="max-w-md mx-auto flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
          {caller?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{caller?.name || 'Seseorang'}</h3>
          <p className="text-sm text-white/70">
            Panggilan {call.type === 'video' ? 'video' : 'suara'} masuk...
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => rejectCall(call.id)}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={() => answerCall(call)}
            className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <PhoneIcon className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
