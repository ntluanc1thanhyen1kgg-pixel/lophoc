import { AppState, QuizQuestion, Reward, LinkItem } from '../types';

export interface GithubReleasePackage {
  appVersionName: string;
  releaseDate: string;
  changelog: string;
  author?: string;
  quizQuestions?: QuizQuestion[];
  quizCategories?: string[];
  subjects?: string[];
  rewards?: Reward[];
  links?: LinkItem[];
  classesSample?: any[];
  notes?: string;
}

export const SAMPLE_GITHUB_URLS = [
  {
    name: 'Kho dữ liệu mẫu chính thức (GitHub Raw)',
    url: 'https://raw.githubusercontent.com/ntluan-c1thanhyen1/lophoc-smart-data/main/data.json'
  },
  {
    name: 'Thư viện câu hỏi & Thư mục bài học mới',
    url: 'https://raw.githubusercontent.com/ntluan-c1thanhyen1/lophoc-smart-data/main/quiz_bank.json'
  }
];

export const DEFAULT_GITHUB_URL = SAMPLE_GITHUB_URLS[0].url;

/**
 * Fetch and validate remote release package from GitHub
 */
export async function fetchGithubData(url: string): Promise<GithubReleasePackage> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    throw new Error('Vui lòng nhập đường dẫn GitHub URL hợp lệ.');
  }

  // Add timestamp query parameter to bypass browser/CDN aggressive caching
  const fetchUrl = cleanUrl.includes('?') 
    ? `${cleanUrl}&_t=${Date.now()}` 
    : `${cleanUrl}?_t=${Date.now()}`;

  const res = await fetch(fetchUrl, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Không thể kết nối đến GitHub (${res.status} ${res.statusText}). Vui lòng kiểm tra lại đường dẫn URL.`);
  }

  const data = await res.json();

  if (!data || typeof data !== 'object') {
    throw new Error('Dữ liệu từ GitHub không đúng định dạng JSON hợp lệ.');
  }

  return {
    appVersionName: data.appVersionName || data.versionName || data.version || 'v1.1.0',
    releaseDate: data.releaseDate || data.updatedAt || new Date().toISOString().split('T')[0],
    changelog: data.changelog || data.description || 'Cập nhật bổ sung nội dung bài học và ngân hàng câu hỏi mới.',
    author: data.author || data.publisher || 'Ban Quản trị Giáo dục',
    quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : (Array.isArray(data.questions) ? data.questions : []),
    quizCategories: Array.isArray(data.quizCategories) ? data.quizCategories : (Array.isArray(data.categories) ? data.categories : []),
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    rewards: Array.isArray(data.rewards) ? data.rewards : [],
    links: Array.isArray(data.links) ? data.links : [],
    notes: data.notes || ''
  };
}

/**
 * Merge Quiz Questions & Categories into current AppState
 */
export function mergeGithubQuestions(currentState: AppState, pkg: GithubReleasePackage): AppState {
  const existingQuestions = currentState.quizQuestions || [];
  const existingCategories = currentState.quizCategories || ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Hôm nay'];

  const newQuestions = pkg.quizQuestions || [];
  const newCategories = pkg.quizCategories || [];

  // Deduplicate questions by question text or ID
  const existingTexts = new Set(existingQuestions.map(q => q.question.trim().toLowerCase()));
  const addedQuestions: QuizQuestion[] = [];

  for (const q of newQuestions) {
    if (q.question && !existingTexts.has(q.question.trim().toLowerCase())) {
      addedQuestions.push({
        ...q,
        id: q.id || `q_gh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      });
      existingTexts.add(q.question.trim().toLowerCase());
    }
  }

  // Deduplicate categories
  const categorySet = new Set([...existingCategories, ...newCategories]);
  // Also collect categories from incoming questions
  for (const q of addedQuestions) {
    if (q.category) {
      categorySet.add(q.category);
    }
  }

  return {
    ...currentState,
    quizQuestions: [...existingQuestions, ...addedQuestions],
    quizCategories: Array.from(categorySet),
    lastGithubUpdateVersion: pkg.appVersionName
  };
}

/**
 * Merge Full System Content (Questions, Subjects, Rewards, Links)
 */
export function mergeGithubFullData(currentState: AppState, pkg: GithubReleasePackage): AppState {
  // First merge questions
  let stateAfterQuestions = mergeGithubQuestions(currentState, pkg);

  // Merge subjects
  const currentSubjects = stateAfterQuestions.subjects || [];
  const subjectSet = new Set([...currentSubjects, ...(pkg.subjects || [])]);

  // Merge rewards by ID or Name
  const currentRewards = stateAfterQuestions.rewards || [];
  const existingRewardNames = new Set(currentRewards.map(r => r.name.trim().toLowerCase()));
  const addedRewards: Reward[] = [];

  for (const r of (pkg.rewards || [])) {
    if (r.name && !existingRewardNames.has(r.name.trim().toLowerCase())) {
      addedRewards.push({
        ...r,
        id: r.id || `rew_gh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      });
    }
  }

  // Merge links by URL
  const currentLinks = stateAfterQuestions.links || [];
  const existingUrls = new Set(currentLinks.map(l => l.url.trim().toLowerCase()));
  const addedLinks: LinkItem[] = [];

  for (const l of (pkg.links || [])) {
    if (l.url && !existingUrls.has(l.url.trim().toLowerCase())) {
      addedLinks.push({
        ...l,
        id: l.id || `lnk_gh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      });
    }
  }

  return {
    ...stateAfterQuestions,
    subjects: Array.from(subjectSet),
    rewards: [...currentRewards, ...addedRewards],
    links: [...currentLinks, ...addedLinks],
    lastGithubUpdateVersion: pkg.appVersionName
  };
}

/**
 * Download a standard JSON release package for GitHub commitment
 */
export function exportGithubPackage(state: AppState) {
  const pkg: GithubReleasePackage = {
    appVersionName: `v1.${Date.now().toString().slice(-4)}`,
    releaseDate: new Date().toISOString().split('T')[0],
    changelog: `Cập nhật dữ liệu ngày ${new Date().toLocaleDateString('vi-VN')} với ${state.quizQuestions?.length || 0} câu hỏi và ${state.subjects.length} môn học.`,
    author: state.teacher?.name || 'Giáo viên',
    quizQuestions: state.quizQuestions || [],
    quizCategories: state.quizCategories || [],
    subjects: state.subjects || [],
    rewards: state.rewards || [],
    links: state.links || [],
    notes: 'File JSON dữ liệu được tạo từ Lớp Học Thông Minh để đưa lên GitHub repository.'
  };

  const jsonStr = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lophoc-github-release-${pkg.appVersionName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
