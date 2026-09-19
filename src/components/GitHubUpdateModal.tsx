import React, { useState } from 'react';
import {
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Database,
  HelpCircle,
  Folder,
  Users,
  Sparkles,
  ExternalLink,
  Code
} from 'lucide-react';
import { AppState } from '../types';
import {
  fetchGitHubData,
  mergeGitHubDataToState,
  DEFAULT_GITHUB_DATA_URL,
  GitHubFetchResult
} from '../services/githubService';

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
  const [githubUrl, setGithubUrl] = useState(DEFAULT_GITHUB_DATA_URL);
  const [loading, setLoading] = useState(false);
  const [fetchResult, setFetchResult] = useState<GitHubFetchResult | null>(null);
  const [mergeMode, setMergeMode] = useState<'smart' | 'overwrite'>('smart');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubUrl.trim()) return;

    setLoading(true);
    setFetchResult(null);
    setSuccessMessage(null);

    const res = await fetchGitHubData(githubUrl);
    setFetchResult(res);
    setLoading(false);
  };

  const handleApplyUpdate = () => {
    if (!fetchResult || !fetchResult.success) return;

    onUpdateState((prev) => mergeGitHubDataToState(prev, fetchResult, mergeMode));

    setSuccessMessage(
      mergeMode === 'overwrite'
        ? 'Đã cập nhật và ghi đè toàn bộ dữ liệu ứng dụng từ GitHub thành công!'
        : 'Đã hợp nhất thêm dữ liệu mới từ GitHub vào hệ thống thành công!'
    );

    setTimeout(() => {
      onClose();
      setSuccessMessage(null);
      setFetchResult(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-2 border-teal-200 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <span>Cập nhật dữ liệu từ GitHub.com</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black uppercase">
                  Tự động
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tải gói câu hỏi, môn học, lớp học và cấu hình trực tiếp từ kho lưu trữ GitHub.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-3 shadow-md animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* GitHub Link Form */}
          <form onSubmit={handleFetch} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Đường dẫn dữ liệu JSON trên GitHub:</span>
                <span className="text-[10px] text-teal-700 font-bold lowercase">
                  (Ví dụ: https://raw.githubusercontent.com/.../data.json)
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="Dán đường dẫn GitHub (raw or github.com)..."
                  className="flex-1 px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-xs font-mono text-slate-800 focus:border-teal-500 focus:outline-none shadow-xs"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Đang tải...' : 'Bấm để Cập nhật'}</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Mẫu sẵn có:</span>
              <button
                type="button"
                onClick={() => {
                  setGithubUrl(DEFAULT_GITHUB_DATA_URL);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
              >
                📦 Kho dữ liệu mặc định
              </button>
            </div>
          </form>

          {/* Error Message */}
          {fetchResult && !fetchResult.success && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm mb-1">Không thể lấy dữ liệu!</p>
                <p>{fetchResult.message}</p>
              </div>
            </div>
          )}

          {/* Successful Fetch Preview */}
          {fetchResult && fetchResult.success && (
            <div className="p-4 rounded-3xl bg-teal-50/80 border-2 border-teal-200 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-teal-200/80">
                <div className="flex items-center gap-2 text-teal-950 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <span>Đã kiểm tra dữ liệu trên GitHub thành công!</span>
                </div>
                <span className="text-[10px] font-mono text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                  {fetchResult.meta?.fetchedAt}
                </span>
              </div>

              {/* Payload Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {fetchResult.dataType === 'quiz_questions' || fetchResult.data?.quizQuestions ? (
                  <div className="p-3 bg-white rounded-2xl border border-teal-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500">Câu hỏi trắc nghiệm</span>
                      <span className="text-sm font-black text-slate-800">
                        {fetchResult.data?.quizQuestions?.length || fetchResult.data?.length || 0} câu
                      </span>
                    </div>
                  </div>
                ) : null}

                {fetchResult.data?.students ? (
                  <div className="p-3 bg-white rounded-2xl border border-teal-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500">Danh sách Học sinh</span>
                      <span className="text-sm font-black text-slate-800">
                        {fetchResult.data.students.length} em
                      </span>
                    </div>
                  </div>
                ) : null}

                {fetchResult.data?.classes ? (
                  <div className="p-3 bg-white rounded-2xl border border-teal-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500">Danh sách Lớp học</span>
                      <span className="text-sm font-black text-slate-800">
                        {fetchResult.data.classes.length} lớp
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Mode Selector */}
              <div className="p-3 bg-white rounded-2xl border border-teal-200 space-y-2">
                <span className="block text-xs font-extrabold text-slate-800">
                  Phương thức cập nhật vào máy:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    onClick={() => setMergeMode('smart')}
                    className={`p-2.5 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                      mergeMode === 'smart'
                        ? 'bg-teal-50 border-teal-600 text-teal-950 font-extrabold'
                        : 'bg-white border-slate-200 text-slate-600 font-bold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mergeMode"
                      checked={mergeMode === 'smart'}
                      onChange={() => setMergeMode('smart')}
                      className="accent-teal-600"
                    />
                    <div>
                      <span className="text-xs block">1. Hợp nhất thông minh</span>
                      <span className="text-[10px] text-slate-500 font-normal block">
                        Thêm dữ liệu mới mà không làm mất thông tin hiện tại
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setMergeMode('overwrite')}
                    className={`p-2.5 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                      mergeMode === 'overwrite'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 font-extrabold'
                        : 'bg-white border-slate-200 text-slate-600 font-bold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mergeMode"
                      checked={mergeMode === 'overwrite'}
                      onChange={() => setMergeMode('overwrite')}
                      className="accent-amber-600"
                    />
                    <div>
                      <span className="text-xs block">2. Ghi đè toàn bộ</span>
                      <span className="text-[10px] text-slate-500 font-normal block">
                        Thay thế toàn bộ dữ liệu máy bằng dữ liệu GitHub
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Confirm Apply Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyUpdate}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Áp Dụng Cập Nhật Ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* Guide section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1.5">
            <h5 className="font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Hướng dẫn sử dụng GitHub làm kho dữ liệu:</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Bạn có thể tải file cấu hình JSON lên một repository cá nhân trên GitHub.com.</li>
              <li>Nhấn nút <b>Raw</b> trên GitHub và copy liên kết đó dán vào khung trên.</li>
              <li>Hệ thống tự động xử lý và chuyển đổi link GitHub thành dữ liệu cập nhật theo thời gian thực.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
