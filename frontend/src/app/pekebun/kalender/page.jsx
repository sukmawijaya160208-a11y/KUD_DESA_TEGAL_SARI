'use client';

import { useState } from 'react';
import { CalendarDays } from '@/lib/animated-icons';
import { Calendar } from '@/components/ui/calendar';
import Card from '@/components/ui/Card';

export default function PekebunKalenderPage() {
  const [date, setDate] = useState(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kalender</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kalender kegiatan pekebun</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="mx-auto"
          />
        </Card>

        <div className="space-y-4">
          <Card title="Tanggal Dipilih">
            {date ? (
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {date.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">Silakan pilih tanggal pada kalender</p>
            )}
          </Card>

          <Card title="Kegiatan">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3">
                <CalendarDays className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">Belum ada kegiatan</p>
              <p className="text-gray-400 text-sm mt-1">Fitur kalender akan segera tersedia</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
