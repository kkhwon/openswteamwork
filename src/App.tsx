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
  BookOpen,
  Bell,
  BellRing,
  X,
  Volume2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ActiveTab = "캘린더" | "시간표" | "기록" | "설정" | "할일추가";

interface IncomingNotification {
  id: string;
  title: string;
  body: string;
  type: "todo" | "timetable" | "test";
  referenceId?: string;
  timestamp: number;
}

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

  // Interactive Live Notifications State
  const [activeNotifications, setActiveNotifications] = useState<IncomingNotification[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("hr_notified_ids");
    return saved ? JSON.parse(saved) : [];
  });

  // Browser standard push notice permission state
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
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

  // Request browser desktop notification permission
  const handleRequestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === "granted";
    } catch (e) {
      console.warn("Permission request error (likely inside sandboxed iframe):", e);
      return false;
    }
  };

  // Dispatch raw desktop banner
  const sendDesktopNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico"
        });
      } catch (e) {
        console.warn("Desktop Notification instantiation failed in sandboxed scope, rely on high-fidelity in-app overlay:", e);
      }
    }
  };

  // Perform a test notification
  const handleTriggerTestNotification = async () => {
    // Attempt permission request
    await handleRequestNotificationPermission();

    const title = "🔔 성장 성찰 알림 정상 수신 확인!";
    const body = "성장 플래너의 푸시 엔진이 활성화되었습니다. 설정한 할 일 및 시간표 시작 정시에 메신저가 찾아옵니다.";
    
    // 1. Play audio beep if possible with Web Audio API for rich micro interaction!
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 sweet note
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (_) {}

    // 2. Dispatch desktop native push fallback
    sendDesktopNotification(title, body);

    // 3. Put in interactive in-app toast stack
    const testNotif: IncomingNotification = {
      id: `test-notif-${Date.now()}`,
      title,
      body,
      type: "test",
      timestamp: Date.now()
    };
    setActiveNotifications(prev => [testNotif, ...prev]);

    // Auto-dismiss test toast after 6 seconds to prevent clutter
    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== testNotif.id));
    }, 6000);
  };

  // Background daemon to check for scheduled alarms matching real-world clock time
  useEffect(() => {
    const checkTimer = setInterval(() => {
      const now = new Date();
      
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const nowTimeStr = `${hh}:${mm}`;

      const yyyy = now.getFullYear();
      const mMonth = String(now.getMonth() + 1).padStart(2, '0');
      const dDay = String(now.getDate()).padStart(2, '0');
      const nowLocalDateStr = `${yyyy}-${mMonth}-${dDay}`;

      // A. CHECK TODOS DEADLINE ALARMS
      const dueTodos = todos.filter(todo => {
        if (!todo.notify || todo.completed) return false;
        // Due on active mockup focus date, OR matching actual today's real date
        const isToday = todo.dueDate === selectedDate || todo.dueDate === nowLocalDateStr;
        if (!isToday) return false;
        
        return todo.time === nowTimeStr;
      });

      dueTodos.forEach(todo => {
        const uniqueKey = `todo-alarm-${todo.id}-${todo.dueDate}-${todo.time}`;
        if (!notifiedIds.includes(uniqueKey)) {
          // Play a delightful high-pitch alert beep
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 alert
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
          } catch (_) {}

          // Persist key to prevent repeating
          setNotifiedIds(prev => {
            const next = [...prev, uniqueKey];
            localStorage.setItem("hr_notified_ids", JSON.stringify(next));
            return next;
          });

          const title = `⏰ 계획된 할 일 마감 시각입니다!`;
          const body = `"${todo.title}" 계획의 설정 정시가 다다랐습니다. 차근추근 완료를 기입해보세요!`;

          sendDesktopNotification(title, body);

          const newNotif: IncomingNotification = {
            id: uniqueKey,
            title,
            body,
            type: "todo",
            referenceId: todo.id,
            timestamp: Date.now()
          };
          setActiveNotifications(prev => [newNotif, ...prev]);
        }
      });

      // B. CHECK TIMETABLE EVENTS ALARMS
      const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
      const simulatedDayOfWeek = new Date(selectedDate).getDay();

      const startingEvents = timetableEvents.filter(evt => {
        const isDayMatch = evt.dayOfWeek === currentDayOfWeek || evt.dayOfWeek === simulatedDayOfWeek;
        if (!isDayMatch) return false;
        return evt.startTime === nowTimeStr;
      });

      startingEvents.forEach(evt => {
        const uniqueKey = `evt-alarm-${evt.id}-${nowLocalDateStr}-${evt.startTime}`;
        if (!notifiedIds.includes(uniqueKey)) {
          // Sound
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
          } catch (_) {}

          setNotifiedIds(prev => {
            const next = [...prev, uniqueKey];
            localStorage.setItem("hr_notified_ids", JSON.stringify(next));
            return next;
          });

          const title = `📅 시간표 일정 시작 알림`;
          const body = `오늘 구성된 "${evt.title}" 일정이 방금 시작되었습니다! (${evt.startTime} ~ ${evt.endTime})`;

          sendDesktopNotification(title, body);

          const newNotif: IncomingNotification = {
            id: uniqueKey,
            title,
            body,
            type: "timetable",
            timestamp: Date.now()
          };
          setActiveNotifications(prev => [newNotif, ...prev]);
        }
      });

    }, 3500);

    return () => clearInterval(checkTimer);
  }, [todos, timetableEvents, selectedDate, notifiedIds]);

  // Complete a todo directly from notification item click
  const handleCompleteTodoFromNotification = (todoId: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          completed: true,
          progress: 100
        };
      }
      return todo;
    }));
  };

  const handleDismissNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Handle resetting back to initial preset defaults
  const handleResetData = () => {
    setTodos(DEFAULT_TODOS);
    setTimetableEvents(DEFAULT_TIMETABLE);
    setCapsules(DEFAULT_CAPSULES);
    setCustomName("미래의 성장하는 나");
    setSelectedDate("2026-06-02");
    setNotifiedIds([]);
    localStorage.removeItem("hr_notified_ids");
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
      
      {/* FLOATING IN-APP NOTIFICATIONS OVERLAY */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col space-y-3 max-w-sm w-full px-4">
        <AnimatePresence>
          {activeNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pointer-events-auto bg-white/95 backdrop-blur-md border border-pastel-200 rounded-2xl shadow-xl shadow-pastel-100/30 p-4 flex flex-col gap-2.5 relative overflow-hidden"
            >
              {/* Left sidebar pastel accent line */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-pastel-400" />
              
              <div className="flex items-start justify-between gap-3 pl-1.5">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-pastel-50 flex items-center justify-center text-pastel-500 shrink-0">
                    <BellRing className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 tracking-tight leading-snug">{notif.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-550 mt-1 leading-normal pr-2 text-wrap">{notif.body}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDismissNotification(notif.id)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Interactive action block inside notification */}
              {notif.referenceId && (
                <div className="flex items-center space-x-2 pl-1.5 border-t border-slate-100 pt-2.5">
                  <button
                    onClick={() => {
                      if (notif.referenceId) {
                        handleCompleteTodoFromNotification(notif.referenceId);
                        handleDismissNotification(notif.id);
                      }
                    }}
                    className="flex-1 py-2 bg-pastel-400 hover:bg-pastel-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    나 지금 바로 완료했어!
                  </button>
                  <button
                    onClick={() => handleDismissNotification(notif.id)}
                    className="py-2 px-3 border border-slate-200 text-slate-500 hover:bg-slate-550 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    확인
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0 p-5 space-y-6 relative">
        {/* Branding Title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-pastel-300 text-white flex items-center justify-center shadow-md shadow-pastel-150 font-extrabold">
            H
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">아직 안 했니?얼른해!</h1>
            <span className="text-[10px] font-bold text-pastel-500 uppercase tracking-widest block -mt-0.5">AI Smart Web App</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">성찰 프로필</span>
          <span className="text-xs font-bold text-slate-800 block truncate">{customName}</span>
          <div className="flex items-center text-[9px] font-extrabold text-pastel-600 mt-1">
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
                    ? "bg-pastel-50 text-pastel-700 font-extrabold border-l-4 border-pastel-300 pl-2.5" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }
                `}
                id={`sidebar-tab-${tab.id}`}
              >
                <Icon className={`w-4 h-4 ${isSel ? "text-pastel-500 stroke-[2.3px]" : "text-slate-400 stroke-[1.8px]"}`} />
                <span className="tracking-wide">{tab.label}</span>
                
                {isSel && (
                  <span className="ml-auto w-1.5 h-1.5 bg-pastel-300 rounded-full" />
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
          <div className="w-7 h-7 rounded-lg bg-pastel-400 text-white flex items-center justify-center font-black text-xs">
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
                  onTriggerTestNotification={handleTriggerTestNotification}
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
                  ${isSel ? "text-pastel-500 scale-105 font-extrabold" : "text-slate-400 hover:text-slate-600"}
                `}
                id={`nav-tab-${tab.id}`}
              >
                <Icon className={`w-4.5 h-4.5 ${isSel ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
                <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
                
                {isSel && (
                  <motion.span 
                    layoutId="activeTabIndicator" 
                    className="absolute -top-1 w-4 h-1 bg-pastel-300 rounded-full"
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
