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
  {
    id: "time-1",
    title: "알고리즘",
    startTime: "09:00",
    endTime: "09:50",
    dayOfWeek: 2, // 화요일
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: "time-2",
    title: "운영체제",
    startTime: "10:00",
    endTime: "10:50",
    dayOfWeek: 2, // 화요일
    color: "bg-violet-50 text-violet-700 border-violet-200"
  },
  {
    id: "time-3",
    title: "데이터베이스",
    startTime: "11:00",
    endTime: "11:50",
    dayOfWeek: 2, // 화요일
    color: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "time-4",
    title: "프로젝트",
    startTime: "13:00",
    endTime: "15:50",
    dayOfWeek: 2, // 화요일
    color: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: "time-5",
    title: "자료구조",
    startTime: "16:00",
    endTime: "16:50",
    dayOfWeek: 2, // 화요일
    color: "bg-sky-50 text-sky-700 border-sky-200"
  },
  {
    id: "time-6",
    title: "컴퓨터네트워크",
    startTime: "17:00",
    endTime: "17:50",
    dayOfWeek: 2, // 화요일
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
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
