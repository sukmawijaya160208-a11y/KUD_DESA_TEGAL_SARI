'use client';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  EnvelopeIcon,
  CameraIcon,
  AtSymbolIcon,
  GlobeAltIcon,
  MapPinIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

const INFO_FIELDS = [
  { key: 'kontak', label: 'Kontak', icon: PhoneIcon, color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
  { key: 'email', label: 'Email', icon: EnvelopeIcon, color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
  { key: 'instagram', label: 'Instagram', icon: CameraIcon, color: 'text-pink-500', bgColor: 'bg-pink-100' },
  { key: 'facebook', label: 'Facebook', icon: AtSymbolIcon, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { key: 'website', label: 'Website', icon: GlobeAltIcon, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  { key: 'alamat', label: 'Alamat', icon: MapPinIcon, color: 'text-slate-500', bgColor: 'bg-slate-100' },
];

function getHref(key, value) {
  if (!value) return null;
  switch (key) {
    case 'kontak':
      return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    case 'email':
      return `mailto:${value}`;
    case 'instagram':
      return `https://instagram.com/${value.replace('@', '')}`;
    case 'facebook':
      return `https://facebook.com/${value}`;
    case 'website':
      return value.startsWith('http') ? value : `https://${value}`;
    default:
      return null;
  }
}

export default function InfoCards({ data }) {
  if (!data) return null;

  const fields = INFO_FIELDS.filter((f) => data[f.key]);

  if (fields.length === 0) return null;

  return (
    <section className="pb-16 lg:pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {fields.map((field, index) => {
            const value = data[field.key];
            const Icon = field.icon;
            const href = getHref(field.key, value);
            const isClickable = field.key !== 'alamat' && href;

            const cardContent = (
              <div className="flex items-start gap-4 p-5">
                <div className={`shrink-0 w-11 h-11 rounded-xl ${field.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${field.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800 break-words">
                    {value}
                  </p>
                </div>
                {isClickable && (
                  <ArrowUpRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-2" />
                )}
              </div>
            );

            return (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                {isClickable ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-xl border border-gray-200/70 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                  >
                    {cardContent}
                  </a>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200/70">
                    {cardContent}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
