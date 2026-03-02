import React, { useState, useEffect } from 'react';
import { DayOfWeek, ScheduleItem } from '../types';
import { DAYS, TIME_SLOTS } from '../constants';
import { motion } from 'motion/react';

interface TimetableProps {
  items: ScheduleItem[];
  onEdit: (item: ScheduleItem) => void;
  selectedDay: DayOfWeek;
}

export default function Timetable({ items, onEdit, selectedDay }: TimetableProps) {
  const getItemsForDay = (day: DayOfWeek) => {
    return items.filter((item) => item.day === day);
  };

  const calculatePosition = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startOffset = (startH - 8) * 60 + startM;
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    
    return {
      top: `${(startOffset / 60) * 160 + 2}px`, // Add 2px top offset for gap
      height: `${(duration / 60) * 160 - 4}px`, // Subtract 4px for vertical gap
    };
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimePosition = () => {
    const h = now.getHours();
    const m = now.getMinutes();
    if (h < 8 || h >= 19) return null;
    
    const offset = (h - 8) * 60 + m;
    return `${(offset / 60) * 160}px`;
  };

  const currentTimePos = getCurrentTimePosition();

  return (
    <div className="w-full overflow-x-auto md:overflow-x-visible bg-white rounded-3xl shadow-sm border border-black/5 p-4 md:p-8 no-scrollbar">
      <div className="min-w-full md:min-w-[1000px]">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[80px_repeat(5,1fr)] mb-6">
          <div />
          {DAYS.map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-brand-ink/60 uppercase tracking-widest py-3">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="relative grid grid-cols-[60px_1fr] md:grid-cols-[80px_repeat(5,1fr)] border-t border-l border-black/5">
          {/* Time Column */}
          <div className="flex flex-col">
            {TIME_SLOTS.map((time) => (
              <div key={time} className="h-[80px] border-b border-r border-black/5 text-[10px] md:text-[11px] font-medium text-brand-ink/40 p-1 md:p-2 flex items-start justify-center">
                {time}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {DAYS.map((day) => (
            <div 
              key={day} 
              className={`relative h-full border-r border-black/5 ${
                day !== selectedDay ? 'hidden md:block' : 'block'
              }`}
            >
              {/* Grid Lines */}
              {TIME_SLOTS.map((time) => (
                <div key={time} className="h-[80px] border-b border-black/5" />
              ))}

              {/* Current Time Line */}
              {currentTimePos && day === DAYS[(now.getDay() + 6) % 7] && (
                <div 
                  className="absolute left-0 right-0 z-10 border-t-2 border-red-400/50 pointer-events-none"
                  style={{ top: currentTimePos }}
                >
                  <div className="absolute -left-1 -top-1 w-2 md:w-2.5 md:h-2.5 rounded-full bg-red-400 shadow-sm" />
                  <div className="absolute left-3 -top-2.5 bg-red-400 text-white text-[8px] md:text-[9px] px-1 md:px-1.5 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap">
                    현재 시간
                  </div>
                </div>
              )}

              {/* Items */}
              {getItemsForDay(day).map((item) => {
                const pos = calculatePosition(item.startTime, item.endTime);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onEdit(item)}
                    className="absolute left-1 md:left-1.5 right-1 md:right-1.5 rounded-lg md:rounded-xl p-2 md:p-3 text-xs md:text-sm font-semibold cursor-pointer shadow-sm overflow-hidden border border-black/5 flex flex-col justify-center"
                    style={{
                      top: pos.top,
                      height: pos.height,
                      backgroundColor: item.color,
                    }}
                  >
                    <div className="flex flex-col h-full gap-0.5">
                      <span className="truncate leading-tight">{item.title}</span>
                      {item.location && (
                        <span className="text-[9px] md:text-[11px] opacity-60 truncate font-medium">{item.location}</span>
                      )}
                      <span className="mt-auto text-[8px] md:text-[10px] opacity-40 font-medium">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
