import React, { useState, useEffect } from 'react';
import {
  Github,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Globe,
  FileJson,
  Sparkles,
  ExternalLink,
  FolderPlus,
  BookOpen,
  Award,
  HelpCircle,
  X,
  ChevronRight,
  Layers,
  ArrowRight,
  Upload
} from 'lucide-react';
import { AppState } from '../types';
import {
  fetchGithubData,
  mergeGithubQuestions,
  mergeGithubFullData,
  exportGithubPackage,
  GithubReleasePackage,
  SAMPLE_GITHUB_URLS,
  DEFAULT_GITHUB_URL
} from '../services/githubSyncService';

interface GitHubUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const GitHubUpdateModal: React.FC<GitHubUpdateModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState
}) => {
  const [githubUrl, setGithubUrl] = useState<string>(
    state.settings?.githubRepoUrl || DEFAULT_GITHUB_URL
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [releasePkg, setReleasePkg] = useState<GithubReleasePackage | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'update' | 'export' | 'guide'>('update');

  const isVercelHost = typeof window !== 'undefined' && 
    (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel'));

  // Pre-fill demo release if user clicks sample button or first check
  const handleCheckUpdate = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || githubUrl;
    setLoading(true);
    setError(null);
    setSyncSuccessMsg(null);

    try {
      const pkg = await fetchGithubData(targetUrl);
      setReleasePkg(pkg);

      // Save custom github URL to settings
      onUpdateState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          githubRepoUrl: targetUrl
        }
      }));
    } catch (err: any) {
      console.warn('GitHub sync fetch error:', err);
      // Fallback demo mock package if user tested an unreachable URL or offline link
      if (targetUrl.includes('raw.githubusercontent.com')) {
        const mockPkg: GithubReleasePackage = {
          appVersionName: 'v1.3.5 (Mới)',
          releaseDate: new Date().toISOString().split('T')[0],
          changelog: 'Bổ sung bộ 30 câu hỏi Ôn tập Tuần 3, cập nhật danh mục Môn học mới & Quà đổi thưởng.',
          author: 'Ban Giảng Dạy & CNTT',
          quizQuestions: [
            {
              id: 'q_demo_1',
              question: 'Thành phố Hà Nội nằm bên bờ sông nào?',
              options: ['Sông Hồng', 'Sông Tiền', 'Sông Hương', 'Sông Đồng Nai'],
              correctIndex: 0,
              subject: 'Lịch sử & Địa lý',
              category: 'Tuần 3',
              rewardCoins: 2,
              explanation: 'Hà Nội nổi tiếng với dòng Sông Hồng trù phú.'
            },
            {
              id: 'q_demo_2',
              question: 'Phép tính nào dưới đây có kết quả bằng 100?',
              options: ['25 x 4', '30 x 3', '50 + 40', '120 - 10'],
              correctIndex: 0,
              subject: 'Toán',
              category: 'Tuần 3',
              rewardCoins: 2,
              explanation: '25 nhân 4 bằng 100.'
            },
            {
              id: 'q_demo_3',
              question: 'Từ nào sau đây là từ chỉ hoạt động?',
              options: ['Nhảy múa', 'Học sinh', 'Ngôi nhà', 'Xanh tươi'],
              correctIndex: 0,
              subject: 'Tiếng Việt',
              category: 'Tuần 3',
              rewardCoins: 2,
              explanation: 'Nhảy múa chỉ hành động chuyển động của con người.'
            }
          ],
          quizCategories: ['Tuần 3', 'Ôn tập Bài 2', 'Nề nếp Lớp'],
          subjects: ['Kỹ năng sống', 'STEM & Sáng tạo'],
          rewards: [
            {
              id: 'rew_demo_1',
              name: 'Vé xem phim cuối tuần',
              cost: 15,
              emoji: '🎬',
              stock: 5
            }
          ]
        };
        setReleasePkg(mockPkg);
        setError('Lưu ý: Không thể kết nối tới URL thực tế. Đã tải trước bộ dữ liệu mẫu GitHub sẵn sàng cho Thầy/Cô trải nghiệm thử.');
      } else {
        setError(err.message || 'Lỗi kết nối GitHub.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyQuestionsOnly = () => {
    if (!releasePkg) return;
    onUpdateState((prev) => mergeGithubQuestions(prev, releasePkg));
    setSyncSuccessMsg(`Đã gộp thành công ${releasePkg.quizQuestions?.length || 0} câu hỏi & các thư mục mới (${releasePkg.quizCategories?.join(', ') || 'Tuần mới'}) vào hệ thống!`);
    setTimeout(() => {
      setSyncSuccessMsg(null);
    }, 4000);
  };

  const handleApplyFullData = () => {
    if (!releasePkg) return;
    onUpdateState((prev) => mergeGithubFullData(prev, releasePkg));
    setSyncSuccessMsg('Đã cập nhật gộp toàn bộ ngân hàng câu hỏi, môn học và danh mục từ GitHub thành công!');
    setTimeout(() => {
      setSyncSuccessMsg(null);
    }, 4000);
  };

  const handleExportJson = () => {
    exportGithubPackage(state);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-teal-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 shadow-inner">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-wide text-white">
                  Cập Nhật Dữ Liệu Từ GitHub
                </h3>
                {isVercelHost && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-400" /> Vercel App
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-200/80 mt-0.5">
                Đồng bộ ngân hàng câu hỏi, môn học & dữ liệu lớp học mới nhất từ kho GitHub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Tabs */}
        <div className="flex items-center border-b border-slate-100 bg-slate-50/80 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('update')}
            className={`py-2.5 px-4 rounded-t-2xl flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'update'
                ? 'bg-white text-teal-800 border-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span>Kiểm tra & Cập nhật</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-2.5 px-4 rounded-t-2xl flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'export'
                ? 'bg-white text-teal-800 border-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất dữ liệu cho GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-4 rounded-t-2xl flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'guide'
                ? 'bg-white text-teal-800 border-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Hướng dẫn Vercel / GitHub</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {syncSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-extrabold text-xs sm:text-sm flex items-center gap-3 shadow-sm animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'update' && (
            <div className="space-y-4">
              {/* Environment info card */}
              {isVercelHost && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex items-center justify-between text-xs text-teal-900">
                  <div className="flex items-center gap-2.5 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Ứng dụng đang hoạt động trực tiếp trên trang Vercel (`{window.location.hostname}`)</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-teal-700 bg-white px-2 py-1 rounded-xl border border-teal-200 shadow-2xs">
                    Phiên bản Vercel Live
                  </span>
                </div>
              )}

              {/* GitHub Repo URL Input */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Đường dẫn tệp JSON dữ liệu trên GitHub (Raw URL) *
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://raw.githubusercontent.com/user/repo/main/data.json"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-mono font-medium"
                    />
                  </div>

                  <button
                    onClick={() => handleCheckUpdate()}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Đang tải...' : 'Kiểm tra ngay'}</span>
                  </button>
                </div>

                {/* Quick samples selection */}
                <div className="pt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Mẫu đường dẫn GitHub:</span>
                  {SAMPLE_GITHUB_URLS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setGithubUrl(sample.url);
                        handleCheckUpdate(sample.url);
                      }}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Release Package Preview Card */}
              {releasePkg && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white shadow-xl space-y-4 animate-in fade-in duration-300 border-2 border-teal-500/40">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-teal-500/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-emerald-950 font-black text-xs uppercase tracking-wider">
                          {releasePkg.appVersionName}
                        </span>
                        <span className="text-xs text-teal-300/80 font-bold">
                          Phát hành: {releasePkg.releaseDate}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white mt-1">
                        Thông tin cập nhật từ GitHub ({releasePkg.author || 'GitHub'})
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-teal-300 font-bold block">Phiên bản hiện tại máy:</span>
                      <span className="text-xs font-mono font-black text-amber-300">
                        {state.lastGithubUpdateVersion || 'v1.0.0 (Gốc)'}
                      </span>
                    </div>
                  </div>

                  {/* Changelog text */}
                  {releasePkg.changelog && (
                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-teal-100/90 leading-relaxed">
                      <span className="font-extrabold text-teal-200 block mb-0.5">📝 Ghi chú phát hành:</span>
                      {releasePkg.changelog}
                    </div>
                  )}

                  {/* Package breakdown grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-teal-800/50 border border-teal-500/30 text-center">
                      <FolderPlus className="w-4 h-4 text-teal-300 mx-auto mb-1" />
                      <span className="block text-lg font-black text-white">
                        {releasePkg.quizQuestions?.length || 0}
                      </span>
                      <span className="text-[11px] font-bold text-teal-200">Câu hỏi mới</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-800/50 border border-emerald-500/30 text-center">
                      <Layers className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
                      <span className="block text-lg font-black text-white">
                        {releasePkg.quizCategories?.length || 0}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-200">Thư mục bài học</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-800/50 border border-amber-500/30 text-center">
                      <BookOpen className="w-4 h-4 text-amber-300 mx-auto mb-1" />
                      <span className="block text-lg font-black text-white">
                        {releasePkg.subjects?.length || 0}
                      </span>
                      <span className="text-[11px] font-bold text-amber-200">Môn học bổ sung</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-800/50 border border-purple-500/30 text-center">
                      <Award className="w-4 h-4 text-purple-300 mx-auto mb-1" />
                      <span className="block text-lg font-black text-white">
                        {releasePkg.rewards?.length || 0}
                      </span>
                      <span className="text-[11px] font-bold text-purple-200">Quà đổi thưởng</span>
                    </div>
                  </div>

                  {/* Incoming questions preview */}
                  {releasePkg.quizQuestions && releasePkg.quizQuestions.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-black text-teal-200 uppercase tracking-wider block">
                        Xem trước một số câu hỏi mẫu từ GitHub:
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {releasePkg.quizQuestions.slice(0, 3).map((q, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-black/30 border border-teal-500/20 text-xs flex items-center justify-between gap-2"
                          >
                            <span className="font-semibold text-teal-100 truncate">
                              {i + 1}. {q.question}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-teal-500/30 text-teal-300 text-[10px] font-bold flex-shrink-0">
                              📂 {q.category || 'Tuần mới'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons for syncing */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={handleApplyQuestionsOnly}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-slate-900" />
                      <span>Gộp Câu Hỏi & Thư Mục Mới</span>
                    </button>

                    <button
                      onClick={handleApplyFullData}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs border border-teal-400/40 shadow-lg transition-all cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-teal-200" />
                      <span>Gộp Toàn Bộ Dữ Liệu System</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-950 font-black text-base">
                  <FileJson className="w-5 h-5 text-emerald-700" />
                  <span>Xuất Gói Dữ Liệu Chuẩn GitHub JSON</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tạo file định dạng JSON chứa toàn bộ <strong>Ngân hàng câu hỏi ({state.quizQuestions?.length || 0} câu)</strong>, 
                  <strong>Danh mục thư mục ({state.quizCategories?.length || 0})</strong>, 
                  <strong>Môn học</strong> và <strong>Quà tặng</strong> hiện tại để tải lên GitHub Repository của Thầy/Cô.
                </p>

                <div className="p-3 rounded-2xl bg-white border border-emerald-200 text-xs font-mono space-y-1">
                  <div className="text-slate-500 font-sans font-bold">📄 Tên file xuất tự động:</div>
                  <div className="font-bold text-emerald-800">lophoc-github-release-v1.x.json</div>
                </div>

                <button
                  onClick={handleExportJson}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải File JSON Dữ Liệu Đưa Lên GitHub</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 font-bold text-teal-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-700 flex-shrink-0" />
                <span>Cách thức hoạt động trên trang Vercel (`vercel.app`):</span>
              </div>

              <ol className="list-decimal list-inside space-y-2.5 font-medium pl-1">
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 font-bold">Bước 1 (Xuất tệp):</strong> Sử dụng tab <em>"Xuất dữ liệu cho GitHub"</em> ở trên để tải file dữ liệu câu hỏi dạng JSON về máy tính.
                </li>
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 font-bold">Bước 2 (Tải lên GitHub):</strong> Đưa tệp `.json` lên repository của bạn trên <code className="bg-slate-200 px-1 rounded font-mono">github.com</code> (hoặc tạo GitHub Gist công khai).
                </li>
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 font-bold">Bước 3 (Lấy Raw URL):</strong> Bấm nút <em>"Raw"</em> trên GitHub để copy đường dẫn dạng <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-teal-800">https://raw.githubusercontent.com/...</code>
                </li>
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 font-bold">Bước 4 (Cập nhật 1-Click):</strong> Dán link Raw đó vào ô ở tab <em>"Kiểm tra & Cập nhật"</em> và bấm <strong>Cập nhật ngay</strong>. Mọi người dùng truy cập trang Vercel sẽ tự động tải được bộ câu hỏi & bài học mới nhất!
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Đồng bộ thông minh không làm mất dữ liệu học sinh hiện tại.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
