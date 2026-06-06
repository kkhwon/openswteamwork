import React, { useState, useEffect } from "react";
import { TimeCapsule, Todo, Quote, Category } from "../types";
import { 
  Plus, 
  Lock, 
  Unlock, 
  Sparkles, 
  Target, 
  Moon, 
  Smile, 
  CloudRain, 
  Brain, 
  Check, 
  Quote as QuoteIcon, 
  RefreshCw, 
  Heart, 
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RecordViewProps {
  capsules: TimeCapsule[];
  setCapsules: React.Dispatch<React.SetStateAction<TimeCapsule[]>>;
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  selectedDate: string; // Used to calculate D-day correctly
}

const CLIENT_FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  "집중": [
    "포모도로 공부법 적용하여 25분 집중, 5분 휴식 반복하기",
    "알고리즘 고난도 문제 2개 풀고 코드 오답 정리 진행하기",
    "기술 서적 또는 관련 블로그 아티클 1편 정독하고 기록하기"
  ],
  "휴식": [
    "잔잔한 보사노바 음악 들으며 따뜻한 차 한 잔 마시기",
    "스트레칭 10분 진행하며 굳은 몸 천천히 풀어주기",
    "스마트폰 멀리 두고 15분 동안 조용히 누워 눈 감고 있기"
  ],
  "가벼움": [
    "주변 공원 산책하며 좋아하는 신나는 오디오 북 듣기",
    "오랫동안 미뤄두었던 방 책상 및 서랍 레이아웃 정리하기",
    "그동안 고마웠던 소중한 친구 한 명에게 가벼운 안부 편지나 연락 보내기"
  ],
  "우울": [
    "좋아하는 한 편의 영화나 가벼운 애니메이션 골라 시청하기",
    "따뜻한 온수로 온몸을 녹이는 반신욕 또는 샤워 즐기기",
    "자신을 위한 작고 달콤한 디저트나 초콜릿 하나 선물하기"
  ],
  "불안": [
    "생각나는 모든 고민과 원인을 종이에 손으로 적어 객관화하기",
    "4초간 들이마시고, 4초 멈추고, 4초 내쉬는 박스 호흡 5회 진행하기",
    "주변의 5가지 파란색 사물을 보며 천천히 심호흡하기 (그라운딩)"
  ]
};

const CLIENT_FALLBACK_QUOTES = [
  { text: "성공은 매일 반복되는 작은 노력들의 합이다.", author: "로버트 콜리어" },
  { text: "작은 오늘의 선택이 미래의 위대한 당신을 만듭니다.", author: "스티브 잡스" },
  { text: "시작하는 방법은 말을 멈추고 행동하기 시작하는 것이다.", author: "월트 디즈니" },
  { text: "행동은 모든 성공의 기초적인 열쇠이다.", author: "파블로 피카소" },
  { text: "어제보다 나은 오늘을 만드는 것은 오직 당신의 손에 달렸다.", author: "미래의 나" },
  { text: "작은 물방울이 모여 결국 단단한 바위를 뚫는다.", author: "동양 격언" },
  { text: "가장 어두운 밤도 결국 지나가고 아침 해가 떠오른다.", author: "빅토르 위고" },
  { text: "길이 없으면 만들고, 만들 수 없다면 새로 개척하라.", author: "아문센" }
];

type MoodType = "집중" | "휴식" | "가벼움" | "우울" | "불안";

export default function RecordView({
  capsules,
  setCapsules,
  todos,
  setTodos,
  selectedDate,
}: RecordViewProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType>("집중");
  const [suggestions, setSuggestions] = useState<string[]>([
    "포모도로 공부법 적용하여 25분 집중, 5분 휴식 반복하기",
    "알고리즘 고난도 문제 2개 풀고 코드 오답 정리 진행하기",
    "기술 서적 또는 관련 블로그 아티클 1편 정독하고 기록하기"
  ]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeCapsuleForm, setActiveCapsuleForm] = useState(false);
  const [recentAddedTask, setRecentAddedTask] = useState<string | null>(null);

  // Time capsule form states
  const [newCapsuleText, setNewCapsuleText] = useState("");
  const [newCapsuleDate, setNewCapsuleDate] = useState("2026-12-31");

  // Future task reservation states (나중에 할 일 미리 기록하기)
  const [futureTitle, setFutureTitle] = useState("");
  const [futureDate, setFutureDate] = useState("2026-06-15");
  const [futureCategory, setFutureCategory] = useState<Category>("학습");
  const [futureTime, setFutureTime] = useState("09:00");
  const [futureMemo, setFutureMemo] = useState("");
  const [showFutureForm, setShowFutureForm] = useState(false);

  // Dynamic Quote of the day
  const [quote, setQuote] = useState<Quote>({
    text: "성공은 매일 반복되는 작은 노력들의 합이다.",
    author: "로버트 콜리어"
  });
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [isLikedQuote, setIsLikedQuote] = useState(false);

  // Focus capsule viewing state
  const [focusedCapsule, setFocusedCapsule] = useState<TimeCapsule | null>(null);

  // Future scheduled task editing state
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Load mood suggestions whenever selectedMood changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch("/api/gemini/suggest-todo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood: selectedMood })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.suggestions && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          } else {
            setSuggestions(CLIENT_FALLBACK_SUGGESTIONS[selectedMood]);
          }
        } else {
          setSuggestions(CLIENT_FALLBACK_SUGGESTIONS[selectedMood]);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions from server, using local fallback:", error);
        setSuggestions(CLIENT_FALLBACK_SUGGESTIONS[selectedMood]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [selectedMood]);

  // Load a brand new quote on mount or fetch click
  const handleFetchNewQuote = async () => {
    setLoadingQuote(true);
    setIsLikedQuote(false);
    try {
      const response = await fetch("/api/gemini/quote");
      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setQuote(data);
        } else {
          const randomIndex = Math.floor(Math.random() * CLIENT_FALLBACK_QUOTES.length);
          setQuote(CLIENT_FALLBACK_QUOTES[randomIndex]);
        }
      } else {
        const randomIndex = Math.floor(Math.random() * CLIENT_FALLBACK_QUOTES.length);
        setQuote(CLIENT_FALLBACK_QUOTES[randomIndex]);
      }
    } catch (error) {
      console.error("Failed to fetch quote from server, using local fallback:", error);
      const randomIndex = Math.floor(Math.random() * CLIENT_FALLBACK_QUOTES.length);
      setQuote(CLIENT_FALLBACK_QUOTES[randomIndex]);
    } finally {
      setLoadingQuote(false);
    }
  };

  // Helper: calculate D-day from selected virtual current date
  const getDDayString = (unlockDateStr: string): { label: string; isUnlocked: boolean } => {
    const current = new Date(selectedDate);
    const target = new Date(unlockDateStr);
    
    // Normalize times
    current.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - current.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: "열기 가능", isUnlocked: true };
    }
    return { label: `D-${diffDays}`, isUnlocked: false };
  };

  // Save new Time Capsule
  const handleCreateCapsule = () => {
    if (!newCapsuleText.trim()) {
      alert("미래의 자신을 위한 한 줄 다짐이나 메시지를 써주세요!");
      return;
    }

    const testCapsule: TimeCapsule = {
      id: `capsule-custom-${Date.now()}`,
      unlockDate: newCapsuleDate,
      content: newCapsuleText.trim(),
      createdAt: selectedDate
    };

    setCapsules(prev => [testCapsule, ...prev]);
    setNewCapsuleText("");
    setActiveCapsuleForm(false);
  };

  // Save future pre-recorded todo
  const handleCreateFutureTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!futureTitle.trim()) {
      alert("나중에 해야 할 일을 입력해 주세요!");
      return;
    }

    const newTask: Todo = {
      id: `todo-future-${Date.now()}`,
      title: futureTitle.trim(),
      dueDate: futureDate,
      time: futureTime,
      priority: "보통",
      category: futureCategory,
      progress: 0,
      memo: futureMemo.trim() ? `${futureMemo.trim()} (나중 할일 예약 기록)` : "미래 플래너에서 사전에 저축해 둔 일정입니다.",
      notify: true,
      completed: false
    };

    setTodos(prev => [...prev, newTask]);
    setFutureTitle("");
    setFutureMemo("");
    setShowFutureForm(false);
  };

  // Save edited future scheduled todo
  const handleSaveEditTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;
    if (!editingTodo.title.trim()) {
      alert("할 일 제목을 입력해주세요!");
      return;
    }
    setTodos(prev => prev.map(item => item.id === editingTodo.id ? editingTodo : item));
    setEditingTodo(null);
  };

  // Filter future scheduled todos dynamically
  const futureScheduledTodos = todos.filter(t => t.dueDate > selectedDate);

  // Add highly personalized mood suggestion directly to todo lists
  const handleAddSuggestedTodo = (taskText: string) => {
    const isAlreadyPresent = todos.some(t => t.title === taskText && t.dueDate === selectedDate);
    if (isAlreadyPresent) {
      alert("이 일정은 이미 오늘의 할 일 목록에 포함되어 있습니다!");
      return;
    }

    const item: Todo = {
      id: `todo-recommend-${Date.now()}`,
      title: taskText,
      dueDate: selectedDate,
      time: "12:00",
      priority: "보통",
      category: "개인",
      progress: 0,
      memo: `기분 상태 [${selectedMood}] 에 따라 추천된 일과입니다.`,
      notify: false,
      completed: false
    };

    setTodos(prev => [...prev, item]);
    setRecentAddedTask(taskText);
    setTimeout(() => {
      setRecentAddedTask(null);
    }, 2500);
  };

  // Mood data references
  const MOODS_META = [
    { name: "집중", icon: Target, activeClr: "bg-blue-600 text-white shadow-md shadow-blue-100", label: "집중" },
    { name: "휴식", icon: Moon, activeClr: "bg-violet-600 text-white shadow-md shadow-violet-100", label: "휴식" },
    { name: "가벼움", icon: Smile, activeClr: "bg-emerald-600 text-white shadow-md shadow-emerald-100", label: "가벼움" },
    { name: "우울", icon: CloudRain, activeClr: "bg-amber-600 text-white shadow-md shadow-amber-100", label: "우울" },
    { name: "불안", icon: Brain, activeClr: "bg-indigo-600 text-white shadow-md shadow-indigo-100", label: "불안" }
  ] as const;

  return (
    <div id="record-view-container" className="flex flex-col h-full bg-slate-50 text-slate-850">
      
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center px-5 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h1 className="font-bold text-lg text-slate-900 tracking-tight">기록 & 명언</h1>
        </div>
        <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 pb-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: TIME CAPSULES HISTORY & ARCHIVES */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* CARD 1: 성장기록 타임캡슐 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-slate-850 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2" />
                    성장기록 타임캡슐
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">미래의 나에게 부실 소중한 메시지나 다짐 엽서를 잠가보세요.</p>
                </div>
                
                <button
                  onClick={() => setActiveCapsuleForm(true)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  새 엽서 작성
                </button>
              </div>

              {/* CAPSULE ADD OVERLAY COMPONENT */}
              <AnimatePresence>
                {activeCapsuleForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-100 overflow-hidden space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500">새로운 미래 다짐</span>
                      <button 
                        onClick={() => setActiveCapsuleForm(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                      >
                        닫기
                      </button>
                    </div>

                    <textarea
                      placeholder="예) 수능 시험 끝난 직후 혹은 연말에 읽을 나에게: 드디어 그동안 열심히 노력했던 레이스가 성공적으로 완주했기를 바라..."
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-350 resize-none"
                      rows={3}
                      value={newCapsuleText}
                      onChange={(e) => setNewCapsuleText(e.target.value)}
                    />

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">개봉 목표 날짜:</span>
                      <input
                        type="date"
                        className="text-xs font-semibold bg-white border border-slate-200 rounded-lg p-1 px-2 text-slate-700"
                        value={newCapsuleDate}
                        onChange={(e) => setNewCapsuleDate(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleCreateCapsule}
                      className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      오늘의 다짐 엽서 잠그기
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TIME CAPSULE ARCHIVE LIST */}
              <div className="space-y-3">
                {capsules.map((cap) => {
                  const { label, isUnlocked } = getDDayString(cap.unlockDate);
                  return (
                    <div
                      key={cap.id}
                      onClick={() => setFocusedCapsule(cap)}
                      className={`
                        p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group
                        ${isUnlocked 
                          ? "bg-teal-50/40 border-teal-100 hover:bg-teal-50" 
                          : "bg-slate-50/70 border-slate-100 hover:bg-slate-150/50"
                        }
                      `}
                    >
                      <div className="space-y-1 pr-3 flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-500 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {cap.unlockDate} 에 열려요
                        </p>
                        <p className={`
                          text-xs font-medium mt-1 transition-all truncate
                          ${isUnlocked ? "text-slate-800" : "text-slate-400 italic"}
                        `}>
                          {isUnlocked ? cap.content : "🔒 미래로 가는 중... 개봉일에만 열어볼 수 있습니다!"}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        {isUnlocked ? (
                          <span className="flex items-center bg-teal-100 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-200">
                            <Unlock className="w-3.5 h-3.5 mr-1" />
                            {label}
                          </span>
                        ) : (
                          <span className="flex items-center bg-slate-200/80 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-300">
                            <Lock className="w-3.5 h-3.5 mr-1" />
                            {label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 2: 나중에 해야할 일 선기록 (미래 이정표 사전 선적립) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-slate-850 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
                    나중에 해야할 일 선기록
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">머나먼 미래의 할 일을 날짜별로 예약 수립해둘 수 있습니다.</p>
                </div>
                
                <button
                  onClick={() => setShowFutureForm(!showFutureForm)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  할 일 등록
                </button>
              </div>

              {/* FUTURE TODO ADD FORM */}
              <AnimatePresence>
                {showFutureForm && (
                  <motion.form
                    onSubmit={handleCreateFutureTodo}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-100 overflow-hidden space-y-3"
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span>📌 나중 목표 예약하기</span>
                      <button 
                        type="button"
                        onClick={() => setShowFutureForm(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        닫기
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400">할 일 제목</label>
                      <input
                        type="text"
                        required
                        placeholder="예) 다음 학기 수강 꾸러미 수립하기"
                        value={futureTitle}
                        onChange={(e) => setFutureTitle(e.target.value)}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-extrabold text-slate-400 block">목표 기한 날짜</label>
                        <input
                          type="date"
                          required
                          value={futureDate}
                          onChange={(e) => setFutureDate(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-750 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-extrabold text-slate-400 block">수행 목표 시간</label>
                        <input
                          type="time"
                          required
                          value={futureTime}
                          onChange={(e) => setFutureTime(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-755 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-extrabold text-slate-400 block">카테고리</label>
                      <select
                        value={futureCategory}
                        onChange={(e) => setFutureCategory(e.target.value as Category)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="학습">📚 학습</option>
                        <option value="과제">📝 과제</option>
                        <option value="개인">🌱 개인</option>
                        <option value="기타">💬 기타</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-extrabold text-slate-400 block">관련 세부 메모</label>
                      <textarea
                        placeholder="예) 학적 공지를 참고하여 희망 수강 트랙 및 과목 ID 선번정리해 둘 것"
                        value={futureMemo}
                        onChange={(e) => setFutureMemo(e.target.value)}
                        className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 placeholder-slate-350 resize-none"
                        rows={2}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all text-center cursor-pointer"
                    >
                      미래 할 일 예약 완료
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* LIST OF REGISTERED FUTURE PLANS */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {futureScheduledTodos.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-150 rounded-2xl bg-slate-50/50">
                    <p className="font-bold text-slate-500">등록된 미래 할 일이 아직 없습니다.</p>
                    <p className="text-[10px] text-slate-400 mt-1">오늘({selectedDate}) 이후인 내일이나 다음 주 등 예약을 등록해 보세요!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {futureScheduledTodos.map((task) => {
                      const diffTime = new Date(task.dueDate).getTime() - new Date(selectedDate).getTime();
                      const dday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return (
                        <div
                          key={task.id}
                          className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-slate-100/50 transition-colors"
                        >
                          <div className="space-y-1 flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-250 shrink-0 font-mono">
                                D-{dday}
                              </span>
                              <span className="text-xs font-extrabold text-slate-850 truncate">{task.title}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                              <span>📅 {task.dueDate} {task.time}</span>
                              <span>•</span>
                              <span>{task.category}</span>
                            </div>

                            {task.memo && (
                              <p className="text-[10px] text-slate-500 bg-white/70 p-1.5 rounded-lg truncate mt-1">
                                {task.memo.replace(" (나중 할일 예약 기록)", "")}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 self-start">
                            <button
                              onClick={() => setEditingTodo(task)}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                              title="수정하기"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setTodos(prev => prev.filter(t => t.id !== task.id))}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="예약 취소"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: MOOD SUGGESTIONS & DYNAMIC QUOTATION PANEL */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* SECTION 2: MOOD SUGGESTIONS (기분별 일정 추천) */}
            <div id="mood-recommends-container" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-850 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2" />
                  기분별 추천 계획
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">지금 감정이나 기분을 골라 적절한 스마트 추천 루틴을 추가해보세요.</p>
              </div>

              {/* MOOD HORIZONTAL BUTTONS SELECTION */}
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-2xl gap-1">
                {MOODS_META.map((meta) => {
                  const Icon = meta.icon;
                  const isSel = selectedMood === meta.name;
                  return (
                    <button
                      key={meta.name}
                      onClick={() => setSelectedMood(meta.name)}
                      className={`
                        flex flex-col items-center justify-center flex-1 py-2.5 rounded-xl cursor-pointer transition-all gap-1
                        ${isSel ? meta.activeClr : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}
                      `}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span className="text-[10px] font-extrabold">{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC LIST OF RECOMMENDATIONS */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60 relative">
                <h3 className="text-xs font-extrabold text-slate-500 mb-2.5 uppercase tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                  {selectedMood} 모드 추천 하루 일정
                </h3>

                {loadingSuggestions ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span>AI가 당신의 심리 및 상태에 최적화된 하루 성찰 루틴을 생성하고 있습니다...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {suggestions.map((taskStr, sIdx) => {
                      const wasRecentlyAdded = recentAddedTask === taskStr;
                      return (
                        <div 
                          key={sIdx}
                          className="bg-white rounded-xl p-3 border border-slate-150 flex justify-between items-center hover:border-blue-200 transition-colors cursor-pointer group"
                          onClick={() => handleAddSuggestedTodo(taskStr)}
                        >
                          <span className="text-xs font-bold text-slate-700 leading-normal pr-2">
                            {taskStr}
                          </span>
                          <button 
                            className={`
                              px-2 py-1.5 rounded-lg text-[9px] font-bold border flex items-center gap-0.5 transition-all
                              ${wasRecentlyAdded
                                ? "bg-emerald-50 text-emerald-605 border-emerald-200"
                                : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white"
                              }
                            `}
                          >
                            {wasRecentlyAdded ? (
                              <>
                                <Check className="w-3 h-3" /> 추가됨
                              </>
                            ) : (
                              <>
                                오늘 추가 <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: RANDOM MOTIVATIONAL QUOTE (랜덤 명언) */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white/90 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                <QuoteIcon className="w-40 h-40" />
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-yellow-400 animate-spin" />
                  동기부여 한 마디 (랜덤 명언)
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsLikedQuote(!isLikedQuote)}
                    className={`p-1.5 rounded-full transition-colors ${isLikedQuote ? "text-rose-500 bg-rose-500/10" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
                  >
                    <Heart className={`w-4 h-4 ${isLikedQuote ? "fill-rose-500" : ""}`} />
                  </button>
                  <button
                    onClick={handleFetchNewQuote}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors reset-button"
                    id="btn-refresh-quote"
                    disabled={loadingQuote}
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingQuote ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="py-2.5 space-y-3.5 min-h-[72px]">
                {loadingQuote ? (
                  <p className="text-xs text-slate-400 animate-pulse italic">수준 높은 우주적인 명언을 조합하는 중...</p>
                ) : (
                  <>
                    <blockquote className="text-sm font-bold leading-relaxed text-white tracking-wide">
                      "{quote.text}"
                    </blockquote>
                    <p className="text-xs text-slate-400 font-semibold">— {quote.author}</p>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* CAPSULE VIEW MODAL INTERACTIVE DETAIL */}
      <AnimatePresence>
        {focusedCapsule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-5"
            onClick={() => setFocusedCapsule(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-slate-100 text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Check if is unlocked based on simulated selectedDate */}
              {(() => {
                const { label, isUnlocked } = getDDayString(focusedCapsule.unlockDate);
                return (
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600 mb-2">
                      {isUnlocked ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-slate-800">미래에 작성한 엽서</h4>
                      <p className="text-xs text-slate-400">{focusedCapsule.unlockDate} 에 열리는 엽서 ({label})</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[80px] flex items-center justify-center">
                      <p className={`
                        text-xs leading-relaxed font-bold
                        ${isUnlocked ? "text-slate-800" : "text-slate-400 italic"}
                      `}>
                        {isUnlocked 
                          ? `"${focusedCapsule.content}"` 
                          : "아직 잠겨 있습니다! 이 타임캡슐을 기입했던 귀중한 정신과 도전을 떠올리며 나중을 기약하세요."
                        }
                      </p>
                    </div>

                    {!isUnlocked && (
                      <div className="bg-amber-50 text-amber-700 rounded-xl p-2.5 text-[10px] font-semibold">
                        💡 꿀팁: 시간 여행을 하고 싶다면, 우측 하단의 [설정] 탭 장치로 들어가서 시스템 날짜를 {focusedCapsule.unlockDate} 뒤로 감아 타임랩스 해보세요!
                      </div>
                    )}

                    <button
                      onClick={() => setFocusedCapsule(null)}
                      className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      돌아가기
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT FUTURE TODO DIALOG OVERLAY */}
      <AnimatePresence>
        {editingTodo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTodo(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md border border-slate-150 relative overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="p-1 w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-base text-slate-900">예약한 미래 할 일 수정하기</h3>
                </div>
                <button 
                  onClick={() => setEditingTodo(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
                >
                  닫기
                </button>
              </div>

              <form onSubmit={handleSaveEditTodo} className="space-y-4 pt-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">할 일 제목</label>
                  <input 
                    type="text"
                    required
                    value={editingTodo.title}
                    onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-855"
                    placeholder="수정할 미래 일정을 입력해 주세요"
                  />
                </div>

                {/* Grid: Category & Target Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">카테고리</label>
                    <select
                      value={editingTodo.category}
                      onChange={(e) => setEditingTodo({ ...editingTodo, category: e.target.value as Category })}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-705 cursor-pointer"
                    >
                      <option value="학습">📚 학습</option>
                      <option value="과제">📝 과제</option>
                      <option value="개인">🌱 개인</option>
                      <option value="기타">💬 기타</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">수행 목표일</label>
                    <input 
                      type="date"
                      required
                      value={editingTodo.dueDate}
                      onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-705"
                    />
                  </div>
                </div>

                {/* Time & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">수행 시간</label>
                    <input 
                      type="time"
                      required
                      value={editingTodo.time}
                      onChange={(e) => setEditingTodo({ ...editingTodo, time: e.target.value })}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-705"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">우선순위</label>
                    <select
                      value={editingTodo.priority}
                      onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value })}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-705 cursor-pointer"
                    >
                      <option value="높음">🔥 높음</option>
                      <option value="보통">⚡ 보통</option>
                      <option value="낮음">🎈 낮음</option>
                    </select>
                  </div>
                </div>

                {/* Memo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">관련 세부 메모</label>
                  <textarea 
                    value={editingTodo.memo}
                    onChange={(e) => setEditingTodo({ ...editingTodo, memo: e.target.value })}
                    rows={2}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 placeholder-slate-350 resize-none animate-none"
                    placeholder="세부적인 계획 내용을 남겨보세요"
                  />
                </div>

                {/* Submits */}
                <div className="flex space-x-3 pt-3">
                  <button 
                    type="button"
                    onClick={() => setEditingTodo(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer text-center"
                  >
                    수정 완료
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
