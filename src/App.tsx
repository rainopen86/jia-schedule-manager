import React, { useState, useEffect } from 'react';
import { ScheduleItem, Note, DayOfWeek } from './types';
import Timetable from './components/Timetable';
import ScheduleModal from './components/ScheduleModal';
import NotesSection from './components/NotesSection';
import BusTimetable from './components/BusTimetable';
import { Plus, Settings, Heart, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, notesRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/notes')
        ]);
        const itemsData = await itemsRes.json();
        const notesData = await notesRes.json();

        setItems(itemsData);
        setNotes(notesData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      switch (type) {
        case 'ITEM_CREATE':
          setItems(prev => [...prev, payload]);
          break;
        case 'ITEM_UPDATE':
          setItems(prev => prev.map(i => i.id === payload.id ? payload : i));
          break;
        case 'ITEM_DELETE':
          setItems(prev => prev.filter(i => i.id !== payload.id));
          break;
        case 'NOTE_CREATE':
          setNotes(prev => [payload, ...prev]);
          break;
        case 'NOTE_DELETE':
          setNotes(prev => prev.filter(n => n.id !== payload.id));
          break;
      }
    };

    setWs(socket);
    return () => socket.close();
  }, []);

  const sendWsMessage = (type: string, payload: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    } else {
      // Fallback if WS not ready (though in real app we'd queue or use REST)
      console.warn('WS not ready, message not sent:', type);
    }
  };

  const getDefaultItems = (): ScheduleItem[] => {
    const defaultItems: ScheduleItem[] = [];
    const days: DayOfWeek[] = ['월', '화', '수', '목', '금'];
    const times = [
      { name: '아침활동', start: '08:30', end: '09:00', color: '#FEF9C3' },
      { name: '1교시', start: '09:00', end: '09:40' },
      { name: '2교시', start: '09:50', end: '10:30' },
      { name: '3교시', start: '10:40', end: '11:20' },
      { name: '4교시', start: '11:30', end: '12:10' },
      { name: '5교시', start: '12:20', end: '13:00' },
      { name: '점심시간', start: '13:00', end: '13:50', color: '#DCFCE7' },
      { name: '6교시', start: '13:50', end: '14:30' },
    ];

    const subjects: Record<DayOfWeek, string[]> = {
      '월': ['영어', '체육', '국어', '사회', '도덕'],
      '화': ['국어', '수학', '사회', '과학', '체육', '음악'],
      '수': ['영어', '수학', '사회', '과학', '음악'],
      '목': ['국어', '수학', '과학', '미술', '미술'],
      '금': ['국어', '국어', '체육', '수학', '창체'],
      '토': [],
      '일': []
    };

    const colorMap: Record<string, string> = {
      '국어': '#FEE2E2', '수학': '#E0F2FE', '영어': '#F3E8FF', '사회': '#FFEDD5',
      '과학': '#DCFCE7', '체육': '#FEF9C3', '미술': '#FCE7F3', '음악': '#E0F2FE',
      '도덕': '#DCFCE7', '창체': '#DCFCE7',
    };

    days.forEach(day => {
      times.forEach((time) => {
        let title = time.name;
        let color = time.color || '#F3F4F6';
        if (time.name.includes('교시')) {
          const subjectIdx = parseInt(time.name) - 1;
          const subject = subjects[day][subjectIdx];
          if (subject) {
            title = subject;
            color = colorMap[subject] || color;
          } else return;
        }
        defaultItems.push({
          id: Math.random().toString(36).substr(2, 9),
          title, day, startTime: time.start, endTime: time.end, color,
        });
      });
    });
    return defaultItems;
  };

  const handleSaveItem = (item: ScheduleItem) => {
    if (editingItem) {
      setItems(items.map((i) => (i.id === item.id ? item : i)));
      sendWsMessage('ITEM_UPDATE', item);
    } else {
      setItems([...items, item]);
      sendWsMessage('ITEM_CREATE', item);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    sendWsMessage('ITEM_DELETE', { id });
  };

  const handleAddNote = (content: string) => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    sendWsMessage('NOTE_CREATE', newNote);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    sendWsMessage('NOTE_DELETE', { id });
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const dayIndex = new Date().getDay();
    const days: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];
    const today = days[dayIndex];
    return (today === '토' || today === '일') ? '월' : today;
  });

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink selection:bg-brand-accent/10 pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-bg/80 backdrop-blur-md border-b border-black/5 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-accent rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-accent/20">
              <Heart size={16} className="md:w-5 md:h-5" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold serif tracking-tight">지아 시간표</h1>
              <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-brand-ink/40 font-semibold">Daily Routine</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-brand-ink/40 hover:text-brand-ink transition-colors">
              <Settings size={18} className="md:w-5 md:h-5" />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-brand-accent text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl font-medium shadow-lg shadow-brand-accent/20 hover:opacity-90 transition-all text-sm md:text-base"
            >
              <Plus size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden xs:inline">추가</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 space-y-8 md:space-y-12">
        {/* Timetable Section */}
        <section className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-semibold serif">주간 시간표</h3>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-brand-ink/40 bg-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-black/5">
              <CalendarIcon size={12} className="md:w-3.5 md:h-3.5" />
              <span>이번 주 일정</span>
            </div>
          </div>
          
          {/* Day Selector for Mobile */}
          <div className="flex md:hidden bg-white p-1 rounded-2xl border border-black/5 shadow-sm overflow-x-auto no-scrollbar">
            {['월', '화', '수', '목', '금'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day as DayOfWeek)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  selectedDay === day 
                    ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20' 
                    : 'text-brand-ink/40 hover:bg-brand-bg'
                }`}
              >
                {day}요일
              </button>
            ))}
          </div>

          <Timetable items={items} onEdit={openEditModal} selectedDay={selectedDay} />
        </section>

        {/* Notes Section */}
        <section>
          <NotesSection notes={notes} onAdd={handleAddNote} onDelete={handleDeleteNote} />
        </section>

        {/* Bus Timetable Section */}
        <section>
          <BusTimetable />
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 text-center">
        <p className="text-xs text-brand-ink/20 font-medium uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Kid's Schedule Manager. Crafted with Love.
        </p>
      </footer>

      {/* Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        editItem={editingItem}
      />
    </div>
  );
}
