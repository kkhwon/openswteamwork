import { useState } from "react";
import { Todo, Priority, Category } from "../types";
import { 
  ArrowLeft, 
  Check, 
  Calendar, 
  Clock, 
  BookOpen, 
  FileText, 
  Smile, 
  Compass, 
  Bell, 
  CheckCircle2,
  ListTodo
} from "lucide-react";
import { motion } from "motion/react";

interface AddTodoViewProps {
  onSave: (todo: Omit<Todo, "id">) => void;
  onCancel: () => void;
  initialDate: string; // "YYYY-MM-DD"
}

export default function AddTodoView({ onSave, onCancel, initialDate }: AddTodoViewProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(initialDate);
  const [time, setTime] = useState("15:00");
  const [priority, setPriority] = useState<Priority>("보통");
  const [category, setCategory] = useState<Category>("학습");
  const [progress, setProgress] = useState(0);
  const [memo, setMemo] = useState("");
  const [notify, setNotify] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Status mapping for progress quick buttons
  // "예정" (0%), "진행중" (30%), "거의 완료" (70%), "완료" (100%)
  const handleStatusSelect = (status: "예정" | "진행중" | "거의 완료" | "완료") => {
    switch (status) {
      case "예정": 
        setProgress(0); 
        setCompleted(false);
        break;
      case "진행중": 
        setProgress(30); 
        setCompleted(false);
        break;
      case "거의 완료": 
        setProgress(70); 
        setCompleted(false);
        break;
      case "완료": 
        setProgress(100); 
        setCompleted(true);
        break;
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("할 일 제목을 입력해 주세요!");
      return;
    }
    onSave({
      title: title.trim(),
      dueDate,
      time,
      priority,
      category,
      progress: completed ? 100 : progress,
      memo: memo.trim(),
      notify,
      completed: completed || progress === 100
    });
  };

  return (
    <div id="add-todo-container" className="flex flex-col h-full bg-slate-50 text-slate-800">
      
      {/* HEADER BAR */}
      <header className="flex justify-between items-center px-5 py-4 bg-white border-b border-slate-100">
        <button 
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base text-slate-850">할 일 추가</h1>
        <button 
          onClick={handleSave}
          className="p-1 rounded-full hover:bg-slate-100 text-pastel-600 cursor-pointer"
          disabled={!title.trim()}
          id="btn-save-check"
        >
          <Check className="w-5.5 h-5.5" />
        </button>
      </header>

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-24">
        
        {/* TASK TITLE */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">할 일 제목</label>
          <input 
            type="text" 
            placeholder="할 일 제목을 입력하세요" 
            className="w-full text-sm font-semibold bg-white border border-slate-200/80 rounded-xl px-4 py-3 focus:outline-none focus:border-pastel-400 focus:ring-2 focus:ring-pastel-100 transition-all text-slate-800 placeholder-slate-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* DUE DATE SELECTOR */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">마감일</label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="date"
              className="w-full text-sm font-semibold bg-white border border-slate-200/80 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-pastel-400 transition-all text-slate-850"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* DUE TIME SELECTOR */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">시간</label>
          <div className="relative flex items-center">
            <Clock className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="time"
              className="w-full text-sm font-semibold bg-white border border-slate-200/80 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-pastel-400 transition-all text-slate-850"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* PRIORITY SELECTION BUTTONS */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">우선순위</label>
          <div className="grid grid-cols-3 gap-2">
            {(["높음", "보통", "낮음"] as Priority[]).map((p) => {
              const isSel = priority === p;
              let btnClass = "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
              if (isSel) {
                if (p === "높음") btnClass = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
                else if (p === "보통") btnClass = "bg-pastel-50 text-pastel-700 border-pastel-200 font-bold";
                else btnClass = "bg-slate-100 text-slate-700 border-slate-300 font-bold";
              }
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2.5 px-3 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${btnClass}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">카테고리</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "학습", icon: BookOpen, color: "hover:bg-pastel-50 hover:text-pastel-600 hover:border-pastel-200" },
              { name: "과제", icon: FileText, color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" },
              { name: "개인", icon: Smile, color: "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200" },
              { name: "기타", icon: Compass, color: "hover:bg-slate-100 hover:text-slate-600 hover:border-slate-200" }
            ].map((cat) => {
              const Icon = cat.icon;
              const isSel = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name as Category)}
                  className={`
                    flex flex-col items-center justify-center py-3 px-1 border rounded-xl cursor-pointer transition-all gap-1.5
                    ${isSel 
                      ? "bg-pastel-400 text-white border-pastel-400 shadow-sm" 
                      : `bg-white text-slate-500 border-slate-200/80 ${cat.color}`
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PROGRESS PRESETS & SLIDER */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">진행도</label>
          
          {/* Quick Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { name: "예정", active: progress === 0 && !completed },
              { name: "진행중", active: progress > 0 && progress < 70 && !completed },
              { name: "거의 완료", active: progress >= 70 && progress < 100 && !completed },
              { name: "완료", active: completed || progress === 100 }
            ].map((status, index) => {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleStatusSelect(status.name as any)}
                  className={`
                    py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer
                    ${status.active 
                      ? "bg-pastel-400 text-white border-pastel-400" 
                      : "bg-white text-slate-500 border-slate-150 hover:bg-slate-50"
                    }
                  `}
                >
                  {status.name}
                </button>
              );
            })}
          </div>

          {/* Detailed adjustment slider */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-150/80">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-slate-400">진행도 상세조정</span>
              <span className="text-xs font-bold text-pastel-600">{progress}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgress(val);
                if (val === 100) setCompleted(true);
                else if (val < 100 && completed) setCompleted(false);
              }}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pastel-400"
            />
          </div>
        </div>

        {/* NOTES TEXTAREA */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">메모</label>
          <textarea 
            placeholder="메모를 입력하세요" 
            rows={3}
            className="w-full text-sm font-medium bg-white border border-slate-200/80 rounded-xl px-4 py-3 focus:outline-none focus:border-pastel-400 focus:ring-2 focus:ring-pastel-100 transition-all text-slate-800 placeholder-slate-300 resize-none"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        {/* TOGGLE SWITCHES */}
        <div className="bg-white rounded-xl border border-slate-150/80 divide-y divide-slate-100">
          
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-700">알림</p>
                <p className="text-[10px] text-slate-400">마감 직전 푸시 마일리지 추가</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={notify}
                onChange={() => setNotify(!notify)}
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-pastel-100 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pastel-300"></div>
            </label>
          </div>

          {/* Mark completed toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-700">완료 여부</p>
                <p className="text-[10px] text-slate-400">계획 완료로 즉시 표시하기</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={completed}
                onChange={() => {
                  const nextVal = !completed;
                  setCompleted(nextVal);
                  if (nextVal) setProgress(100);
                  else if (progress === 100) setProgress(50);
                }}
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-pastel-100 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pastel-300"></div>
            </label>
          </div>
        </div>

        {/* BIG SAVE BUTTON */}
        <button 
          onClick={handleSave}
          disabled={!title.trim()}
          className={`
            w-full py-3.5 rounded-xl font-bold text-sm tracking-tight transition-all cursor-pointer shadow-md
            ${title.trim() 
              ? "bg-pastel-400 text-white hover:bg-pastel-500 shadow-pastel-100 hover:shadow-lg active:scale-[0.98]" 
              : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
            }
          `}
          id="btn-big-save"
        >
          저장
        </button>

      </div>
    </div>
  );
}
