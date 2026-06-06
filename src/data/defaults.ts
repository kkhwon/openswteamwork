import { Todo, TimeCapsule, TimetableEvent } from "../types";

export const DEFAULT_TODOS: Todo[] = [
  {
    id: "todo-1",
    title: "운영체제 과제 제출",
    dueDate: "2026-06-02",
    time: "23:59",
    priority: "높음",
    category: "과제",
    progress: 30,
    memo: "가상 메모리 관리 및 빈 주소 검색 알고리즘 구현 레포트 제출하기",
    notify: true,
    completed: false
  },
  {
    id: "todo-2",
    title: "알고리즘 문제 풀이",
    dueDate: "2026-06-02",
    time: "15:00",
    priority: "높음",
    category: "학습",
    progress: 70,
    memo: "실전 백준 동적계획법(DP) 및 이진 탐색 중급 문제 3개 풀이",
    notify: false,
    completed: false
  },
  {
    id: "todo-3",
    title: "독서 30분",
    dueDate: "2026-06-02",
    time: "20:00",
    priority: "보통",
    category: "개인",
    progress: 100,
    memo: "스콧 영의 울트라러닝 4장 읽기",
    notify: true,
    completed: true
  },
  {
    id: "todo-4",
    title: "데이터베이스 실습 과제",
    dueDate: "2026-06-03",
    time: "18:00",
    priority: "보통",
    category: "과제",
    progress: 0,
    memo: "SQL 서브쿼리 및 인덱싱 성능 분석 실습하기",
    notify: false,
    completed: false
  }
];

export const DEFAULT_TIMETABLE: TimetableEvent[] = [
  // Monday (월요일)
  {
    id: "time-mon-1",
    title: "Physics Class",
    startTime: "08:00",
    endTime: "09:30",
    dayOfWeek: 1,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-mon-2",
    title: "Study in Student Lounge",
    startTime: "09:45",
    endTime: "11:15",
    dayOfWeek: 1,
    color: "bg-[#ACBFD4] text-slate-900 border-[#ACBFD4]"
  },
  {
    id: "time-mon-3",
    title: "Coffee Catchup",
    startTime: "11:30",
    endTime: "12:30",
    dayOfWeek: 1,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-mon-4",
    title: "Study Calculus with Jamie",
    startTime: "13:00",
    endTime: "14:00",
    dayOfWeek: 1,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },
  {
    id: "time-mon-5",
    title: "Weightlifting at LA",
    startTime: "14:30",
    endTime: "15:45",
    dayOfWeek: 1,
    color: "bg-[#889BB0] text-white border-[#889BB0]"
  },
  {
    id: "time-mon-6",
    title: "Watch S2",
    startTime: "16:15",
    endTime: "17:15",
    dayOfWeek: 1,
    color: "bg-[#566C86] text-white border-[#566C86]"
  },
  {
    id: "time-mon-7",
    title: "Study for Calculus Exam",
    startTime: "17:30",
    endTime: "18:15",
    dayOfWeek: 1,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },

  // Tuesday (화요일)
  {
    id: "time-tue-1",
    title: "Pilates",
    startTime: "08:00",
    endTime: "09:00",
    dayOfWeek: 2,
    color: "bg-[#889BB0] text-white border-[#889BB0]"
  },
  {
    id: "time-tue-2",
    title: "Group Project Presentation",
    startTime: "09:15",
    endTime: "10:00",
    dayOfWeek: 2,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-tue-3",
    title: "English Class",
    startTime: "10:00",
    endTime: "11:30",
    dayOfWeek: 2,
    color: "bg-[#ACBFD4] text-slate-900 border-[#ACBFD4]"
  },
  {
    id: "time-tue-4",
    title: "Calculus Class",
    startTime: "11:30",
    endTime: "13:00",
    dayOfWeek: 2,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },
  {
    id: "time-tue-5",
    title: "Lunch with Isabella",
    startTime: "13:15",
    endTime: "14:15",
    dayOfWeek: 2,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-tue-6",
    title: "Group Project Meeting",
    startTime: "14:45",
    endTime: "15:45",
    dayOfWeek: 2,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-tue-7",
    title: "Calculus Exam Online",
    startTime: "16:15",
    endTime: "17:45",
    dayOfWeek: 2,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },
  {
    id: "time-tue-8",
    title: "Chipotle with David",
    startTime: "18:00",
    endTime: "19:00",
    dayOfWeek: 2,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },

  // Wednesday (수요일)
  {
    id: "time-wed-1",
    title: "Physics Class",
    startTime: "08:00",
    endTime: "09:30",
    dayOfWeek: 3,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-wed-2",
    title: "Study in Student Lounge",
    startTime: "09:45",
    endTime: "11:15",
    dayOfWeek: 3,
    color: "bg-[#ACBFD4] text-slate-900 border-[#ACBFD4]"
  },
  {
    id: "time-wed-3",
    title: "Lunch with Mom",
    startTime: "11:15",
    endTime: "12:30",
    dayOfWeek: 3,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-wed-4",
    title: "Study for Physics Exam",
    startTime: "13:00",
    endTime: "14:30",
    dayOfWeek: 3,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-wed-5",
    title: "Dorm Time",
    startTime: "14:45",
    endTime: "16:30",
    dayOfWeek: 3,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },
  {
    id: "time-wed-6",
    title: "Hair Appointment",
    startTime: "16:45",
    endTime: "18:15",
    dayOfWeek: 3,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },

  // Thursday (목요일)
  {
    id: "time-thu-1",
    title: "Pilates",
    startTime: "08:00",
    endTime: "09:00",
    dayOfWeek: 4,
    color: "bg-[#889BB0] text-white border-[#889BB0]"
  },
  {
    id: "time-thu-2",
    title: "Breakfast with Kelly",
    startTime: "09:00",
    endTime: "09:45",
    dayOfWeek: 4,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },
  {
    id: "time-thu-3",
    title: "English Class",
    startTime: "10:00",
    endTime: "11:30",
    dayOfWeek: 4,
    color: "bg-[#ACBFD4] text-slate-900 border-[#ACBFD4]"
  },
  {
    id: "time-thu-4",
    title: "Calculus Class",
    startTime: "11:30",
    endTime: "13:00",
    dayOfWeek: 4,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },
  {
    id: "time-thu-5",
    title: "Running 2 Miles",
    startTime: "13:15",
    endTime: "14:30",
    dayOfWeek: 4,
    color: "bg-[#889BB0] text-white border-[#889BB0]"
  },
  {
    id: "time-thu-6",
    title: "Professional Development Networking",
    startTime: "15:15",
    endTime: "17:15",
    dayOfWeek: 4,
    color: "bg-[#ACBFD4] text-slate-900 border-[#ACBFD4]"
  },
  {
    id: "time-thu-7",
    title: "Watch S2",
    startTime: "17:45",
    endTime: "19:00",
    dayOfWeek: 4,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },

  // Friday (금요일)
  {
    id: "time-fri-1",
    title: "Physics Class",
    startTime: "08:05",
    endTime: "09:30",
    dayOfWeek: 5,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-fri-2",
    title: "Study in Student Lounge",
    startTime: "09:45",
    endTime: "11:15",
    dayOfWeek: 5,
    color: "bg-[#ACBFD4] text-slate-900 border-[#ACBFD4]"
  },
  {
    id: "time-fri-3",
    title: "Lunch with Grandma",
    startTime: "11:15",
    endTime: "12:15",
    dayOfWeek: 5,
    color: "bg-[#15253F] text-white border-[#15253F]"
  },
  {
    id: "time-fri-4",
    title: "Dorm Time",
    startTime: "12:30",
    endTime: "13:15",
    dayOfWeek: 5,
    color: "bg-[#354E6B] text-white border-[#354E6B]"
  },
  {
    id: "time-fri-5",
    title: "Creative Writing HW due",
    startTime: "13:30",
    endTime: "14:15",
    dayOfWeek: 5,
    color: "bg-[#ACBFD4] text-slate-900 border-[#ACBFD4]"
  },
  {
    id: "time-fri-6",
    title: "Weightlifting at LA",
    startTime: "14:30",
    endTime: "15:45",
    dayOfWeek: 5,
    color: "bg-[#889BB0] text-white border-[#889BB0]"
  },
  {
    id: "time-fri-7",
    title: "Dinner with David",
    startTime: "16:30",
    endTime: "17:45",
    dayOfWeek: 5,
    color: "bg-[#15253F] text-white border-[#15253F]"
  }
];

export const DEFAULT_CAPSULES: TimeCapsule[] = [
  {
    id: "capsule-1",
    unlockDate: "2026-12-31",
    content: "올해의 목표를 이루고 더 성장한 나를 만나길!✨ 주니어 개발자로서 한 걸음 더 전진했기를 스스로 믿어 의심치 않아.",
    createdAt: "2026-06-02"
  },
  {
    id: "capsule-2",
    unlockDate: "2026-08-30",
    content: "뜨거웠던 여름날 열심히 흘린 땀방울이 시원한 가을바람과 함께 큰 결실을 보기를 바랄게! 화이팅!",
    createdAt: "2026-06-02"
  }
];

export const DUMMY_KOREAN_QUOTES = [
  { text: "작은 오늘의 선택이 내일의 나를 만듭니다.", author: "스티브 잡스" },
  { text: "성공은 매일 반복되는 작은 노력들의 합이다.", author: "로버트 콜리어" },
  { text: "장벽이란 그것을 얼마나 간절히 극복하고 싶은지 깨닫게 해주는 기회이다.", author: "랜디 포시" },
  { text: "시도하지 않은 기회는 100% 손실되는 법이다.", author: "웨인 그레츠키" },
  { text: "당신의 능력보다 성실하게 보내는 하루하루가 결국 큰 발자취를 남긴다.", author: "에디슨" }
];
