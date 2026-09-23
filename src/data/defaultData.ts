import { SchoolConfig, PpctItem, TimetableSlot } from '../types';

export const defaultSchoolConfig: SchoolConfig = {
  schoolName: 'TRƯỜNG TIỂU HỌC THẠNH YÊN 1',
  departmentName: 'TỔ CHUYÊN MÔN 4+5',
  republicTitleTop: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
  republicTitleSub: 'Độc lập – Tự do – Hạnh phúc',
  documentTitle: 'KẾ HOẠCH DẠY HỌC',
  subjectTitle: 'MÔN: TIN HỌC - CÔNG NGHỆ',
  academicYear: 'Năm học 2024 - 2025',
  startDateWeek1: '2024-09-09',
  location: 'Vĩnh Hòa',
  principalTitle: 'DUYỆT CỦA P.HIỆU TRƯỜNG',
  principalName: '',
  headTeacherTitle: 'TỔ TRƯỞNG',
  headTeacherName: '',
  teacherTitle: 'GIÁO VIÊN',
  teacherName: 'Nguyễn Tấn Luận'
};

export const defaultPpctList: PpctItem[] = [
  // Khối 3 - Môn Tin học
  { id: 'p3-1', grade: 3, subject: 'Tin học', week: 1, periodIndex: 1, lessonName: 'Bài 1: Thông tin và quyết định (Tiết 1)', integrationNote: 'Kỹ năng quan sát và ra quyết định', notes: 'Chủ đề A' },
  { id: 'p3-2', grade: 3, subject: 'Tin học', week: 1, periodIndex: 2, lessonName: 'Bài 1: Thông tin và quyết định (Tiết 2)', integrationNote: 'Thực hành phân loại thông tin', notes: 'Chủ đề A' },
  { id: 'p3-3', grade: 3, subject: 'Tin học', week: 2, periodIndex: 3, lessonName: 'Bài 2: Xử lý thông tin (Tiết 1)', integrationNote: 'Tích hợp tư duy logic', notes: 'Chủ đề A' },
  { id: 'p3-4', grade: 3, subject: 'Tin học', week: 2, periodIndex: 4, lessonName: 'Bài 2: Xử lý thông tin (Tiết 2)', integrationNote: 'Quan sát các thiết bị số', notes: 'Chủ đề A' },
  { id: 'p3-5', grade: 3, subject: 'Tin học', week: 3, periodIndex: 5, lessonName: 'Bài 3: Máy tính - những người bạn mới (Tiết 1)', integrationNote: 'Bảo vệ an toàn thiết bị điện', notes: 'Chủ đề B' },
  { id: 'p3-6', grade: 3, subject: 'Tin học', week: 3, periodIndex: 6, lessonName: 'Bài 3: Máy tính - những người bạn mới (Tiết 2)', integrationNote: 'Nhận biết chuột, bàn phím, màn hình', notes: 'Chủ đề B' },
  { id: 'p3-7', grade: 3, subject: 'Tin học', week: 4, periodIndex: 7, lessonName: 'Bài 4: Làm việc với chuột máy tính (Tiết 1)', integrationNote: 'Thao tác cầm chuột đúng cách', notes: 'Chủ đề B' },
  { id: 'p3-8', grade: 3, subject: 'Tin học', week: 4, periodIndex: 8, lessonName: 'Bài 4: Làm việc với chuột máy tính (Tiết 2)', integrationNote: 'Luyện tập thao tác nháy đúp và kéo thả', notes: 'Chủ đề B' },
  { id: 'p3-9', grade: 3, subject: 'Tin học', week: 5, periodIndex: 9, lessonName: 'Bài 5: Bàn phím máy tính (Tiết 1)', integrationNote: 'Tư thế ngồi chuẩn, đặt tay hàng cơ sở', notes: 'Chủ đề B' },
  { id: 'p3-10', grade: 3, subject: 'Tin học', week: 5, periodIndex: 10, lessonName: 'Bài 5: Bàn phím máy tính (Tiết 2)', integrationNote: 'Luyện gõ các phím hàng cơ sở', notes: 'Chủ đề B' },
  { id: 'p3-11', grade: 3, subject: 'Tin học', week: 6, periodIndex: 11, lessonName: 'Bài 6: Khám phá thư mục (Tiết 1)', integrationNote: 'Sắp xếp đồ dùng, dữ liệu ngăn nắp', notes: 'Chủ đề C' },
  { id: 'p3-12', grade: 3, subject: 'Tin học', week: 6, periodIndex: 12, lessonName: 'Bài 6: Khám phá thư mục (Tiết 2)', integrationNote: 'Tạo thư mục học tập cá nhân', notes: 'Chủ đề C' },

  // Khối 4 - Môn Tin học
  { id: 'p4-1', grade: 4, subject: 'Tin học', week: 1, periodIndex: 1, lessonName: 'Bài 1: Phần cứng và phần mềm máy tính (Tiết 1)', integrationNote: 'Nhận biết thiết bị ngoại vi', notes: 'Chủ đề A' },
  { id: 'p4-2', grade: 4, subject: 'Tin học', week: 1, periodIndex: 2, lessonName: 'Bài 1: Phần cứng và phần mềm máy tính (Tiết 2)', integrationNote: 'Ý thức giữ gìn thiết bị', notes: 'Chủ đề A' },
  { id: 'p4-3', grade: 4, subject: 'Tin học', week: 2, periodIndex: 3, lessonName: 'Bài 2: Thao tác an toàn khi sử dụng máy tính (Tiết 1)', integrationNote: 'An toàn điện và sức khỏe thị giác', notes: 'Chủ đề A' },
  { id: 'p4-4', grade: 4, subject: 'Tin học', week: 2, periodIndex: 4, lessonName: 'Bài 2: Thao tác an toàn khi sử dụng máy tính (Tiết 2)', integrationNote: 'Thực hành vệ sinh góc học tập', notes: 'Chủ đề A' },
  { id: 'p4-5', grade: 4, subject: 'Tin học', week: 3, periodIndex: 5, lessonName: 'Bài 3: Tìm kiếm thông tin trên Internet (Tiết 1)', integrationNote: 'Kỹ năng tìm kiếm từ khóa an toàn', notes: 'Chủ đề C' },
  { id: 'p4-6', grade: 4, subject: 'Tin học', week: 3, periodIndex: 6, lessonName: 'Bài 3: Tìm kiếm thông tin trên Internet (Tiết 2)', integrationNote: 'Đánh giá độ tin cậy thông tin', notes: 'Chủ đề C' },
  { id: 'p4-7', grade: 4, subject: 'Tin học', week: 4, periodIndex: 7, lessonName: 'Bài 4: Soạn thảo văn bản tiếng Việt (Tiết 1)', integrationNote: 'Quy tắc gõ dấu thanh tiếng Việt', notes: 'Chủ đề E' },
  { id: 'p4-8', grade: 4, subject: 'Tin học', week: 4, periodIndex: 8, lessonName: 'Bài 4: Soạn thảo văn bản tiếng Việt (Tiết 2)', integrationNote: 'Định dạng phông chữ, cỡ chữ văn bản', notes: 'Chủ đề E' },

  // Khối 5 - Môn Tin học
  { id: 'p5-1', grade: 5, subject: 'Tin học', week: 1, periodIndex: 1, lessonName: 'Bài 1: Máy tính và cộng đồng (Tiết 1)', integrationNote: 'Ứng dụng chuyển đổi số đời sống', notes: 'Chủ đề A' },
  { id: 'p5-2', grade: 5, subject: 'Tin học', week: 1, periodIndex: 2, lessonName: 'Bài 1: Máy tính và cộng đồng (Tiết 2)', integrationNote: 'Văn hóa ứng xử trên môi trường số', notes: 'Chủ đề A' },
  { id: 'p5-3', grade: 5, subject: 'Tin học', week: 2, periodIndex: 3, lessonName: 'Bài 2: Thu thập và lưu trữ thông tin (Tiết 1)', integrationNote: 'Thu thập thông tin bài tập khoa học', notes: 'Chủ đề A' },
  { id: 'p5-4', grade: 5, subject: 'Tin học', week: 2, periodIndex: 4, lessonName: 'Bài 2: Thu thập và lưu trữ thông tin (Tiết 2)', integrationNote: 'Tổ chức lưu trữ trên Google Drive', notes: 'Chủ đề A' },
  { id: 'p5-5', grade: 5, subject: 'Tin học', week: 3, periodIndex: 5, lessonName: 'Bài 3: Làm quen với phần mềm trình chiếu (Tiết 1)', integrationNote: 'Thiết kế trang chiếu giới thiệu bản thân', notes: 'Chủ đề E' },
  { id: 'p5-6', grade: 5, subject: 'Tin học', week: 3, periodIndex: 6, lessonName: 'Bài 3: Làm quen với phần mềm trình chiếu (Tiết 2)', integrationNote: 'Chèn ảnh minh họa sinh động', notes: 'Chủ đề E' }
];

export const defaultTimetable: TimetableSlot[] = [
  // Thứ Hai
  { id: 't-2-m1', dayOfWeek: 2, session: 'morning', period: 1, className: 'Chào cờ', subject: 'Chào cờ', grade: 0 },
  { id: 't-2-m2', dayOfWeek: 2, session: 'morning', period: 2, className: '3A1', subject: 'Tin học', grade: 3 },
  { id: 't-2-m3', dayOfWeek: 2, session: 'morning', period: 3, className: '3A2', subject: 'Tin học', grade: 3 },
  { id: 't-2-m4', dayOfWeek: 2, session: 'morning', period: 4, className: '4A1', subject: 'Tin học', grade: 4 },

  // Thứ Ba
  { id: 't-3-m1', dayOfWeek: 3, session: 'morning', period: 1, className: '5A1', subject: 'Tin học', grade: 5 },
  { id: 't-3-m2', dayOfWeek: 3, session: 'morning', period: 2, className: '5A2', subject: 'Tin học', grade: 5 },
  { id: 't-3-m3', dayOfWeek: 3, session: 'morning', period: 3, className: '4A2', subject: 'Tin học', grade: 4 },
  { id: 't-3-a1', dayOfWeek: 3, session: 'afternoon', period: 1, className: '3A1', subject: 'Tin học', grade: 3 },
  { id: 't-3-a2', dayOfWeek: 3, session: 'afternoon', period: 2, className: '3A2', subject: 'Tin học', grade: 3 },

  // Thứ Tư
  { id: 't-4-m1', dayOfWeek: 4, session: 'morning', period: 1, className: '4A1', subject: 'Tin học', grade: 4 },
  { id: 't-4-m2', dayOfWeek: 4, session: 'morning', period: 2, className: '4A2', subject: 'Tin học', grade: 4 },
  { id: 't-4-m3', dayOfWeek: 4, session: 'morning', period: 3, className: '5A1', subject: 'Tin học', grade: 5 },

  // Thứ Năm
  { id: 't-5-m1', dayOfWeek: 5, session: 'morning', period: 1, className: '5A2', subject: 'Tin học', grade: 5 },
  { id: 't-5-m2', dayOfWeek: 5, session: 'morning', period: 2, className: '3A1', subject: 'Tin học', grade: 3 },
  { id: 't-5-m3', dayOfWeek: 5, session: 'morning', period: 3, className: '4A1', subject: 'Tin học', grade: 4 },

  // Thứ Sáu
  { id: 't-6-m1', dayOfWeek: 6, session: 'morning', period: 1, className: '5A1', subject: 'Tin học', grade: 5 },
  { id: 't-6-m2', dayOfWeek: 6, session: 'morning', period: 2, className: '5A2', subject: 'Tin học', grade: 5 },
  { id: 't-6-m3', dayOfWeek: 6, session: 'morning', period: 3, className: 'Sinh hoạt lớp', subject: 'Sinh hoạt lớp', grade: 0 }
];
