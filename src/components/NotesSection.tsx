import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotesSectionProps {
  notes: Note[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
}

export default function NotesSection({ notes, onAdd, onDelete }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAdd(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold serif">오늘의 메모</h2>
        <span className="text-xs font-medium text-brand-ink/40 uppercase tracking-widest flex items-center gap-2">
          <Calendar size={14} />
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="아이의 오늘 하루, 기억하고 싶은 순간을 기록해보세요..."
          className="w-full min-h-[120px] p-6 rounded-3xl bg-white border border-black/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/10 resize-none transition-all group-hover:shadow-md"
        />
        <button
          type="submit"
          disabled={!newNote.trim()}
          className="absolute bottom-4 right-4 p-3 bg-brand-accent text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-brand-ink/80">
                {note.content}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-brand-ink/30 font-medium">
                  {new Date(note.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => onDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12 text-brand-ink/20">
          <p className="text-sm italic">아직 기록된 메모가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
