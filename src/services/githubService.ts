import { AppState, QuizQuestion, Student, ClassInfo } from '../types';

export interface GitHubFetchResult {
  success: boolean;
  message: string;
  dataType?: 'full_state' | 'quiz_questions' | 'students' | 'custom_json';
  data?: any;
  meta?: {
    fetchedAt: string;
    sourceUrl: string;
    itemCount?: number;
    rawSize?: number;
  };
}

/**
 * Normalizes any GitHub URL (web page link, raw link, or repo path) into a fetchable raw URL or API URL.
 */
export function normalizeGitHubUrl(inputUrl: string): string {
  let url = inputUrl.trim();

  // If user enters shortcut like "user/repo/data.json"
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://raw.githubusercontent.com/${url}`;
  }

  // Convert standard github.com blob URL to raw.githubusercontent.com
  // Example: https://github.com/user/repo/blob/main/data.json -> https://raw.githubusercontent.com/user/repo/main/data.json
  if (url.includes('github.com/') && url.includes('/blob/')) {
    url = url
      .replace('github.com/', 'raw.githubusercontent.com/')
      .replace('/blob/', '/');
  }

  return url;
}

/**
 * Default sample GitHub URL for application update/data sync
 */
export const DEFAULT_GITHUB_DATA_URL =
  'https://raw.githubusercontent.com/ntluan-c1thanhyen/lop-hoc-vui-ve-data/main/update-data.json';

/**
 * Fetches JSON data from GitHub URL
 */
export async function fetchGitHubData(githubUrl: string): Promise<GitHubFetchResult> {
  const normalizedUrl = normalizeGitHubUrl(githubUrl);
  
  try {
    const response = await fetch(normalizedUrl, {
      headers: {
        Accept: 'application/json, text/plain, */*'
      },
      cache: 'no-cache'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message:
            'Không tìm thấy file trên GitHub (Mã lỗi HTTP: 404). File "update-data.json" chưa được tạo trên GitHub cá nhân của bạn hoặc tên repository/đường dẫn bị sai.'
        };
      }
      return {
        success: false,
        message: `Không thể tải dữ liệu từ GitHub (Mã lỗi HTTP: ${response.status} ${response.statusText}). Vui lòng kiểm tra lại đường dẫn.`
      };
    }

    const textData = await response.text();
    let json: any;
    try {
      json = JSON.parse(textData);
    } catch (parseError) {
      return {
        success: false,
        message: 'Đường dẫn GitHub không phản hồi đúng định dạng JSON hợp lệ.'
      };
    }

    // Determine payload type
    if (json && typeof json === 'object') {
      const nowStr = new Date().toLocaleString('vi-VN');

      // 1. Full AppState or contains app keys
      if (
        Array.isArray(json.classes) ||
        Array.isArray(json.students) ||
        Array.isArray(json.quizQuestions) ||
        json.version !== undefined
      ) {
        let itemCount = 0;
        if (Array.isArray(json.quizQuestions)) itemCount += json.quizQuestions.length;
        if (Array.isArray(json.students)) itemCount += json.students.length;
        if (Array.isArray(json.classes)) itemCount += json.classes.length;

        return {
          success: true,
          message: 'Tải dữ liệu từ GitHub thành công! Tìm thấy gói dữ liệu ứng dụng.',
          dataType: 'full_state',
          data: json,
          meta: {
            fetchedAt: nowStr,
            sourceUrl: normalizedUrl,
            itemCount,
            rawSize: textData.length
          }
        };
      }

      // 2. Pure array of QuizQuestions
      if (Array.isArray(json) && json.length > 0 && json[0].question && json[0].options) {
        return {
          success: true,
          message: `Tải thành công ${json.length} câu hỏi trắc nghiệm từ GitHub!`,
          dataType: 'quiz_questions',
          data: json,
          meta: {
            fetchedAt: nowStr,
            sourceUrl: normalizedUrl,
            itemCount: json.length,
            rawSize: textData.length
          }
        };
      }

      // 3. Pure array of Students
      if (Array.isArray(json) && json.length > 0 && json[0].name) {
        return {
          success: true,
          message: `Tải thành công danh sách ${json.length} học sinh từ GitHub!`,
          dataType: 'students',
          data: json,
          meta: {
            fetchedAt: nowStr,
            sourceUrl: normalizedUrl,
            itemCount: json.length,
            rawSize: textData.length
          }
        };
      }

      // 4. Custom JSON object with nested quizQuestions or data
      if (Array.isArray(json.questions) || Array.isArray(json.data)) {
        const questionsList = json.questions || json.data;
        return {
          success: true,
          message: 'Tải dữ liệu từ GitHub thành công!',
          dataType: Array.isArray(questionsList) ? 'quiz_questions' : 'custom_json',
          data: questionsList,
          meta: {
            fetchedAt: nowStr,
            sourceUrl: normalizedUrl,
            itemCount: Array.isArray(questionsList) ? questionsList.length : 1,
            rawSize: textData.length
          }
        };
      }

      return {
        success: true,
        message: 'Tải dữ liệu từ GitHub thành công!',
        dataType: 'custom_json',
        data: json,
        meta: {
          fetchedAt: nowStr,
          sourceUrl: normalizedUrl,
          rawSize: textData.length
        }
      };
    }

    return {
      success: false,
      message: 'Dữ liệu nhận được từ GitHub không khớp cấu trúc dữ liệu ứng dụng.'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Lỗi kết nối GitHub: ${error?.message || 'Không thể truy cập mạng'}`
    };
  }
}

/**
 * Smart merge fetched GitHub data into current AppState
 */
export function mergeGitHubDataToState(
  currentState: AppState,
  githubPayload: GitHubFetchResult,
  mode: 'smart' | 'overwrite' = 'smart'
): AppState {
  if (!githubPayload.data) return currentState;

  const { dataType, data } = githubPayload;

  if (mode === 'overwrite' && dataType === 'full_state') {
    return {
      ...currentState,
      ...data,
      activeClassId: data.activeClassId || currentState.activeClassId
    };
  }

  // Smart Merge
  let updatedState: AppState = { ...currentState };

  if (dataType === 'full_state' || dataType === 'custom_json') {
    const full = data as Partial<AppState>;

    // 1. Merge Quiz Questions
    if (Array.isArray(full.quizQuestions) && full.quizQuestions.length > 0) {
      const existingIds = new Set((currentState.quizQuestions || []).map((q) => q.id));
      const existingText = new Set((currentState.quizQuestions || []).map((q) => q.question.trim().toLowerCase()));

      const newQuestions: QuizQuestion[] = [];
      for (const q of full.quizQuestions) {
        if (!existingIds.has(q.id) && !existingText.has(q.question.trim().toLowerCase())) {
          newQuestions.push(q);
        }
      }

      updatedState.quizQuestions = [...(currentState.quizQuestions || []), ...newQuestions];
    }

    // 2. Merge Quiz Categories
    if (Array.isArray(full.quizCategories) && full.quizCategories.length > 0) {
      const existingCats = new Set(currentState.quizCategories || []);
      full.quizCategories.forEach((c) => existingCats.add(c));
      updatedState.quizCategories = Array.from(existingCats);
    }

    // 3. Merge Subjects
    if (Array.isArray(full.subjects) && full.subjects.length > 0) {
      const existingSubs = new Set(currentState.subjects || []);
      full.subjects.forEach((s) => existingSubs.add(s));
      updatedState.subjects = Array.from(existingSubs);
    }

    // 4. Merge Classes & Students
    if (Array.isArray(full.classes) && full.classes.length > 0) {
      const existingClassIds = new Set(currentState.classes.map((c) => c.id));
      const newClasses = full.classes.filter((c) => !existingClassIds.has(c.id));
      updatedState.classes = [...currentState.classes, ...newClasses];
    }

    if (Array.isArray(full.students) && full.students.length > 0) {
      const existingStudentIds = new Set(currentState.students.map((s) => s.id));
      const newStudents = full.students.filter((s) => !existingStudentIds.has(s.id));
      updatedState.students = [...currentState.students, ...newStudents];
    }

    // 5. Merge Links
    if (Array.isArray(full.links) && full.links.length > 0) {
      const existingLinkIds = new Set(currentState.links.map((l) => l.id));
      const newLinks = full.links.filter((l) => !existingLinkIds.has(l.id));
      updatedState.links = [...currentState.links, ...newLinks];
    }
  } else if (dataType === 'quiz_questions' && Array.isArray(data)) {
    const existingQuestions = currentState.quizQuestions || [];
    const existingIds = new Set(existingQuestions.map((q) => q.id));
    const existingTexts = new Set(existingQuestions.map((q) => q.question.trim().toLowerCase()));

    const newQuestionsToAdd: QuizQuestion[] = [];
    data.forEach((q: any, idx: number) => {
      const qText = (q.question || '').trim();
      if (qText && !existingTexts.has(qText.toLowerCase())) {
        newQuestionsToAdd.push({
          id: q.id || `gh_q_${Date.now()}_${idx}`,
          subject: q.subject || 'Tin học và Công nghệ',
          category: q.category || 'Cập nhật từ GitHub',
          question: qText,
          options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['Đúng', 'Sai', 'Bỏ qua', 'Khác'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          rewardCoins: q.rewardCoins || 2,
          explanation: q.explanation || ''
        });
      }
    });

    updatedState.quizQuestions = [...existingQuestions, ...newQuestionsToAdd];

    // Auto-add new category
    const catList = updatedState.quizCategories || [];
    if (!catList.includes('Cập nhật từ GitHub')) {
      updatedState.quizCategories = [...catList, 'Cập nhật từ GitHub'];
    }
  }

  return updatedState;
}

/**
 * Downloads a sample update-data.json file to the user's computer
 */
export function downloadSampleJsonFile(state: AppState): void {
  const sampleData = {
    appName: 'Lớp Học Thông Minh - Cập Nhật Dữ Liệu',
    version: 1,
    updatedAt: new Date().toISOString(),
    quizCategories: state.quizCategories || ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Ôn tập Tổng hợp'],
    quizQuestions: state.quizQuestions || [],
    subjects: state.subjects || [],
    classes: state.classes || [],
    students: state.students || []
  };

  const jsonStr = JSON.stringify(sampleData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'update-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses a local JSON file uploaded from user's device
 */
export function parseLocalJsonFile(file: File): Promise<GitHubFetchResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        const nowStr = new Date().toLocaleString('vi-VN');

        if (
          Array.isArray(json.classes) ||
          Array.isArray(json.students) ||
          Array.isArray(json.quizQuestions) ||
          json.version !== undefined
        ) {
          let itemCount = 0;
          if (Array.isArray(json.quizQuestions)) itemCount += json.quizQuestions.length;
          if (Array.isArray(json.students)) itemCount += json.students.length;

          resolve({
            success: true,
            message: `Đã đọc thành công file JSON "${file.name}"!`,
            dataType: 'full_state',
            data: json,
            meta: {
              fetchedAt: nowStr,
              sourceUrl: file.name,
              itemCount,
              rawSize: text.length
            }
          });
          return;
        }

        if (Array.isArray(json)) {
          resolve({
            success: true,
            message: `Đã đọc thành công ${json.length} danh mục từ file "${file.name}"!`,
            dataType: 'quiz_questions',
            data: json,
            meta: {
              fetchedAt: nowStr,
              sourceUrl: file.name,
              itemCount: json.length,
              rawSize: text.length
            }
          });
          return;
        }

        resolve({
          success: true,
          message: `Đã đọc file JSON "${file.name}" thành công!`,
          dataType: 'custom_json',
          data: json,
          meta: {
            fetchedAt: nowStr,
            sourceUrl: file.name,
            rawSize: text.length
          }
        });
      } catch (err) {
        resolve({
          success: false,
          message: 'File đã chọn không đúng định dạng JSON hợp lệ.'
        });
      }
    };
    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Không thể đọc nội dung file từ thiết bị.'
      });
    };
    reader.readAsText(file);
  });
}

/**
 * Gets built-in fallback dataset when GitHub URL returns 404
 */
export function getBuiltInUpdateData(state: AppState): GitHubFetchResult {
  const nowStr = new Date().toLocaleString('vi-VN');

  return {
    success: true,
    message: 'Tải bộ dữ liệu cập nhật tiêu chuẩn từ hệ thống thành công!',
    dataType: 'full_state',
    data: {
      quizQuestions: state.quizQuestions || [],
      quizCategories: state.quizCategories || ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Ngày 18/09/2026', 'Ôn tập Tổng hợp'],
      subjects: state.subjects || [],
      classes: state.classes || [],
      students: state.students || []
    },
    meta: {
      fetchedAt: nowStr,
      sourceUrl: 'Bản dựng Hệ thống Tiêu chuẩn',
      itemCount: (state.quizQuestions || []).length + (state.students || []).length
    }
  };
}

