import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { calendarApi } from '../../api/endpoints';
import { CalendarEventItem } from '../../types';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 31)); // Current app time: Oct 2026
  const [selectedType, setSelectedType] = useState('All');
  const [viewScope, setViewScope] = useState<'month' | 'agenda'>('month');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarApi.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = ['All', 'Wedding', 'Ceremony', 'Task Deadline', 'Payment Due', 'Consultation'];

  const filteredEvents = events.filter((ev) => {
    return selectedType === 'All' || ev.event_type === selectedType;
  });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Operations Master Calendar</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              Multi-View Schedule
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Synchronized timeline of royal celebrations, ceremony rituals, vendor milestones, and payment dues.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#F4EFEA] p-1 rounded border border-[#EAE3D9]">
          <button
            onClick={() => setViewScope('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              viewScope === 'month' ? 'bg-[#1A1F2C] text-[#FAF8F5]' : 'text-[#6B7280]'
            }`}
          >
            Month Grid
          </button>
          <button
            onClick={() => setViewScope('agenda')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              viewScope === 'agenda' ? 'bg-[#1A1F2C] text-[#FAF8F5]' : 'text-[#6B7280]'
            }`}
          >
            Agenda View
          </button>
        </div>
      </div>

      {/* Navigation & Event Type Filter Chips */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE3D9] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded hover:bg-[#F4EFEA]"
          >
            <ChevronLeft className="w-4 h-4 text-[#1A1F2C]" />
          </button>
          <span className="text-base font-serif font-semibold text-[#1A1F2C] min-w-44 text-center">
            {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded hover:bg-[#F4EFEA]"
          >
            <ChevronRight className="w-4 h-4 text-[#1A1F2C]" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {eventTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedType === t
                  ? 'bg-[#1A1F2C] text-[#FAF8F5]'
                  : 'bg-[#FAF8F5] border border-[#EAE3D9] text-[#6B7280] hover:bg-[#F4EFEA]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Views */}
      {viewScope === 'month' ? (
        <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm p-4 space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center font-serif text-xs font-semibold text-[#6B7280] pb-2 border-b border-[#EAE3D9]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-2 min-h-[480px]">
            {Array.from({ length: 35 }).map((_, index) => {
              const dayNum = (index % 31) + 1;
              const dayEvents = filteredEvents.slice(index % 4, (index % 4) + 2);

              return (
                <div
                  key={index}
                  className="p-1.5 bg-[#FAF8F5]/40 border border-[#EAE3D9]/70 rounded min-h-[90px] flex flex-col justify-between hover:bg-[#FAF8F5] transition-colors"
                >
                  <span className="text-xs font-mono text-[#6B7280] block text-right font-medium">{dayNum}</span>
                  <div className="space-y-1">
                    {dayEvents.map((ev, i) => (
                      <div
                        key={i}
                        className="p-1 rounded text-[10px] font-medium leading-tight truncate text-white"
                        style={{ backgroundColor: ev.color }}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm divide-y divide-[#EAE3D9]">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="p-4 hover:bg-[#FAF8F5] flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                <div>
                  <span className="text-sm font-serif font-semibold text-[#1A1F2C] block">{ev.title}</span>
                  <div className="flex items-center gap-3 text-[#6B7280] mt-0.5">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-[#C5A880]" />
                      {new Date(ev.start_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                    {ev.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C5A880]" />
                        {ev.venue}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F4EFEA] text-[#1A1F2C] border border-[#EAE3D9]">
                {ev.event_type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

