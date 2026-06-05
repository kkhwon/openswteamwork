import React, { useState, useMemo } from "react";
import { Todo, Priority, Category } from "../types";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Plus, 
  BookOpen, 
  FileText, 
  Smile, 
  Compass, 
  ChevronDown, 
  Search, 
  Grid,
  Bell,
  Trash2,
  AlertCircle,
  Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CalendarViewProps {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  selectedDate: string; // "YYYY-MM-DD"
  setSelectedDate: (date: string) => void;
  onNavigateAddTodo: () => void;
}

export default function CalendarView({
  todos,
  setTodos,
  selectedDate,
  setSelectedDate,
  onNavigateAddTodo,
}: CalendarViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "전체">("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Parse current date info
  const dateObj = new Date(selectedDate);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 1-based
  const dateNum = dateObj.getDate();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = dayNames[dateObj.getDay()];

  // Generate date grid for June 2026 specifically (as pictured), but we can adjust to selectedDate's month dynamically!
  // To match Screen 1 precisely, let's create a customized 35-day grid representing May 31 to Jul 4, 2026
  const calendarDays = useMemo(() => {
    // We want a grid that covers the month. Let's generate dates for 2026-06:
    // June 2026 starts on Monday. May has 31 days. July has 31.
    const days: { dayStr: string; label: number; isMainMonth: boolean; dateString: string }[] = [];
    
    // May 31 (Sunday)
    days.push({ dayStr: "일", label: 31, isMainMonth: false, dateString: "2026-05-31" });
    
    // June 1 to June 30
    for (let idx = 1; idx <= 30; idx++) {
      const formattedDate = `2026-06-${idx.toString().padStart(2, "0")}`;
      days.push({
        dayStr: dayNames[new Date(2026, 5, idx).getDay()],
        label: idx,
        isMainMonth: true,
        dateString: formattedDate
      });
    }

    // July 1 to July 4
    for (let idx = 1; idx <= 4; idx++) {
      const formattedDate = `2026-07-${idx.toString().padStart(2, "0")}`;
      days.push({
        dayStr: dayNames[new Date(2026, 6, idx).getDay()],
        label: idx,
        isMainMonth: false,
        dateString: formattedDate
      });
    }

    return days;
  }, []);

  // Filter todos by isSelectedDate
  const currentDayTodos = useMemo(() => {
    return todos.filter(t => t.dueDate === selectedDate);
  }, [todos, selectedDate]);

  // Daily completion statistics
  const currentDayStats = useMemo(() => {
    if (currentDayTodos.length === 0) return { total: 0, completed: 0, percentage: 0 };
    const total = currentDayTodos.length;
    
    // Average progress of current day's tasks matching Screen 1's "진행도 60%" logic
    const totalProgressSum = currentDayTodos.reduce((sum, item) => sum + item.progress, 0);
    const averageProgress = Math.round(totalProgressSum / total);
    
    const completed = currentDayTodos.filter(t => t.completed || t.progress === 100).length;
    return {
      total,
      completed,
      percentage: averageProgress,
    };
  }, [currentDayTodos]);

  // Selected Category filter on current list
  const filteredTodos = useMemo(() => {
    return currentDayTodos.filter(item => {
      const matchCategory = selectedCategory === "전체" || item.category === selectedCategory;
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.memo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [currentDayTodos, selectedCategory, searchQuery]);

  // Toggle todo completion
  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(item => {
      if (item.id === id) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          // Sync progress slider to 100 on checked or back to original or 0 if unchecked
          progress: nextCompleted ? 100 : (item.progress === 100 ? 50 : item.progress)
        };
      }
      return item;
    }));
  };

  // Adjust detailed progress range slider
  const handleProgressChange = (id: string, value: number) => {
    setTodos(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          progress: value,
          completed: value === 100,
        };
      }
      return item;
    }));
  };

  // Delete a todo
  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Save edited todo
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

  // Get color label based on Category
  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case "학습": return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
      case "과제": return "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200";
      case "개인": return "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200";
      case "기타": return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
    }
  };

  return (
    <div id="calendar-view-container" className="flex flex-col h-full bg-slate-50 text-slate-800">
      
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center px-5 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-lg text-slate-900 tracking-tight">하루 루틴</span>
        </div>
        
        {/* Month Selector & Controls */}
        <div className="flex items-center space-x-1 py-1 px-3 bg-slate-100 rounded-full cursor-pointer">
          <span className="font-semibold text-sm text-slate-700">{year}. {month}.</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowSearch(!showSearch)} 
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            id="btn-search-toggle"
          >
            <Search className="w-4.5 h-4.5 text-slate-600" />
          </button>
          <div className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
            <span className="text-[10px] font-bold text-blue-600 px-0.5">2026</span>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY BAR */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-slate-100 px-5 py-2.5 overflow-hidden"
          >
            <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="할 일 제목 또는 메모 단어 색인..." 
                className="bg-transparent border-none text-sm text-slate-800 focus:outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="text-xs text-slate-400 font-medium px-1 hover:text-slate-600"
                >
                  지우기
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SECTION: MONTHLY GRID & INTEGRATED MOTIVATION */}
          <div className="lg:col-span-7 space-y-5">
            {/* CALENDAR WEEKDAYS & DAYS CONTAINER */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100">
              <div className="grid grid-cols-7 text-center text-xs font-black pb-3.5 border-b border-slate-100 text-slate-400">
                <span className="text-rose-500">일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span className="text-blue-500">토</span>
              </div>

              {/* CALENDAR MONTHLY GRID */}
              <div className="grid grid-cols-7 gap-y-3.5 pt-4 text-center">
                {calendarDays.map((d, index) => {
                  const isSelected = selectedDate === d.dateString;
                  const isToday = d.dateString === "2026-06-02"; // standard today
                  
                  // Count todos of this specific grid cell
                  const cellTodos = todos.filter(t => t.dueDate === d.dateString);
                  const cellCompleted = cellTodos.length > 0 && cellTodos.every(t => t.completed || t.progress === 100);
                  const cellHasTodo = cellTodos.length > 0;

                  return (
                    <div 
                      key={index} 
                      onClick={() => setSelectedDate(d.dateString)}
                      className="flex flex-col items-center justify-center cursor-pointer group relative"
                    >
                      {/* Outer circle for selection or today */}
                      <div className={`
                        w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all relative
                        ${isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-200" : ""}
                        ${!isSelected && isToday ? "border-2 border-blue-500 text-blue-700" : ""}
                        ${!isSelected && !isToday && d.isMainMonth ? "text-slate-800 hover:bg-slate-100" : ""}
                        ${!isSelected && !isToday && !d.isMainMonth ? "text-slate-300" : ""}
                      `}>
                        {d.label}

                        {/* Special Check icons as depicted in photo */}
                        {d.dateString === "2026-06-13" && !isSelected && (
                          <span className="absolute -top-1 -right-1 bg-teal-500 text-white rounded-full p-0.5 scale-75">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </span>
                        )}

                        {/* Blue check or small dots for completed status */}
                        {cellCompleted && !isSelected && d.dateString !== "2026-06-13" && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                      </div>

                      {/* Little indicators below date cells as shown in photo */}
                      <div className="h-4 flex items-center justify-center mt-0.5">
                        {cellHasTodo && (
                          <span className={`w-1.5 h-1.5 rounded-full ${cellCompleted ? "bg-blue-500" : "border border-blue-400 bg-white"}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM MOTIVATIVE QUOTE BANNER */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-5 border border-indigo-100/50 relative overflow-hidden hidden lg:block">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 opacity-5 pointer-events-none">
                <Smile className="w-32 h-32 text-indigo-900" />
              </div>
              <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest mb-1.5">오늘의 성찰 가치</p>
              <blockquote className="text-sm font-extrabold text-slate-800 leading-relaxed">
                "작은 오늘의 선택과 꾸준함이 내일의 완성형 나를 빚어냅니다."
              </blockquote>
              <p className="text-xs text-slate-400 mt-2 font-semibold">— 스스로를 세우는 습관</p>
            </div>
          </div>

          {/* RIGHT SECTION: DAILY PLANS, STATS & FILTERS */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* SELECTED DATE HEADER SECTION */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100">
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-100">
                <div>
                  <span className="text-base font-bold text-slate-850 mr-2">
                    {month}월 {dateNum}일 {dayName}요일계획
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2.5 py-0.5 rounded-full">
                    일과 {currentDayTodos.length}개
                  </span>
                </div>
                {currentDayStats.total > 0 && (
                  <span className="text-xs font-bold text-blue-600 font-mono">
                    진행도 {currentDayStats.percentage}%
                  </span>
                )}
              </div>

              {/* DYNAMIC PROGRESS BAR */}
              {currentDayStats.total > 0 ? (
                <div className="mt-3.5">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      key={selectedDate}
                      initial={{ width: 0 }}
                      animate={{ width: `${currentDayStats.percentage}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="bg-blue-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 mt-2">오늘 등록된 이정표가 없습니다. 상단의 할 일이나 명언 탭을 확인해 추천 루틴을 받아보세요!</p>
              )}
            </div>

            {/* COMPREHENSIVE CATEGORY FILTER BUBBLES */}
            <div className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
              {(["전체", "학습", "과제", "개인", "기타"] as const).map((cat) => {
                const isSel = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      flex items-center px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer
                      ${isSel 
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                        : "bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50"
                      }
                    `}
                  >
                    {cat === "학습" && <BookOpen className="w-3.5 h-3.5 mr-1" />}
                    {cat === "과제" && <FileText className="w-3.5 h-3.5 mr-1" />}
                    {cat === "개인" && <Smile className="w-3.5 h-3.5 mr-1" />}
                    {cat === "기타" && <Compass className="w-3.5 h-3.5 mr-1" />}
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* TODO ITEMS FEED */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredTodos.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center text-slate-400 text-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-5.5 h-5.5 text-slate-300" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 block">
                      {selectedCategory === "전체" 
                        ? "선택된 날짜에 계획된 할 일이 없습니다." 
                        : `"${selectedCategory}" 분류에 해당하는 할 일이 없습니다.`}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">하단의 우측 플러스(+) 버튼을 터치하여 바로 할 일을 정립해보세요!</p>
                  </motion.div>
                ) : (
                  filteredTodos.map((item) => {
                    const catColor = getCategoryColor(item.category);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`
                          relative p-4 rounded-2xl bg-white border shadow-xs transition-all duration-200
                          ${item.completed 
                            ? "border-emerald-100 bg-emerald-50/20 opacity-80" 
                            : "border-slate-100 hover:shadow-xs group hover:border-blue-205"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                            {/* Checkbox Icon */}
                            <button 
                              onClick={() => handleToggleTodo(item.id)}
                              className="mt-0.5 focus:outline-none cursor-pointer"
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-5.5 h-5.5 text-blue-605 fill-blue-50" />
                              ) : (
                                <Circle className="w-5.5 h-5.5 text-slate-250 hover:text-blue-500 transition-colors" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              {/* Title & Badge */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`
                                  font-bold text-sm text-slate-800 tracking-tight transition-all truncate
                                  ${item.completed ? "line-through text-slate-400" : ""}
                                `}>
                                  {item.title}
                                </span>
                                
                                {/* Category Badge */}
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${catColor}`}>
                                  {item.category}
                                </span>

                                {/* Priority Badge */}
                                {item.priority === "높음" && !item.completed && (
                                  <span className="flex items-center text-[9px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded">
                                    <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> High
                                  </span>
                                )}
                              </div>

                              {/* Target time indicator */}
                              <div className="flex space-x-3.5 mt-1 text-[11px] text-slate-400 font-medium">
                                <span>마감: {item.dueDate === "2026-06-02" ? "오늘" : item.dueDate} {item.time}</span>
                                {item.notify && (
                                  <span className="flex items-center text-blue-500 font-semibold">
                                    <Bell className="w-3 h-3 mr-0.5" /> 알림 ON
                                  </span>
                                )}
                              </div>

                              {/* Memo text block if exists */}
                              {item.memo && (
                                <p className="mt-2 text-xs text-slate-500 bg-slate-50/80 p-2 rounded-xl leading-normal">
                                  {item.memo}
                                </p>
                              )}

                              {/* Actionable Slider (Progress slider to change completion) */}
                              {!item.completed && (
                                <div className="mt-3 pt-2.5 border-t border-slate-50">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400">진행 분량 기입</span>
                                    <span className="text-[10px] font-bold text-blue-600 font-mono">{item.progress}%</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="100" 
                                      value={item.progress} 
                                      onChange={(e) => handleProgressChange(item.id, Number(e.target.value))}
                                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                                    />
                                  </div>
                                </div>
                              )}

                              {item.completed && (
                                <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 완료되었습니다! (100%)
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action button triggers */}
                          <div className="flex items-center space-x-1 ml-1.5 shrink-0 self-start">
                            <button 
                              onClick={() => setEditingTodo(item)}
                              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-xl text-slate-350 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer"
                              title="수정하기"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTodo(item.id)}
                              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-xl text-slate-350 hover:text-rose-500 hover:bg-slate-50 transition-all cursor-pointer"
                              title="삭제하기"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Mobile-only visible quote card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl p-5 border border-indigo-100/50 text-center relative overflow-hidden lg:hidden">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">오늘의 명언</p>
              <blockquote className="text-xs font-bold text-slate-800 leading-snug">
                "작은 오늘의 선택이 완벽한 내일의 기초가 됩니다."
              </blockquote>
            </div>

          </div>

        </div>
      </div>

      {/* FLOATING ACTION ADD BUTTON */}
      <button 
        onClick={onNavigateAddTodo}
        className="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
        id="btn-add-todo"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* EDIT TODO DIALOG OVERLAY */}
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
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md border border-slate-150 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="p-1 w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-base text-slate-900">할 일 수정하기</h3>
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
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-855"
                    placeholder="수정할 할 일을 입력해 주세요"
                  />
                </div>

                {/* Grid: Category & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">카테고리</label>
                    <select
                      value={editingTodo.category}
                      onChange={(e) => setEditingTodo({ ...editingTodo, category: e.target.value as Category })}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-700 cursor-pointer"
                    >
                      <option value="학습">📚 학습</option>
                      <option value="과제">📝 과제</option>
                      <option value="개인">🌱 개인</option>
                      <option value="기타">💬 기타</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-500">우선순위</label>
                    <select
                      value={editingTodo.priority}
                      onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value as Priority })}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-700 cursor-pointer"
                    >
                      <option value="높음">🔥 높음</option>
                      <option value="보통">⚡ 보통</option>
                      <option value="낮음">🎈 낮음</option>
                    </select>
                  </div>
                </div>

                {/* Grid: Due Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">마감 기한 (날짜)</label>
                    <input 
                      type="date"
                      required
                      value={editingTodo.dueDate}
                      onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-755"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">시간 설정</label>
                    <input 
                      type="time"
                      required
                      value={editingTodo.time}
                      onChange={(e) => setEditingTodo({ ...editingTodo, time: e.target.value })}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-755"
                    />
                  </div>
                </div>

                {/* Progress Slider */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 font-sans">진행도</label>
                    <span className="text-xs font-bold text-blue-600 font-mono">{editingTodo.progress}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={editingTodo.progress}
                      onChange={(e) => {
                        const progressVal = Number(e.target.value);
                        setEditingTodo({
                          ...editingTodo,
                          progress: progressVal,
                          completed: progressVal === 100
                        });
                      }}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>

                {/* Memo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">상세 메모</label>
                  <textarea 
                    value={editingTodo.memo}
                    onChange={(e) => setEditingTodo({ ...editingTodo, memo: e.target.value })}
                    rows={2}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-350 resize-none animate-none"
                    placeholder="인센티브나 세부사항을 메모해 주세요"
                  />
                </div>

                {/* Switch: Notify */}
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center space-x-1">
                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-bold text-slate-600">알림 설정</span>
                  </div>
                  <label className="inline-flex items-center cursor-pointer relative">
                    <input 
                      type="checkbox" 
                      checked={editingTodo.notify} 
                      onChange={(e) => setEditingTodo({ ...editingTodo, notify: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-250 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
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
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer text-center"
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
