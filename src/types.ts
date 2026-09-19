export interface UserAccount {
  id: string;
  username: string; // Tên đăng nhập (ví dụ: admin, gv_abc)
  email: string;
  name: string; // Họ và tên
  role: 'admin' | 'teacher';
  password: string; // Mật khẩu đăng nhập
  subject?: string; // Môn giảng dạy
  school?: string; // Trường học
  year?: string; // Niên khóa
  assignedClassIds?: string[]; // Danh sách lớp phân công
  status: 'active' | 'locked'; // Trạng thái hoạt động
  avatar?: string;
  phone?: string;
  note?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Student {
  id: string;
  classId: string;
  name: string;
  gender: 'Nam' | 'Nữ' | 'Khác' | string;
  coins: number;
  avatar: string;
  favorite: boolean;
  note: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  year: string;
  color: string;
  bannerUrl?: string;
  slogan?: string;
  hideBannerText?: boolean;
}

export interface TeacherProfile {
  name: string;
  role: string;
  subject: string;
  school: string;
  year: string;
  avatar: string;
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface SeatingConfig {
  lanes: number;
  seats: number;
  mode: '2d' | '3d';
  deskType?: 'single' | 'double';
  assignments: Record<number, string>; // seatIndex -> studentId
}

export interface TimetableEntry {
  id: string;
  classId: string;
  day: number; // 0 = Thứ Hai, 4 = Thứ Sáu
  slot: string; // S1, S2... C1, C2...
  subject: string;
  time: string;
}

export interface TimetableConfig {
  morning: boolean;
  afternoon: boolean;
  morningCount: number;
  afternoonCount: number;
  entries: TimetableEntry[];
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  emoji: string;
  image?: string;
  stock: number;
}

export interface Redemption {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  rewardName: string;
  cost: number;
  time: string;
}

export interface CoinTransaction {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  amount: number;
  reason: string;
  subject: string;
  time: string;
}

export interface WheelHistoryItem {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  effect: string;
  time: string;
}

export interface FilmHistoryItem {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  time: string;
}

export interface LinkItem {
  id: string;
  name: string;
  url: string;
  category: string;
  desc: string;
  pinned: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options
  correctIndex: number; // 0, 1, 2, 3
  subject?: string;
  category?: string; // e.g. "Tuần 1", "Tuần 2", "Ngày 18/09/2026", "Ôn tập Bài 1"
  rewardCoins?: number; // default 2 xu
  explanation?: string;
}

export interface AppSettings {
  wheelExclude: boolean;
  filmExclude: boolean;
  tickLast10: boolean;
  timerColor: string;
}

export interface AppState {
  version: number;
  ownerUserId?: string; // ID của tài khoản giáo viên sở hữu không gian làm việc này
  activeClassId: string;
  currentPage: string;
  teacher: TeacherProfile;
  classes: ClassInfo[];
  students: Student[];
  attendance: Record<string, Record<string, AttendanceStatus>>; // classId_YYYY-MM-DD -> { studentId: status }
  attendanceDate: string;
  seating: Record<string, SeatingConfig>; // classId -> config
  timetable: TimetableConfig;
  rewards: Reward[];
  redemptions: Redemption[];
  transactions: CoinTransaction[];
  wheelHistory: WheelHistoryItem[];
  filmHistory: FilmHistoryItem[];
  links: LinkItem[];
  subjects: string[];
  settings: AppSettings;
  wheelExcluded: string[];
  filmExcluded: string[];
  wheelEffect?: string;
  wheelGroup?: 'all' | 'favorite';
  quizQuestions?: QuizQuestion[];
  quizCategories?: string[]; // Danh sách các thư mục / danh mục lưu trữ câu hỏi (ví dụ: Tuần 1, Tuần 2, Ngày 18/09/2026)
  wheelQuizEnabled?: boolean;
  wheelQuizTimer?: number; // seconds, e.g. 15
  wheelQuizSubject?: string; // 'all' or specific subject
  wheelQuizCategory?: string; // 'all' or specific category/folder name (e.g. 'Tuần 1', 'Ngày 18/09/2026')
  wheelQuizShuffleOptions?: boolean; // Tự động đảo thứ tự các đáp án A B C D khi hiển thị
  usedQuizQuestionIds?: string[]; // IDs of questions already asked, to ensure no duplicates
}

export const DEFAULT_SUBJECTS: string[] = [
  'Ghi chung / Nề nếp',
  'Toán',
  'Tiếng Việt',
  'Tiếng Anh',
  'Tự nhiên & Xã hội',
  'Khoa học',
  'Lịch sử & Địa lý',
  'Tin học và Công nghệ',
  'Tin học',
  'Công nghệ',
  'Mĩ thuật',
  'Âm nhạc',
  'Giáo dục thể chất',
  'Đạo đức',
  'Hoạt động trải nghiệm',
  'Sinh hoạt lớp',
  'Chào cờ'
];

export const DAYS_OF_WEEK = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu'
];

export const WHEEL_EFFECTS = [
  'Xoáy tròn',
  'Tung nảy',
  'Hút vào tâm',
  'Bay theo quỹ đạo',
  'Mưa bóng',
  'Sân khấu ánh sáng',
  'Sóng bồng bềnh'
];
