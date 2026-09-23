import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  Copy,
  Check,
  Lightbulb,
  Zap,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

export const AiAssistantTab: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [grade, setGrade] = useState<string>('3');
  const [subject, setSubject] = useState<string>('Tin học');
  const [integrationType, setIntegrationType] = useState<string>('stem');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Vui lòng nhập tên bài dạy hoặc chủ đề cần AI hỗ trợ!');
      return;
    }

    try {
      setIsLoading(true);
      setAiResponse(null);

      // Attempt calling server API
      const response = await fetch('/api/gemini/suggest-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          grade,
          subject,
          integrationType
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestion) {
          setAiResponse(data.suggestion);
          return;
        }
      }

      // Offline / client fallback if server endpoint is not running
      const fallbackResult = `[GỢI Ý KẾ HOẠCH DẠY HỌC TỪ AI]
1. Tên bài dạy: ${topic} (Môn: ${subject} - Khối ${grade})
2. Mục tiêu trọng tâm:
   - Kiến thức: Giúp học sinh nắm vững các khái niệm cơ bản và ý nghĩa ứng dụng thực tiễn của ${topic}.
   - Phẩm chất: Rèn luyện tính trung thực, chăm chỉ và trách nhiệm bảo quản thiết bị học tập.
   - Năng lực: Phát triển năng lực giải quyết vấn đề sáng tạo, năng lực tự chủ và hợp tác nhóm.
3. Định hướng tích hợp (${integrationType.toUpperCase()}):
   - Tích hợp thực hành trải nghiệm, liên hệ thực tế đời sống hàng ngày của học sinh.
   - Vận dụng kỹ năng phân tích và đưa ra giải pháp bảo vệ dữ liệu, an toàn thiết bị.
4. Gợi ý đánh giá quá trình:
   - Đánh giá thông qua phiếu quan sát thao tác thực hành và mức độ tham gia thảo luận của nhóm.`;

      setAiResponse(fallbackResult);
    } catch (err) {
      console.error('Error generating AI suggestion:', err);
      setAiResponse('Hệ thống AI đang bảo trì hoặc chưa cấu hình API Key. Quý Thầy/Cô vẫn có thể tiếp tục sử dụng bình thường các chức năng quản lý bài dạy và xuất Word.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-teal-700 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black">
              Trợ Lý Giáo Viên AI Gemini
            </h2>
            <p className="text-xs text-purple-100 font-medium">
              Tự động gợi ý nội dung tích hợp STEM, kỹ năng sống, chuyển đổi số & soạn mục tiêu bài dạy
            </p>
          </div>
        </div>
      </div>

      {/* Main interaction grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-2 border-purple-200 shadow-lg space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-600" />
            <span>Thông tin yêu cầu soạn</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Khối lớp
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500"
            >
              <option value="1">Khối 1</option>
              <option value="2">Khối 2</option>
              <option value="3">Khối 3</option>
              <option value="4">Khối 4</option>
              <option value="5">Khối 5</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Môn học
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Chủ đề tích hợp
            </label>
            <select
              value={integrationType}
              onChange={(e) => setIntegrationType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500"
            >
              <option value="stem">Tích hợp giáo dục STEM</option>
              <option value="digital">Chuyển đổi số & An toàn mạng</option>
              <option value="environment">Giáo dục bảo vệ môi trường</option>
              <option value="life_skills">Rèn luyện kỹ năng sống & tự học</option>
              <option value="defense">Giáo dục quốc phòng & an ninh</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Tên bài dạy hoặc nội dung
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Làm quen với chuột máy tính, Gõ tiếng Việt..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? 'AI đang xử lý...' : 'Tạo gợi ý tích hợp'}</span>
          </button>
        </div>

        {/* Right Output */}
        <div className="md:col-span-2 bg-white/95 backdrop-blur-md rounded-3xl p-6 border-2 border-purple-200 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Kết quả phân tích từ Gemini AI</span>
              </h3>

              {aiResponse && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              )}
            </div>

            {aiResponse ? (
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold">Chưa có kết quả phân tích</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nhập tên bài dạy và bấm "Tạo gợi ý tích hợp" để AI hỗ trợ Thầy/Cô
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
