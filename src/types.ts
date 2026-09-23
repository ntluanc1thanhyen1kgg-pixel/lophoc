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

export interface QuestionFolder {
  id: string;
  name: string;
  description?: string;
  color?: string; // HEX color or tailwind color code
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options
  correctIndex: number; // 0, 1, 2, 3
  subject?: string;
  folderId?: string; // ID of QuestionFolder
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
  questionFolders?: QuestionFolder[];
  wheelQuizEnabled?: boolean;
  wheelQuizTimer?: number; // seconds, e.g. 15
  wheelQuizSubject?: string; // 'all' or specific subject
  wheelQuizFolderId?: string; // 'all', 'uncategorized', or specific folder ID
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

// ==========================================
// KẾ HOẠCH DẠY HỌC (KHDH) / LỊCH BÁO GIẢNG
// ==========================================

export interface PpctItem {
  id: string;
  grade: number | string; // Khối lớp (3, 4, 5...)
  subject: string; // Tên môn học (Tin học, Công nghệ...)
  week: number; // Tuần (1 -> 35)
  periodIndex: number; // Tiết theo PPCT
  lessonName: string; // Tên bài dạy
  integrationNote?: string; // Tích hợp (STEM, GDQP, Chuyển đổi số...)
  notes?: string; // Ghi chú thêm
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 2: Thứ Hai, 3: Thứ Ba, ..., 6: Thứ Sáu, 7: Thứ Bảy
  session: 'morning' | 'afternoon' | string; // 'morning' (Sáng) hoặc 'afternoon' (Chiều)
  period: number; // Tiết 1 -> 5
  className: string; // Lớp (3A1, 4A2...)
  subject: string; // Môn học (Tin học, Công nghệ...)
  grade: number | string; // Khối lớp
}

export interface SchoolConfig {
  schoolName: string;
  departmentName: string;
  republicTitleTop: string;
  republicTitleSub: string;
  documentTitle: string;
  subjectTitle: string;
  academicYear: string;
  startDateWeek1: string; // YYYY-MM-DD (Thứ Hai tuần 1)
  location: string;
  principalTitle: string;
  principalName: string;
  headTeacherTitle: string;
  headTeacherName: string;
  teacherTitle: string;
  teacherName: string;
}

export interface LessonPlanRow {
  id: string;
  dayOfWeek: number; // 2 -> 7
  dateStr: string; // DD/MM/YYYY
  session: string; // 'Sáng' | 'Chiều'
  period: number; // 1 -> 5
  className: string;
  subject: string;
  lessonName: string;
  integrationNote?: string;
  isCustomized?: boolean;
}

export interface LessonPlanWeek {
  weekNumber: number;
  startDate: string; // DD/MM/YYYY
  endDate: string; // DD/MM/YYYY
  rows: LessonPlanRow[];
}

export interface KhdhDataState {
  config: SchoolConfig;
  ppctList: PpctItem[];
  timetable: TimetableSlot[];
  customizedWeeks: Record<number, LessonPlanRow[]>;
}

