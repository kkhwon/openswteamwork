import React, { useState, useEffect } from "react";
import { 
  User, 
  Clock, 
  Trash2, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Calendar,
  AlertTriangle,
  Flame,
  Info,
  Bell,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsViewProps {
  customName: string;
  setCustomName: (name: string) => void;
  selectedDate: string; // "YYYY-MM-DD"
  setSelectedDate: (date: string) => void;
  onResetData: () => void;
  onTriggerTestNotification?: () => void;
}

export default function SettingsView({
  customName,
  setCustomName,
  selectedDate,
  setSelectedDate,
  onResetData,
  onTriggerTestNotification,
}: SettingsViewProps) {
  const [userName, setUserName] = useState(customName);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // Read permission state dynamically
  const [permStatus, setPermStatus] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const handleRequestPermissionLocally = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermStatus("unsupported");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setPermStatus(res);
    } catch (e) {
      console.warn("Iframe blocked standard permission request modal in security context:", e);
    }
  };

  const handleUpdateName = () => {
    if (!userName.trim()) return;
    setCustomName(userName.trim());
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
    }, 2000);
  };

  // Preset travel dates
  const handleFastTravel = (targetDate: string) => {
    setSelectedDate(targetDate);
  };

  return (
    <div id="settings-view-container" className="flex flex-col h-full bg-slate-50 text-slate-850">
      
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center px-5 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-pastel-500" />
          <h1 className="font-bold text-lg text-slate-900 tracking-tight">설정</h1>
        </div>
        <Sparkles className="w-4.5 h-4.5 text-pastel-400" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-6">

        {/* SECTION 1: USER PROFILE NAME SETTINGS */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center">
            <span className="w-2 mr-2 h-2.5 rounded bg-pastel-400" />
            사용자 성찰 프로필
          </h2>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 block">이름 / 슬로건 수정</label>
            <div className="flex space-x-2.5">
              <input 
                type="text" 
                className="flex-1 text-xs font-bold bg-slate-100 rounded-xl px-4 py-2.5 border-none focus:outline-none focus:ring-2 focus:ring-pastel-100 text-slate-800"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <button
                onClick={handleUpdateName}
                className="bg-pastel-400 hover:bg-pastel-500 text-white font-bold text-xs px-4 py-1 rounded-xl shadow-sm cursor-pointer transition-all active:scale-95"
              >
                변경
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showSavedMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold p-2 rounded-lg flex items-center border border-emerald-100 gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                프로필 이름이 성공적으로 반영되었습니다!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 1.5: NOTIFICATION MANAGER & TESTING */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1">
              <span className="w-2 h-2.5 rounded bg-pastel-400" />
              스마트 마감 알림 서비스 설정 🔔
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              할 일 추가/수정 시 설정한 정시에 성장 자극 푸시 알림과 알림 소리(Beep)를 정밀 전송합니다. 브라우저 보안 및 iFrame 샌드박스로 인해 차단된 상황을 대비해 고품질 인앱 전용 멀티 밸류 배너 알림이 무조건 예외 없이 지원됩니다.
            </p>
          </div>

          {/* PERMISSION STATUS */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-slate-400" /> 알림 권한 상태
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
              permStatus === "granted" 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                : permStatus === "denied"
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}>
              {permStatus === "granted" 
                ? "● 활성화 승인됨" 
                : permStatus === "denied"
                ? "● 시스템상 거부됨"
                : "● 대기중 (In-App Only)"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleRequestPermissionLocally}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-slate-150 flex items-center justify-center gap-1"
            >
              알림 승낙 신청
            </button>
            <button
              onClick={onTriggerTestNotification}
              className="py-2.5 px-3 bg-pastel-400 hover:bg-pastel-500 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-sm shadow-pastel-100 flex items-center justify-center gap-1"
            >
              테스트 알림 발송 🚀
            </button>
          </div>
        </div>

        {/* SECTION 2: SYSTEM DATE TIME MACHINE (타임머신 시뮬레이터) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1">
              <span className="w-2 h-2.5 rounded bg-indigo-500" />
              가상 시간 시뮬레이터 (Time Machine)
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              할 일들의 예정 만료 알림 상태 변경, 또는 타임캡슐 잠금 상자를 미리 열어보고 검토하기 위해 시스템 고유 일정을 임시 미래 시점으로 이동합니다.
            </p>
          </div>

          {/* CURRENT SYSTEM TIME DISPLAY */}
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100/50 flex justify-between items-center text-slate-800">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">현재 인공 시스템 시각</span>
              <span className="text-sm font-extrabold tracking-tight block font-mono">{selectedDate} (화)</span>
            </div>
            
            <Clock className="w-6 h-6 text-indigo-500 animate-spin" style={{ animationDuration: "12s" }} />
          </div>

          {/* DATES QUICK FAST TRAVEL */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 block">원클릭 시점 이동 단축키:</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleFastTravel("2026-06-02")}
                className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer
                  ${selectedDate === "2026-06-02" 
                    ? "bg-pastel-400 text-white border-pastel-400 shadow-sm"
                    : "bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-600"
                  }
                `}
              >
                기준점 (2026-06-02)
              </button>
              <button 
                onClick={() => handleFastTravel("2026-12-31")}
                className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer
                  ${selectedDate === "2026-12-31" 
                    ? "bg-pastel-400 text-white border-pastel-400 shadow-sm"
                    : "bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-600"
                  }
                `}
              >
                개봉일 (2026-12-31)
              </button>
            </div>
          </div>

          {/* CHOOSE CUSTOM DATE INPUT */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 block">날짜 임의 지정:</label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              <input 
                type="date"
                className="w-full text-xs font-semibold bg-slate-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SYSTEM RESET */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1">
              <span className="w-2 h-2.5 rounded bg-rose-500" />
              데이터 지우기 / 공장 초기화
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              플래너에 저장된 모든 할 일, 시간표 레코드 및 타임캡슐 등을 완벽하게 삭제하고 기본 예제 데이터셋으로 되돌립니다.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm("정말로 모든 기록 데이터를 리셋하고 초기로 복구하시겠습니까?")) {
                onResetData();
              }
            }}
            className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 transition-colors rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            id="btn-reset-data"
          >
            <Trash2 className="w-4 h-4" />
            모든 데이터 초기화 및 기본값 복구
          </button>
        </div>

        {/* SECTION 4: INFORMATION ABOUT HARU ROUTINE */}
        <div className="bg-slate-100 rounded-3xl p-5 border border-slate-150 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mx-auto">
            <Info className="w-4.5 h-4.5 text-slate-500" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 block">하루 루틴 v1.0.0 (AI Edition)</span>
          <p className="text-[10px] text-slate-400 leading-normal">
            본 웹 어플리케이션은 사용자의 기분에 연동되는 스마트 할 일 추천, 시간표 충돌 관리 및 미래 성장 서신(타임캡슐)을 지원합니다.
          </p>
          <span className="text-[12px] font-extrabold text-pastel-700 block bg-pastel-50 p-1.5 rounded-full border border-pastel-100 max-w-max mx-auto px-4">
            기합 넘치게 성장하는 당신을 응원합니다 🔥
          </span>
        </div>

      </div>
    </div>
  );
}
