import { useState, useEffect } from "react";
import { Todo, TimeCapsule, TimetableEvent } from "./types";
import { 
  DEFAULT_TODOS, 
  DEFAULT_TIMETABLE, 
  DEFAULT_CAPSULES 
} from "./data/defaults";
import CalendarView from "./components/CalendarView";
import AddTodoView from "./components/AddTodoView";
import TimetableView from "./components/TimetableView";
import RecordView from "./components/RecordView";
import SettingsView from "./components/SettingsView";
import { 
  Calendar, 
  Clock, 
  Layers, 
  User, 
  Sparkles,
  Smartphone,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ActiveTab = "캘린더" | "시간표" | "기록" | "설정" | "할일추가";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("캘린더");
  const [prevTabBeforeAdd, setPrevTabBeforeAdd] = useState<ActiveTab>("캘린더");

  // State synchronization with localStorage
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("hr_todos");
    return saved ? JSON.parse(saved) : DEFAULT_TODOS;
  });

  const [timetableEvents, setTimetableEvents] = useState<TimetableEvent[]>(() => {
    const saved = localStorage.getItem("hr_timetable");
    return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;
  });

  const [capsules, setCapsules] = useState<TimeCapsule[]>(() => {
    const saved = localStorage.getItem("hr_capsules");
    return saved ? JSON.parse(saved) : DEFAULT_CAPSULES;
  });

  const [customName, setCustomName] = useState<string>(() => {
    const saved = localStorage.getItem("hr_username");
    return saved ? JSON.parse(saved) : "미래의 성장하는 나";
  });

  // Simulated current system date matching the screenshot timeline (June 2th, 2026)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const saved = localStorage.getItem("hr_dev_date");
    return saved ? JSON.parse(saved) : "2026-06-02";
  });

  // Persists states
  useEffect(() => {
    localStorage.setItem("hr_todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("hr_timetable", JSON.stringify(timetableEvents));
  }, [timetableEvents]);

  useEffect(() => {
    localStorage.setItem("hr_capsules", JSON.stringify(capsules));
  }, [capsules]);

  useEffect(() => {
    localStorage.setItem("hr_username", JSON.stringify(customName));
  }, [customName]);

  useEffect(() => {
    localStorage.setItem("hr_dev_date", JSON.stringify(selectedDate));
  }, [selectedDate]);

  // Handle resetting back to initial preset defaults
  const handleResetData = () => {
    setTodos(DEFAULT_TODOS);
    setTimetableEvents(DEFAULT_TIMETABLE);
    setCapsules(DEFAULT_CAPSULES);
    setCustomName("미래의 성장하는 나");
    setSelectedDate("2026-06-02");
    setActiveTab("캘린더");
  };

  // Navigates to custom form screen to preserve state
  const handleTriggerAddTodo = () => {
    setPrevTabBeforeAdd(activeTab);
    setActiveTab("할일추가");
  };

  // Save new custom todo item
  const handleSaveTodo = (newTodoData: Omit<Todo, "id">) => {
    const freshTodo: Todo = {
      ...newTodoData,
      id: `todo-custom-${Date.now()}`
    };
    setTodos(prev => [...prev, freshTodo]);
    // Redirect back to original view
    setActiveTab(prevTabBeforeAdd === "할일추가" ? "캘린더" : prevTabBeforeAdd);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0 p-5 space-y-6 relative">
        {/* Branding Title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200 font-extrabold">
            H
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">하루 루틴 플래너</h1>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block -mt-0.5">AI Smart Web App</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">성찰 프로필</span>
          <span className="text-xs font-bold text-slate-800 block truncate">{customName}</span>
          <div className="flex items-center text-[9px] font-extrabold text-blue-600 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-ping" />
            AI 비서 활성화됨
          </div>
        </div>

        {/* Navigation Tabs List */}
        <nav className="flex-1 space-y-1.5">
          {[
            { id: "캘린더", label: "캘린더 & 오늘할일", icon: Calendar },
            { id: "시간표", label: "시간표 & 충돌조절", icon: Clock },
            { id: "기록", label: "명언 & 타임캡슐", icon: Layers },
            { id: "설정", label: "시스템 설정", icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`
                  w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all text-left text-xs font-bold relative
                  ${isSel 
                    ? "bg-blue-50 text-blue-700 font-extrabold border-l-4 border-blue-600 pl-2.5" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }
                `}
                id={`sidebar-tab-${tab.id}`}
              >
                <Icon className={`w-4 h-4 ${isSel ? "text-blue-600 stroke-[2.3px]" : "text-slate-400 stroke-[1.8px]"}`} />
                <span className="tracking-wide">{tab.label}</span>
                
                {isSel && (
                  <span className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Simulated Time Info Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-4 text-white p-3 space-y-1 px-4">
          <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-extrabold">가상 설정 디바이스 시점</span>
          <div className="font-mono text-xs font-black tracking-wide">{selectedDate}</div>
          <p className="text-[9px] text-slate-400 leading-normal font-medium mt-1">
            날짜 개봉 및 알림 상태 검토는 [설정] 탭에서 제어해보세요.
          </p>
        </div>

        {/* Bottom Small Info */}
        <div className="text-[10px] text-slate-400 font-semibold text-center border-t border-slate-100 pt-3">
          플래너 웹 에디션 v1.0
        </div>
      </aside>

      {/* MOBILE HEADER TOP BAR */}
      <header className="md:hidden bg-white border-b border-slate-100 px-5 py-3 flex justify-between items-center shrink-0 z-40 relative">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-650 text-white flex items-center justify-center font-black text-xs">
            H
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">하루 루틴</span>
        </div>
        
        {/* Virtual simulated date badge in header */}
        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 font-mono">
          {selectedDate}
        </span>
      </header>

      {/* CORE DISPLAY PORTAL CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              {activeTab === "캘린더" && (
                <CalendarView 
                  todos={todos}
                  setTodos={setTodos}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  onNavigateAddTodo={handleTriggerAddTodo}
                />
              )}

              {activeTab === "할일추가" && (
                <AddTodoView 
                  onSave={handleSaveTodo}
                  onCancel={() => setActiveTab(prevTabBeforeAdd)}
                  initialDate={selectedDate}
                />
              )}

              {activeTab === "시간표" && (
                <TimetableView 
                  events={timetableEvents}
                  setEvents={setTimetableEvents}
                  selectedDate={selectedDate}
                />
              )}

              {activeTab === "기록" && (
                <RecordView 
                  capsules={capsules}
                  setCapsules={setCapsules}
                  todos={todos}
                  setTodos={setTodos}
                  selectedDate={selectedDate}
                />
              )}

              {activeTab === "설정" && (
                <SettingsView 
                  customName={customName}
                  setCustomName={setCustomName}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  onResetData={handleResetData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION TABS (HIDES ON LARGER SCREENS) */}
      {activeTab !== "할일추가" && (
        <nav className="md:hidden bg-white border-t border-slate-100 flex justify-around py-2.5 px-1.5 select-none shrink-0 z-40 relative shadow-md">
          {[
            { id: "캘린더", label: "캘린더", icon: Calendar },
            { id: "시간표", label: "시간표", icon: Clock },
            { id: "기록", label: "기록", icon: Layers },
            { id: "설정", label: "설정", icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`
                  flex flex-col items-center justify-center flex-1 py-0.5 cursor-pointer transition-all gap-1 relative
                  ${isSel ? "text-blue-600 scale-105 font-extrabold" : "text-slate-400 hover:text-slate-600"}
                `}
                id={`nav-tab-${tab.id}`}
              >
                <Icon className={`w-4.5 h-4.5 ${isSel ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
                <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
                
                {isSel && (
                  <motion.span 
                    layoutId="activeTabIndicator" 
                    className="absolute -top-1 w-4 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}

    </div>
  );
}
