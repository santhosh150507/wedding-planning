import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Kanban, 
  List, 
  Sparkles, 
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { weddingApi } from '../../api/endpoints';
import { WeddingSummary, WeddingTask } from '../../types';

export const TasksPage: React.FC = () => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Instant plan trigger feedback
  const [planMessage, setPlanMessage] = useState<string | null>(null);

  // Setup sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const fetchWeddingsAndTasks = async () => {
    try {
      setLoading(true);
      const wList = await weddingApi.list();
      setWeddings(wList);

      if (wList.length > 0) {
        const targetId = selectedWeddingId || wList[0].id;
        setSelectedWeddingId(targetId);
        const tList = await weddingApi.getTasks(targetId);
        setTasks(tList);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddingsAndTasks();
  }, []);

  const handleWeddingChange = async (wId: string) => {
    setSelectedWeddingId(wId);
    setPlanMessage(null);
    try {
      setLoading(true);
      const tList = await weddingApi.getTasks(wId);
      setTasks(tList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!selectedWeddingId) return;
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
      await weddingApi.updateTask(selectedWeddingId, taskId, { status: newStatus });
    } catch (err) {
      alert('Failed to update task status.');
      fetchWeddingsAndTasks();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    if (['To Plan', 'In Progress', 'Blocked', 'Done'].includes(newStatus)) {
      handleStatusChange(taskId, newStatus);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const columns = ['To Plan', 'In Progress', 'Blocked', 'Done'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C] flex items-center gap-2">
            <span>Tasks & Instant Plan Engine</span>
            <span className="text-sm font-sans font-normal px-2.5 py-1 bg-[#F4EFEA] text-[#C5A880] rounded border border-[#EAE3D9]">
              25+ Deliverables
            </span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Idempotent task architecture computing relative due dates from palace wedding start dates.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#F4EFEA] p-1 rounded border border-[#EAE3D9]">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
              viewMode === 'kanban' ? 'bg-[#1A1F2C] text-[#FAF8F5] shadow-xs' : 'text-[#6B7280]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-[#1A1F2C] text-[#FAF8F5] shadow-xs' : 'text-[#6B7280]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* Wedding Selector & Filters */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE3D9] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="text-xs">
            <span className="text-[#6B7280] block mb-1">Select Wedding Workspace:</span>
            <select
              value={selectedWeddingId}
              onChange={(e) => handleWeddingChange(e.target.value)}
              className="p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-serif text-[#1A1F2C] text-sm font-medium"
            >
              {weddings.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.wedding_number} – {w.couple_title} ({w.package_type})
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-64 pt-4 md:pt-0">
            <Search className="w-4 h-4 absolute left-3 top-5 md:top-3 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-xs text-[#1A1F2C]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6B7280]">Priority:</span>
          {['All', 'Urgent', 'High', 'Medium', 'Low'].map((pr) => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className={`px-2.5 py-1 rounded ${
                priorityFilter === pr
                  ? 'bg-[#1A1F2C] text-white'
                  : 'bg-[#FAF8F5] text-[#1A1F2C] border border-[#EAE3D9]'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Mode */}
      {viewMode === 'kanban' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {columns.map((colName) => {
              const colTasks = filteredTasks.filter((t) => t.status === colName);
              return (
                <div
                  key={colName}
                  id={colName}
                  className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D9] flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#EAE3D9]">
                    <span className="font-serif font-semibold text-xs text-[#1A1F2C]">{colName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white border border-[#EAE3D9] text-[#6B7280]">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks Drop Zone */}
                  <div className="space-y-2.5 flex-1">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-3 rounded border border-[#EAE3D9] shadow-2xs hover:shadow-sm transition-all space-y-2 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-medium text-[#1A1F2C] leading-snug">{t.title}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 ${
                            t.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                            t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#6B7280] pt-1 border-t border-[#EAE3D9]/60">
                          <span>{t.assigned_to_name}</span>
                          <span className="font-mono">
                            {new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        {/* Quick Move Buttons */}
                        <div className="flex items-center justify-between pt-1">
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            className="text-[10px] bg-[#FAF8F5] border border-[#EAE3D9] rounded px-1.5 py-0.5 text-[#1A1F2C]"
                          >
                            <option value="To Plan">To Plan</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Blocked">Blocked</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      ) : (
        /* List View Mode */
        <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#EAE3D9] text-[#6B7280]">
              <tr>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D9]">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-medium text-[#1A1F2C]">{t.title}</td>
                  <td className="py-3 px-3 text-[#4B5563]">{t.assigned_to_name}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                      t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#6B7280]">
                    {new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      t.status === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                      t.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      t.status === 'Blocked' ? 'bg-rose-100 text-rose-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      className="text-xs bg-[#FAF8F5] border border-[#EAE3D9] rounded px-2 py-1 text-[#1A1F2C]"
                    >
                      <option value="To Plan">To Plan</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

