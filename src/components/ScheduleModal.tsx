import React, { useState, useEffect } from 'react';
import { DayOfWeek, ScheduleItem } from '../types';
import { DAYS, COLORS } from '../constants';
import { X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ScheduleItem) => void;
  onDelete?: (id: string) => void;
  editItem?: ScheduleItem | null;
}

export default function ScheduleModal({ isOpen, onClose, onSave, onDelete, editItem }: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState<DayOfWeek>('월');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState(COLORS[0].value);
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDay(editItem.day);
      setStartTime(editItem.startTime);
      setEndTime(editItem.endTime);
      setColor(editItem.color);
      setLocation(editItem.location || '');
    } else {
      setTitle('');
      setDay('월');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor(COLORS[0].value);
      setLocation('');
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editItem?.id || Math.random().toString(36).substr(2, 9),
      title,
      day,
      startTime,
      endTime,
      color,
      location,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-black/5">
            <h2 className="text-xl font-semibold serif">{editItem ? '일정 수정' : '새 일정 추가'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-ink/40 mb-1">활동 이름</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 피아노 학원, 수학 공부"
                className="w-full px-4 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-ink/40 mb-1">요일</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value as DayOfWeek)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 bg-white"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}요일</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-ink/40 mb-1">장소 (선택)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 거실, 학원"
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-ink/40 mb-1">시작 시간</label>
                <input
                  required
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-ink/40 mb-1">종료 시간</label>
                <input
                  required
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-ink/40 mb-1">색상 선택</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.value ? 'border-brand-accent scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {editItem && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(editItem.id);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                  삭제
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-brand-accent text-white py-2 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                저장하기
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
