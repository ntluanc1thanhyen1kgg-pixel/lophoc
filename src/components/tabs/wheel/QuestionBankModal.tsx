import React, { useState } from 'react';
import { Plus, Trash2, Edit3, RotateCcw, Check, X, Search, HelpCircle, BookOpen, Sparkles, Shuffle, FolderPlus, Folder, Calendar } from 'lucide-react';
import { QuizQuestion, DEFAULT_SUBJECTS } from '../../../types';
import { DEFAULT_QUIZ_QUESTIONS } from '../../../data/defaultQuestions';
import { uid } from '../../../utils/helpers';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  categories: string[];
  onSaveQuestions: (questions: QuizQuestion[]) => void;
  onSaveCategories: (categories: string[]) => void;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  questions,
  categories,
  onSaveQuestions,
  onSaveCategories,
  activeCategory = 'all',
  onSelectCategory
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(activeCategory || 'all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // New question form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formSubject, setFormSubject] = useState<string>('Tin học và Công nghệ');
  const [formCategory, setFormCategory] = useState<string>('Tuần 1');
  const [formRewardCoins, setFormRewardCoins] = useState<number>(2);
  const [formExplanation, setFormExplanation] = useState<string>('');

  // Quick category creation input state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!isOpen) return null;

  // Compile full category list
  const allCategories = Array.from(
    new Set([
      'Tuần 1',
      'Tuần 2',
      'Tuần 3',
      'Tuần 4',
      'Ngày 18/09/2026',
      'Ôn tập Tổng hợp',
      ...(categories || []),
      ...questions.map((q) => q.category).filter((c): c is string => Boolean(c))
    ])
  );

  const handleCreateCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!allCategories.includes(trimmed)) {
      const updated = [...allCategories, trimmed];
      onSaveCategories(updated);
    }
    setFormCategory(trimmed);
    setSelectedCategory(trimmed);
    if (onSelectCategory) onSelectCategory(trimmed);
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  const handleAddWeekCategory = () => {
    const weekNumber = allCategories.filter((c) => c.startsWith('Tuần ')).length + 1;
    handleCreateCategory(`Tuần ${weekNumber}`);
  };

  const handleAddTodayCategory = () => {
    const today = new Date();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const yearStr = today.getFullYear();
    const todayCategoryName = `Ngày ${dayStr}/${monthStr}/${yearStr}`;
    handleCreateCategory(todayCategoryName);
  };

  const subjectsList = Array.from(
    new Set([
      'all',
      'Tin học và Công nghệ',
      'Tin học',
      'Công nghệ',
      'Toán',
      'Tiếng Việt',
      'Khoa học',
      'Tự nhiên & Xã hội',
      'Lịch sử & Địa lý',
      'Tiếng Anh',
      'Đạo đức',
      'Đố vui',
      ...DEFAULT_SUBJECTS.filter(
        (s) => !['Ghi chung / Nề nếp', 'Sinh hoạt lớp', 'Chào cờ'].includes(s)
      ),
      ...questions.map((q) => q.subject || '').filter(Boolean)
    ])
  );

  const filteredQuestions = questions.filter((q) => {
    let matchSubject = selectedSubject === 'all';
    if (!matchSubject) {
      if (selectedSubject === 'Tin học và Công nghệ') {
        matchSubject =
          q.subject === 'Tin học và Công nghệ' ||
          q.subject === 'Tin học' ||
          q.subject === 'Công nghệ';
      } else {
        matchSubject = q.subject === selectedSubject;
      }
    }

    let matchCategory = selectedCategory === 'all';
    if (!matchCategory) {
      matchCategory = q.category === selectedCategory || (!q.category && selectedCategory === 'Tuần 1');
    }

    const matchSearch =
      search.trim() === '' ||
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.options.some((opt) => opt.toLowerCase().includes(search.toLowerCase())) ||
      (q.category && q.category.toLowerCase().includes(search.toLowerCase()));

    return matchSubject && matchCategory && matchSearch;
  });

  const resetForm = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormSubject('Tin học và Công nghệ');
    setFormCategory(selectedCategory !== 'all' ? selectedCategory : 'Tuần 1');
    setFormRewardCoins(2);
    setFormExplanation('');
  };

  const handleStartEdit = (q: QuizQuestion) => {
    setEditingId(q.id);
    setIsAddingNew(true);
    setFormQuestion(q.question);
    setFormOptions([...q.options]);
    setFormCorrectIndex(q.correctIndex);
    setFormSubject(q.subject || 'Tin học và Công nghệ');
    setFormCategory(q.category || 'Tuần 1');
    setFormRewardCoins(q.rewardCoins || 2);
    setFormExplanation(q.explanation || '');
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    if (formOptions.some((opt) => !opt.trim())) {
      alert('Vui lòng nhập đủ 4 phương án A, B, C, D!');
      return;
    }

    const categoryToSave = formCategory.trim() || 'Tuần 1';
    if (!allCategories.includes(categoryToSave)) {
      onSaveCategories([...allCategories, categoryToSave]);
    }

    if (editingId) {
      // Edit existing
      const updated = questions.map((q) =>
        q.id === editingId
          ? {
              ...q,
              question: formQuestion.trim(),
              options: formOptions.map((o) => o.trim()),
              correctIndex: formCorrectIndex,
              subject: formSubject,
              category: categoryToSave,
              rewardCoins: formRewardCoins,
              explanation: formExplanation.trim()
            }
          : q
      );
      onSaveQuestions(updated);
    } else {
      // Add new
      const newQ: QuizQuestion = {
        id: uid('quiz'),
        question: formQuestion.trim(),
        options: formOptions.map((o) => o.trim()),
        correctIndex: formCorrectIndex,
        subject: formSubject,
        category: categoryToSave,
        rewardCoins: formRewardCoins,
        explanation: formExplanation.trim()
      };
      onSaveQuestions([newQ, ...questions]);
    }

    resetForm();
  };

  const handleQuickChangeQuestionCategory = (qId: string, newCat: string) => {
    const updated = questions.map((q) => (q.id === qId ? { ...q, category: newCat } : q));
    onSaveQuestions(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này khỏi ngân hàng?')) {
      onSaveQuestions(questions.filter((q) => q.id !== id));
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        'Bạn có chắc muốn khôi phục bộ câu hỏi mẫu chuẩn (gồm Tin học & Công nghệ, Toán, Tiếng Việt...)? Các câu hỏi hiện tại sẽ được cập nhật.'
      )
    ) {
      onSaveQuestions([...DEFAULT_QUIZ_QUESTIONS]);
      resetForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border-2 border-teal-200 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800">
                Ngân Hàng Câu Hỏi & Thư Mục Lưu Trữ
              </h3>
              <p className="text-xs text-slate-500">
                Soạn câu hỏi và sắp xếp theo Tuần / Ngày / Danh mục ({questions.length} câu hỏi)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAddingNew && (
              <button
                onClick={() => {
                  resetForm();
                  setIsAddingNew(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-700/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm câu hỏi mới</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Storage Category / Folder Selection Bar */}
        <div className="py-3 border-b border-slate-100 shrink-0 bg-slate-50/70 -mx-5 px-5 sm:-mx-7 sm:px-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-thin">
              <span className="text-xs font-black text-slate-700 shrink-0 flex items-center gap-1">
                <Folder className="w-4 h-4 text-amber-500" />
                <span>Thư mục:</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  if (onSelectCategory) onSelectCategory('all');
                }}
                className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border flex items-center gap-1 transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                }`}
              >
                <span>Tất cả thư mục</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-white/40 text-slate-900">
                  {questions.length}
                </span>
              </button>

              {allCategories.map((cat) => {
                const count = questions.filter(
                  (q) => q.category === cat || (!q.category && cat === 'Tuần 1')
                ).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (onSelectCategory) onSelectCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        selectedCategory === cat
                          ? 'bg-teal-900 text-teal-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick add category actions */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleAddWeekCategory}
                className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 flex items-center gap-1 transition-all cursor-pointer"
                title="Tạo nhanh thư mục Tuần tiếp theo"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>+ Tuần mới</span>
              </button>
              <button
                type="button"
                onClick={handleAddTodayCategory}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 flex items-center gap-1 transition-all cursor-pointer"
                title="Tạo thư mục theo ngày hôm nay"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Hôm nay</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 flex items-center gap-1 transition-all cursor-pointer"
                title="Tạo thư mục hoặc danh mục bài học tùy chỉnh"
              >
                <FolderPlus className="w-3.5 h-3.5 text-teal-600" />
                <span>+ Thư mục mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Add / Edit Form */}
          {isAddingNew && (
            <form
              onSubmit={handleSaveQuestion}
              className="bg-teal-50/50 p-4 sm:p-5 rounded-3xl border-2 border-teal-200 space-y-3.5 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
                <h4 className="text-sm font-black text-teal-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>{editingId ? 'Chỉnh sửa câu hỏi' : 'Soạn câu hỏi trắc nghiệm mới'}</span>
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Hủy bỏ
                </button>
              </div>

              {/* Storage Category / Folder Selection inside Form */}
              <div className="p-3 bg-white rounded-2xl border border-teal-200 space-y-2">
                <label className="block text-xs font-extrabold text-teal-950 flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-amber-500" />
                  <span>Nơi lưu trữ (Chọn Tuần / Ngày / Danh mục): <span className="text-rose-500">*</span></span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-teal-50/30 text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        📁 {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Hoặc gõ tên thư mục mới..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Gợi ý nhanh:</span>
                  {['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Ôn tập Tổng hợp'].map((suggest) => (
                    <button
                      key={suggest}
                      type="button"
                      onClick={() => setFormCategory(suggest)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        formCategory === suggest
                          ? 'bg-amber-400 text-slate-900 font-black'
                          : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                      }`}
                    >
                      {suggest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Nội dung câu hỏi: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Ví dụ: Thiết bị nào sau đây dùng để gõ chữ vào máy tính?"
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* 4 Options & Correct Answer Radio */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-slate-700">
                    4 Phương án trả lời (chọn nút tròn để đánh dấu đáp án đúng): <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = formOptions.map((opt, idx) => ({
                        text: opt,
                        isCorrect: idx === formCorrectIndex
                      }));
                      for (let i = items.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        const temp = items[i];
                        items[i] = items[j];
                        items[j] = temp;
                      }
                      setFormOptions(items.map((it) => it.text));
                      const newCorrect = items.findIndex((it) => it.isCorrect);
                      if (newCorrect >= 0) setFormCorrectIndex(newCorrect);
                    }}
                    title="Đảo ngẫu nhiên vị trí các đáp án (không làm mất đáp án đúng)"
                    className="px-2 py-0.5 rounded-lg bg-white border border-teal-300 text-teal-700 text-[11px] font-bold hover:bg-teal-50 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Đảo ngẫu nhiên vị trí</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OPTION_LETTERS.map((letter, idx) => (
                    <div
                      key={letter}
                      className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 transition-all ${
                        formCorrectIndex === idx
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`opt_${letter}`}
                        name="correctOption"
                        checked={formCorrectIndex === idx}
                        onChange={() => setFormCorrectIndex(idx)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`opt_${letter}`}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 cursor-pointer ${
                          formCorrectIndex === idx
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {letter}
                      </label>
                      <input
                        type="text"
                        required
                        value={formOptions[idx]}
                        onChange={(e) => {
                          const next = [...formOptions];
                          next[idx] = e.target.value;
                          setFormOptions(next);
                        }}
                        placeholder={`Phương án ${letter}`}
                        className="flex-1 px-2.5 py-1 text-xs bg-transparent border-b border-dashed border-slate-300 focus:border-teal-500 focus:outline-none font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata Row: Subject, Coins, Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Môn học / Chủ đề:
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Tin học và Công nghệ, Toán, Tiếng Việt..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold mb-1.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Tin học và Công nghệ',
                      'Tin học',
                      'Công nghệ',
                      'Toán',
                      'Tiếng Việt',
                      'Khoa học',
                      'Tiếng Anh',
                      'Đố vui'
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormSubject(s)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          formSubject === s
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số hoa thưởng khi đúng:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 5].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormRewardCoins(amt)}
                        className={`flex-1 py-1 rounded-xl text-xs font-black border transition-all ${
                          formRewardCoins === amt
                            ? 'bg-rose-400 text-slate-900 border-rose-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        +{amt} 🌺
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Giải thích đáp án (tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Lời giải hoặc mẹo ghi nhớ..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-700/20 cursor-pointer"
                >
                  {editingId ? 'Cập nhật câu hỏi' : 'Lưu vào ngân hàng'}
                </button>
              </div>
            </form>
          )}

          {/* Search and Subject Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1.5 scrollbar-thin">
              {subjectsList.map((sub) => {
                const count =
                  sub === 'all'
                    ? questions.length
                    : sub === 'Tin học và Công nghệ'
                    ? questions.filter(
                        (q) =>
                          q.subject === 'Tin học và Công nghệ' ||
                          q.subject === 'Tin học' ||
                          q.subject === 'Công nghệ'
                      ).length
                    : questions.filter((q) => q.subject === sub).length;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedSubject === sub
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <span>{sub === 'all' ? 'Tất cả môn' : sub}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        selectedSubject === sub
                          ? 'bg-teal-700/90 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-2.5">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-teal-200 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-lg bg-teal-50 text-teal-800 font-black text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    
                    {/* Storage Folder Tag with Quick Switcher */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      <Folder className="w-3 h-3 text-amber-600" />
                      <span>Thư mục:</span>
                      <select
                        value={q.category || 'Tuần 1'}
                        onChange={(e) => handleQuickChangeQuestionCategory(q.id, e.target.value)}
                        className="bg-transparent font-black text-[10px] text-amber-950 focus:outline-none cursor-pointer"
                      >
                        {allCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {q.subject && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                        {q.subject}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900">
                      🌺 +{q.rewardCoins || 2} hoa
                    </span>
                  </div>

                  <p className="text-sm font-black text-slate-800 leading-snug">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs text-slate-600 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`px-2 py-1 rounded-lg border text-[11px] truncate ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                        title={opt}
                      >
                        <b>{OPTION_LETTERS[oIdx]}.</b> {opt}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleStartEdit(q)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-all cursor-pointer"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition-all cursor-pointer"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-teal-600" />
                <p className="text-sm font-extrabold text-slate-600">Không tìm thấy câu hỏi nào trong thư mục này</p>
                <p className="text-xs text-slate-400 mt-1">
                  Hãy chọn thư mục khác hoặc bấm nút "Thêm câu hỏi mới" để tạo câu hỏi lưu vào đây!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs font-extrabold text-teal-700 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục câu hỏi mẫu chuẩn (gồm Tin học & Công nghệ)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all w-full sm:w-auto cursor-pointer"
          >
            Đóng ngân hàng câu hỏi
          </button>
        </div>
      </div>

      {/* Custom Add Folder / Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-2 border-teal-200 space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-teal-600" />
                <span>Tạo Thư Mục / Danh Mục Mới</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên thư mục lưu trữ (ví dụ: Tuần 5, Bài 2 - Tin học, Kiểm tra 15p):
              </label>
              <input
                type="text"
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCategory(newCategoryName);
                }}
                placeholder="Nhập tên thư mục mới..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleCreateCategory(newCategoryName)}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-700/20"
              >
                Tạo thư mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
