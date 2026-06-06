import React, { useState, useMemo } from "react";
import { TimetableEvent } from "../types";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Watch, 
  AlertTriangle,
  Sliders,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TimetableViewProps {
  events: TimetableEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TimetableEvent[]>>;
  selectedDate: string; // To match default day of week
}

export default function TimetableView({ events, setEvents, selectedDate }: TimetableViewProps) {
  // Extract default day of week from selectedDate
  const currentDayOfWeek = new Date(selectedDate).getDay(); // 0 (일) to 6 (토)
  
  const [activeDay, setActiveDay] = useState<number>(currentDayOfWeek || 2); // default: Tuesday '화' (2) to match photo
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form fields for a new timetable block
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("09:50");
  const [errorMsg, setErrorMsg] = useState("");

  const daysLabel = ["일", "월", "화", "수", "목", "금", "토"];

  // Hours index for grid (08:00 to 19:00)
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

  // Filter events of the currently selected day
  const rawDayEvents = useMemo(() => {
    return events.filter(e => e.dayOfWeek === activeDay);
  }, [events, activeDay]);

  // Convert "HH:MM" to float representation (e.g. "09:30" -> 9.5) for placement rendering
  const timeToFloat = (timeStr: string): number => {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60;
  };

  // Delete a timetable item
  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  // Add timetable item check and submission
  const handleAddEvent = () => {
    if (!newTitle.trim()) {
      setErrorMsg("일정의 이름을 채워주세요!");
      return;
    }
    const startNum = timeToFloat(newStartTime);
    const endNum = timeToFloat(newEndTime);

    if (endNum <= startNum) {
      setErrorMsg("종료 시간은 시작 시간보다 늦어려야 합니다!");
      return;
    }

    // Check for collision/conflict
    const collision = rawDayEvents.find(evt => {
      const eStart = timeToFloat(evt.startTime);
      const eEnd = timeToFloat(evt.endTime);
      // Overlap formula
      return Math.max(startNum, eStart) < Math.min(endNum, eEnd);
    });

    if (collision) {
      setErrorMsg(`경고: "${collision.title}" (${collision.startTime} - ${collision.endTime}) 일정과 시간이 겹칩니다!`);
      return;
    }

    // Random stylish soft colors
    const colors = [
      "bg-blue-50 text-blue-700 border-blue-200",
      "bg-violet-50 text-violet-700 border-violet-200",
      "bg-emerald-50 text-emerald-700 border-emerald-200",
      "bg-amber-50 text-amber-700 border-amber-200",
      "bg-sky-50 text-sky-700 border-sky-200",
      "bg-indigo-50 text-indigo-700 border-indigo-200",
      "bg-rose-50 text-rose-700 border-rose-200"
    ];
    const pickedColor = colors[Math.floor(Math.random() * colors.length)];

    const newEvt: TimetableEvent = {
      id: `time-custom-${Date.now()}`,
      title: newTitle.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      dayOfWeek: activeDay,
      color: pickedColor
    };

    setEvents(prev => [...prev, newEvt]);
    
    // Clear and close
    setNewTitle("");
    setErrorMsg("");
    setShowAddModal(false);
  };

  return (
    <div id="timetable-view-container" className="flex flex-col h-full bg-slate-50 text-slate-850">
      
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center px-5 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h1 className="font-bold text-lg text-slate-900 tracking-tight">시간표</h1>
        </div>
        <button className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
          <Sliders className="w-4.5 h-4.5 text-slate-600" />
        </button>
      </header>

      {/* WEEKDAY SELECTOR TABS BACKGROUND */}
      <div className="bg-white px-5 py-3 border-b border-slate-100">
        <div className="flex justify-between">
          {daysLabel.map((day, idx) => {
            const isSel = idx === activeDay;
            return (
              <button
                key={day}
                onClick={() => {
                  setActiveDay(idx);
                  setErrorMsg("");
                }}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all cursor-pointer
                  ${isSel 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                    : "text-slate-500 hover:bg-slate-50"
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* TIMETABLE CONTENT FLOW */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 relative">
        <div className="bg-white rounded-3xl border border-slate-100/90 shadow-xs p-4 flex">
          
          {/* HOURLY TIME INDEX COLUMN */}
          <div className="w-14 flex flex-col space-y-[41px] text-right pr-3.5 pt-1.5 select-none">
            {hours.map((hr) => (
              <div key={hr} className="text-xs font-bold text-slate-400 font-mono">
                {hr.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* EVENTS PLACEMENT GRID AREA */}
          <div className="flex-1 border-l border-slate-100 pl-4 py-1.5 relative min-h-[690px]">
            
            {/* Horizontal guideline dividers */}
            {hours.map((_, idx) => (
              <div 
                key={idx} 
                className="absolute left-0 right-0 border-t border-dashed border-slate-100/60 pointer-events-none"
                style={{ top: `${idx * 57}px` }} 
              />
            ))}

            {/* Timetable schedule cards mapping */}
            <AnimatePresence initial={false}>
              {rawDayEvents.map((evt) => {
                const sFloat = timeToFloat(evt.startTime);
                const eFloat = timeToFloat(evt.endTime);
                
                // Height calculation: e.g. 1 hour (1.0) = 57px, 50 min = 47.5px
                const topPos = (sFloat - 8) * 57;
                const blockHeight = (eFloat - sFloat) * 57;

                return (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`
                      absolute left-2 right-2 border rounded-2xl px-3.5 py-2 flex flex-col justify-between shadow-xs select-none group focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer
                      ${evt.color}
                    `}
                    style={{
                      top: `${topPos}px`,
                      height: `${blockHeight}px`,
                      minHeight: "44px"
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-xs tracking-tight line-clamp-2 leading-tight">
                          {evt.title}
                        </span>
                        
                        {/* Interactive Trash can to prune schedule */}
                        <button 
                          onClick={(e) => handleDeleteEvent(evt.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] font-mono font-medium opacity-80 mt-0.5 whitespace-nowrap">
                        {evt.startTime} - {evt.endTime}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Fallback empty message when calendar is barren */}
            {rawDayEvents.length === 0 && (
              <div className="absolute inset-x-8 top-12 text-center text-slate-300 py-12 flex flex-col items-center">
                <Watch className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs font-bold">등록된 클래스 수업이나 일정이 없습니다.</p>
                <p className="text-[10px] opacity-75 mt-0.5">하단의 버튼을 눌러 하루의 공부나 운동 계획을 추가해요.</p>
              </div>
            )}

          </div>

        </div>

        {/* COMPREHENSIVE ADD OVERLAY FORM MODAL */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-slate-800">새 일정 직접 세우기</h3>
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setErrorMsg("");
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1"
                  >
                    닫기
                  </button>
                </div>

                {errorMsg && (
                  <div className="bg-rose-50 text-rose-700 p-2.5 rounded-xl text-xs font-semibold flex items-start mb-3.5 border border-rose-100 gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">일정명</label>
                    <input 
                      type="text" 
                      placeholder="예) 알고리즘 연구, 저녁 헬스 세션" 
                      className="w-full text-xs font-semibold bg-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 border-none text-slate-800 placeholder-slate-400"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">시작 시간</label>
                      <input 
                        type="time" 
                        className="w-full text-xs font-semibold bg-slate-100 rounded-xl px-2 py-2 border-none focus:outline-none"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">종료 시간</label>
                      <input 
                        type="time" 
                        className="w-full text-xs font-semibold bg-slate-100 rounded-xl px-2 py-2 border-none focus:outline-none"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleAddEvent}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 active:scale-95 transition-all text-center cursor-pointer block"
                  >
                    일정표에 심기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* QUICK FLOATING ADD BLOCK ACTION */}
      <button 
        onClick={() => {
          setErrorMsg("");
          setShowAddModal(true);
        }}
        className="fixed bottom-20 right-6 bg-blue-600 text-white px-5 py-3.5 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-semibold text-xs tracking-tight gap-1.5 z-40 cursor-pointer"
        id="btn-add-timetable"
      >
        <Plus className="w-4 h-4" />
        원하는 일정 추가
      </button>

    </div>
  );
}
