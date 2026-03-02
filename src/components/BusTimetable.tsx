import React from 'react';
import { Bus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function BusTimetable() {
  const morningBus = {
    stop1: ['07:35', '07:40', '07:50', '08:00', '08:10'],
    stop2: ['07:37', '07:45', '07:55', '08:05', '08:10'],
  };

  const afternoonBus = [
    '12:50', '12:55', '13:00', '13:05', '13:25', '13:35',
    '13:55', '14:05', '14:45', '14:50', '14:55', '15:00'
  ];

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold serif">스쿨버스 시간표</h2>
        <span className="text-xs font-medium text-brand-ink/40 uppercase tracking-widest flex items-center gap-2">
          <Bus size={14} />
          Bus Schedule
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 등교 시간표 */}
        <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-accent mb-2">
            <ArrowUpCircle size={20} />
            <h3 className="font-semibold serif text-lg">등교 (Going to School)</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-tighter leading-tight">
                1단지 새싹정류장
              </div>
              <div className="flex flex-wrap gap-2">
                {morningBus.stop1.map(time => (
                  <span key={time} className="px-3 py-1 bg-brand-bg rounded-full text-xs font-medium border border-black/5">
                    {time}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-tighter leading-tight">
                2단지 새싹정류장
              </div>
              <div className="flex flex-wrap gap-2">
                {morningBus.stop2.map(time => (
                  <span key={time} className="px-3 py-1 bg-brand-bg rounded-full text-xs font-medium border border-black/5">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 하교 시간표 */}
        <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <ArrowDownCircle size={20} />
            <h3 className="font-semibold serif text-lg">하교 (Coming Home)</h3>
          </div>
          
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-tighter leading-tight">
              늘푸른유치원 앞 어린이 승하차 구역
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {afternoonBus.map(time => (
                <span key={time} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-100 text-center">
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
