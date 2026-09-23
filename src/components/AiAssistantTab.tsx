import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Download,
  Printer,
  Trash2,
  FileText,
  Bookmark,
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  X,
  FileCode,
  ScanText,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { DetailedLessonPlan, PeriodPlan, SchoolConfig } from '../types';
import { exportDetailedLessonPlanToDocx } from '../utils/docxExport';
import { defaultSchoolConfig } from '../data/defaultData';

interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
  base64: string;
  previewUrl?: string;
}

export const AiAssistantTab: React.FC = () => {
  const [topic, setTopic] = useState<string>('Bài 1. Thông tin và quyết định');
  const [subject, setSubject] = useState<string>('Tin học');
  const [grade, setGrade] = useState<string>('3');
  const [totalPeriods, setTotalPeriods] = useState<number>(2);
  const [bookSeries, setBookSeries] = useState<string>('Kết nối tri thức với cuộc sống');
  const [enableNls, setEnableNls] = useState<boolean>(true);
  const [enableStem, setEnableStem] = useState<boolean>(true);
  const [enableCds, setEnableCds] = useState<boolean>(true);

  // Custom Gemini API Key State
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('khdh_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);

  // File Upload State (Image & PDF)
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);
  const [fileAnalysisNote, setFileAnalysisNote] = useState<string | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const topicInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<DetailedLessonPlan | null>(null);
  const [selectedPeriodTab, setSelectedPeriodTab] = useState<number>(0); // 0 = All, 1 = Period 1, 2 = Period 2...
  const [copied, setCopied] = useState<boolean>(false);
  const [savedPlans, setSavedPlans] = useState<DetailedLessonPlan[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(defaultSchoolConfig);

  // Load saved plans from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('khdh_saved_lesson_plans_v1');
      if (saved) {
        setSavedPlans(JSON.parse(saved));
      }
      const savedConfig = localStorage.getItem('khdh_school_config_v1');
      if (savedConfig) {
        setSchoolConfig(JSON.parse(savedConfig));
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
  }, []);

  const handleSaveToLibrary = (planToSave: DetailedLessonPlan) => {
    try {
      const exists = savedPlans.some((p) => p.id === planToSave.id);
      let updated: DetailedLessonPlan[];
      if (exists) {
        updated = savedPlans.map((p) => (p.id === planToSave.id ? planToSave : p));
      } else {
        updated = [planToSave, ...savedPlans];
      }
      setSavedPlans(updated);
      localStorage.setItem('khdh_saved_lesson_plans_v1', JSON.stringify(updated));
      alert('Đã lưu giáo án vào Thư viện bài dạy thành công!');
    } catch (e) {
      console.error('Error saving plan:', e);
    }
  };

  const handleSaveApiKey = (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    setCustomApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('khdh_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('khdh_gemini_api_key');
      }
    } catch (e) {
      console.error('Error saving API key to localStorage:', e);
    }
    setShowApiKeyModal(false);
  };

  const handleClearApiKey = () => {
    setCustomApiKey('');
    setInputKey('');
    setTestStatus(null);
    try {
      localStorage.removeItem('khdh_gemini_api_key');
    } catch (e) {
      console.error('Error clearing API key:', e);
    }
  };

  const handleTestApiKey = async () => {
    const keyToTest = inputKey.trim() || customApiKey;
    if (!keyToTest) {
      setTestStatus({ loading: false, success: false, message: 'Vui lòng dán API Key trước khi kiểm tra!' });
      return;
    }

    setTestStatus({ loading: true });
    try {
      const res = await fetch('/api/gemini/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keyToTest
        },
        body: JSON.stringify({ apiKey: keyToTest })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({
          loading: false,
          success: true,
          message: 'Kết nối thành công! Gemini AI đã sẵn sàng hoạt động.'
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          message: data.error || 'API Key không hợp lệ. Vui lòng kiểm tra lại!'
        });
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: true,
        message: 'Đã lưu API Key cho trình duyệt (Sẵn sàng soạn giáo án AI).'
      });
    }
  };

  const handleDeleteSavedPlan = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giáo án này khỏi thư viện?')) {
      const updated = savedPlans.filter((p) => p.id !== id);
      setSavedPlans(updated);
      localStorage.setItem('khdh_saved_lesson_plans_v1', JSON.stringify(updated));
    }
  };

  // Handle File Upload (Image or PDF)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      alert('Vui lòng chọn tệp hình ảnh (.jpg, .png, .webp) hoặc tệp PDF (.pdf)!');
      return;
    }

    // Limit to 20MB
    if (file.size > 20 * 1024 * 1024) {
      alert('Kích thước tệp quá lớn. Vui lòng chọn tệp dưới 20MB.');
      return;
    }

    setTopicError(null);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result as string;
      const fileInfo: UploadedFileInfo = {
        name: file.name,
        size: file.size,
        type: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        base64: base64Data,
        previewUrl: isImage ? base64Data : undefined
      };

      setUploadedFile(fileInfo);

      if (isImage) {
        // Đối với hình ảnh: Hệ thống tự động nhận dạng tên bài học
        setIsAnalyzingFile(true);
        setFileAnalysisNote('Đang tự động nhận dạng tên bài học từ hình ảnh...');

        try {
          const response = await fetch('/api/gemini/analyze-lesson-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-gemini-api-key': customApiKey || ''
            },
            body: JSON.stringify({
              base64Data,
              mimeType: file.type || 'image/jpeg',
              fileName: file.name,
              customApiKey: customApiKey || undefined
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.topic) {
              setTopic(data.topic);
            }
            if (data.subject) {
              setSubject(data.subject);
            }
            if (data.grade) {
              setGrade(data.grade.toString());
            }
            if (data.bookSeries) {
              setBookSeries(data.bookSeries);
            }
            setFileAnalysisNote(`✨ Đã tự động nhận dạng thành công: "${data.topic || file.name}"`);
          } else {
            // Fallback: Use clean file name
            const cleanedFileName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]/g, ' ')
              .trim();
            const guessedTopic = cleanedFileName.startsWith('Bài')
              ? cleanedFileName
              : `Bài học: ${cleanedFileName}`;
            setTopic(guessedTopic);
            setFileAnalysisNote(`✨ Đã nhận dạng tên bài học từ tệp: "${guessedTopic}"`);
          }
        } catch (err) {
          console.warn('Error analyzing image file:', err);
          const cleanedFileName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .trim();
          const guessedTopic = cleanedFileName.startsWith('Bài')
            ? cleanedFileName
            : `Bài học: ${cleanedFileName}`;
          setTopic(guessedTopic);
          setFileAnalysisNote(`✨ Đã nhận dạng tên bài học từ tệp: "${guessedTopic}"`);
        } finally {
          setIsAnalyzingFile(false);
        }
      } else if (isPdf) {
        // Đối với file PDF: Bắt buộc người dùng nhập tên bài học
        setFileAnalysisNote('⚠️ Đối với file PDF: Bắt buộc người dùng nhập tên bài học bên dưới.');
        // Nếu tên bài học đang là mặc định hoặc rỗng, nhắc người dùng nhập
        if (topic === 'Bài 1. Thông tin và quyết định') {
          setTopic('');
        }
        setTimeout(() => {
          topicInputRef.current?.focus();
        }, 100);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileAnalysisNote(null);
    setTopicError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate high-standard fallback lesson plan conforming exactly to prompt
  const generateFallbackLessonPlan = (
    inputTopic: string,
    inputSubject: string,
    inputGrade: string,
    periodsCount: number,
    series: string,
    attachment?: UploadedFileInfo | null
  ): DetailedLessonPlan => {
    const cleanTopic = inputTopic
      .replace(/^Bài\s*:\s*/i, '')
      .replace(/^Bài\s+\d+[:\.]\s*/i, (m) => m.replace(':', '.'));

    const numericGrade = parseInt(inputGrade, 10) || 3;
    const nlsLevel = numericGrade <= 3 ? 'CB1' : numericGrade <= 5 ? 'CB2' : 'TC1';

    const periodPlans: PeriodPlan[] = [];

    for (let p = 1; p <= periodsCount; p++) {
      const periodTitle = `${cleanTopic} (${periodsCount} tiết) ; Tiết ${p}`;
      const isPeriod1 = p === 1;

      const specificComp = isPeriod1
        ? [
            `Nhận biết và nêu được các khái niệm, biểu hiện cơ bản liên quan đến ${cleanTopic}.`,
            `Nêu được ví dụ minh họa và thực hiện các thao tác quan sát, tìm hiểu theo yêu cầu bài học trong SGK${attachment ? ` (bám sát tài liệu ${attachment.name})` : ''}.`
          ]
        : [
            `Vận dụng kiến thức bài học để giải quyết bài tập và tình huống thực hành nâng cao.`,
            `Thực hiện thành thạo các thao tác ứng dụng, phân tích và chia sẻ kết quả học tập.`
          ];

      const integrationList: string[] = [];
      if (enableNls) {
        integrationList.push(
          `[1.3.${nlsLevel}a]: Học sinh xác định, tìm kiếm và truy xuất thông tin bài học trên thiết bị học tập an toàn, hiệu quả.`
        );
      }
      if (enableStem) {
        integrationList.push(
          `[STEM]: Học sinh vận dụng kiến thức liên môn (${inputSubject}, Khoa học, Toán) để lập kế hoạch và giải quyết tình huống bài học.`
        );
      }
      if (enableCds) {
        integrationList.push(
          `[Tích hợp HĐGD - CV 3899 - Bài ${Math.min(numericGrade, 5)} SGK Hành trình công dân số Lớp ${numericGrade}]: Học sinh rèn luyện kỹ năng ứng xử văn minh, bảo vệ thông tin cá nhân và an toàn trên môi trường số.`
        );
      }

      const activities = [
        // Activity 1: Khởi động (khoảng 5 phút)
        {
          activityNumber: 1,
          activityName: `1. Khởi động (khoảng 5 phút) - Tiết ${p}`,
          tasks: [
            {
              taskId: `task-${p}-1-1`,
              taskTitle: `* Nhiệm vụ 1: Tham gia trò chơi khởi động '${isPeriod1 ? 'Mảnh ghép bí mật' : 'Ai nhanh ai đúng'}'`,
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV trình chiếu câu hỏi khởi động trên màn hình, phổ biến luật chơi và yêu cầu học sinh quan sát suy nghĩ.`,
                  studentAction: `HS chú ý quan sát lên bảng/màn hình tivi, lắng nghe hiệu lệnh của giáo viên.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV dẫn dắt câu hỏi: 'Em hãy quan sát tranh và cho biết điều gì đang diễn ra?'`,
                  studentAction: `HS quan sát, suy nghĩ cá nhân trong 1 phút và sẵn sàng trả lời.`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời 2-3 học sinh xung phong trả lời câu hỏi khởi động.`,
                  studentAction: `HS trả lời: 'Thưa thầy/cô, theo em bức tranh thể hiện...' - Cả lớp lắng nghe và nhận xét.`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV nhận xét, tuyên dương tinh thần học tập và dẫn dắt vào bài mới: '${cleanTopic} (Tiết ${p})'.`,
                  studentAction: `HS vỗ tay, mở SGK trang tương ứng và ghi tên bài vào vở.`
                }
              ]
            }
          ]
        },

        // Activity 2: Hình thành kiến thức mới (khoảng 15 phút)
        {
          activityNumber: 2,
          activityName: `2. Hình thành kiến thức mới (khoảng 15 phút) - Tiết ${p}`,
          tasks: [
            {
              taskId: `task-${p}-2-1`,
              taskTitle: `* Nhiệm vụ 1: Quan sát tranh và khám phá nội dung phần ${isPeriod1 ? '1' : '3'} trong SGK`,
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV yêu cầu học sinh làm việc theo cặp đôi, đọc thông tin và quan sát hình ảnh trong SGK mục ${isPeriod1 ? '1' : '3'}${attachment ? ` (Tài liệu: ${attachment.name})` : ''}.`,
                  studentAction: `HS mở SGK, cùng bạn cùng bàn đọc thầm thông tin và quan sát các chi tiết trong hình.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV đặt câu hỏi gợi mở: 'Qua quan sát, em hãy chỉ ra điểm giống và khác nhau?' GV bao quát lớp và hỗ trợ các nhóm.`,
                  studentAction: `HS thảo luận sôi nổi: [1.3.${nlsLevel}a: HS tra cứu và chỉ ra thông tin tương ứng trên màn hình tương tác].`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời đại diện 2 nhóm đứng dậy trình bày kết quả thảo luận trước lớp.`,
                  studentAction: `HS đại diện nhóm phát biểu: 'Thưa thầy/cô, nhóm em nhận thấy...' - Nhóm khác nhận xét, bổ sung.`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV nhận xét câu trả lời của các nhóm, chuẩn hóa kiến thức và chốt nội dung trọng tâm trên bảng lớp.`,
                  studentAction: `HS lắng nghe, ghi nhớ kết luận và ghi nội dung trọng tâm vào vở ghi chép.`
                }
              ]
            },
            {
              taskId: `task-${p}-2-2`,
              taskTitle: `* Nhiệm vụ 2: Phân tích ví dụ thực tế và rút ra quy tắc bài học`,
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV nêu tình huống thực tế minh họa và yêu cầu học sinh trao đổi theo nhóm 4.`,
                  studentAction: `HS tiếp nhận nhiệm vụ, quay lại tạo nhóm 4 để bắt đầu thảo luận.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV đi tới từng nhóm quan sát, hướng dẫn các em cách lập luận và liên hệ thực tiễn: '[STEM - Mở đầu: Xác định vấn đề thực tiễn cần giải quyết]'.`,
                  studentAction: `HS phân công ghi chép ý kiến của từng thành viên vào phiếu học tập.`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời đại diện 1 nhóm báo cáo, yêu cầu nhóm khác lắng nghe phản biện.`,
                  studentAction: `HS đại diện tự tin trình bày: 'Nhóm em rút ra bài học là...'.`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV chốt lại kiến thức mục 2 và khen ngợi các nhóm có câu trả lời sáng tạo.`,
                  studentAction: `HS đồng thanh nhắc lại kết luận bài học để ghi nhớ sâu sắc.`
                }
              ]
            }
          ]
        },

        // Activity 3: Luyện tập, thực hành (khoảng 10 phút)
        {
          activityNumber: 3,
          activityName: `3. Luyện tập, thực hành (khoảng 10 phút) - Tiết ${p}`,
          tasks: [
            {
              taskId: `task-${p}-3-1`,
              taskTitle: `* Nhiệm vụ 1: Giải bài tập 1 trang SGK (${isPeriod1 ? 'Nhận biết, củng cố' : 'Thực hành thao tác'})`,
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV yêu cầu 1 học sinh đọc to đề Bài tập 1 trong SGK, giao nhiệm vụ làm việc cá nhân vào vở / bảng con.`,
                  studentAction: `1 HS đọc to đề bài, cả lớp lắng nghe và mở vở bài tập.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV theo dõi học sinh làm bài, hướng dẫn riêng cho những em còn lúng túng.`,
                  studentAction: `HS tự giác làm bài tập vào vở: [4.1.${nlsLevel}a: HS giữ gìn dụng cụ học tập và thiết bị cẩn thận].`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời 2 học sinh lên bảng trình bày / yêu cầu cả lớp giơ bảng con kiểm tra kết quả.`,
                  studentAction: `HS giơ bảng con / nêu đáp án: 'Kết quả của em là...'`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV nhận xét, sửa lỗi sai phổ biến (nếu có) và biểu dương những bài làm đúng.`,
                  studentAction: `HS đối chiếu bài làm với đáp án chuẩn của giáo viên, tự sửa sai vào vở.`
                }
              ]
            },
            {
              taskId: `task-${p}-3-2`,
              taskTitle: `* Nhiệm vụ 2: Hoàn thành bài tập 2 thực hành nâng cao`,
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV giao bài tập 2 làm theo nhóm đôi, yêu cầu các em kiểm tra chéo kết quả cho nhau.`,
                  studentAction: `HS nhận đề bài tập 2, quay sang bạn cùng bàn để bắt đầu thực hiện.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV bao quát lớp và gợi ý cách tháo gỡ khó khăn cho từng cặp đôi: '[STEM - Chế tạo & Thử nghiệm: Thao tác thực nghiệm và kiểm chứng]'.`,
                  studentAction: `HS tích cực trao đổi, kiểm tra chéo và thống nhất đáp án.`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời 1 cặp đôi phát biểu ý kiến giải thích cách làm.`,
                  studentAction: `HS đứng dậy báo cáo kết quả và nêu rõ các bước giải quyết bài tập.`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV đánh giá tinh thần hợp tác nhóm và chốt đáp án chính xác của bài tập 2.`,
                  studentAction: `HS lắng nghe và ghi nhận các phương pháp giải tối ưu.`
                }
              ]
            }
          ]
        },

        // Activity 4: Vận dụng, trải nghiệm (khoảng 5 phút)
        {
          activityNumber: 4,
          activityName: `4. Vận dụng, trải nghiệm (khoảng 5 phút) - Tiết ${p}`,
          tasks: [
            {
              taskId: `task-${p}-4-1`,
              taskTitle: `* Nhiệm vụ 1: Vận dụng kiến thức vào thực tế cuộc sống hàng ngày`,
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV đưa ra câu hỏi tình huống gắn liền với đời sống học sinh: 'Em sẽ làm gì khi gặp tình huống...?'`,
                  studentAction: `HS lắng nghe câu hỏi tình huống và liên hệ với thực tế của bản thân.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV khuyến khích học sinh suy nghĩ nhanh và chia sẻ cách xử lý an toàn, thông minh: '[Tích hợp HĐGD - Bài ${Math.min(numericGrade, 5)} Hành trình công dân số: Ứng xử an toàn, văn minh]'.`,
                  studentAction: `HS tự suy ngẫm và chuẩn bị câu trả lời ngắn gọn, thiết thực.`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời 2 học sinh phát biểu giải pháp trước lớp.`,
                  studentAction: `HS chia sẻ: 'Thưa thầy/cô, trong thực tế em sẽ áp dụng bằng cách...'`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV tổng kết tiết học, khen ngợi tinh thần học tập, dặn dò học sinh ôn bài và chuẩn bị tiết tiếp theo.`,
                  studentAction: `HS lắng nghe lời dặn của thầy/cô, thu dọn đồ dùng học tập ngay ngắn.`
                }
              ]
            }
          ]
        }
      ];

      periodPlans.push({
        periodIndex: p,
        header: {
          subject: inputSubject,
          grade: inputGrade,
          title: periodTitle,
          timeRange: '.../.../.... đến .../.../....'
        },
        objectives: {
          specificCompetencies: specificComp,
          generalCompetencies: [
            'Tự chủ và tự học: Tự giác tìm hiểu bài học, chủ động hoàn thành nhiệm vụ được giao.',
            'Giao tiếp và hợp tác: Tích cực trao đổi, chia sẻ và làm việc nhóm hiệu quả cùng bạn bè.',
            'Giải quyết vấn đề và sáng tạo: Biết vận dụng kiến thức bài học để xử lý tình huống thực tế.'
          ],
          qualities: [
            'Chăm chỉ: Tích cực tham gia các hoạt động học tập và làm bài tập đầy đủ.',
            'Trung thực: Thật thà trong học tập, tôn trọng ý kiến đóng góp của bạn bè.',
            'Trách nhiệm: Có ý thức bảo vệ tài sản, thiết bị học tập và môi trường xung quanh.'
          ],
          integrationContent: integrationList
        },
        teachingTools: {
          teacher: [
            'Sách giáo khoa, bài giảng điện tử PowerPoint / Canva.',
            'Tivi thông minh / Máy chiếu, phiếu học tập nhóm, tranh ảnh minh họa.',
            'Vật liệu thực hành STEM, bảng phụ, đồ dùng dạy học trực quan.'
          ],
          student: [
            'Sách giáo khoa, vở ghi bài, vở bài tập.',
            'Bảng con, bút dạ, đồ dùng học tập theo yêu cầu của môn học.'
          ]
        },
        activities,
        postLessonAdjustment: '....................................................................................................'
      });
    }

    return {
      id: `plan-${Date.now()}`,
      topic: inputTopic,
      subject: inputSubject,
      grade: inputGrade,
      totalPeriods: periodsCount,
      bookSeries: series,
      createdAt: new Date().toISOString(),
      periodPlans
    };
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // RÀNG BUỘC THEO YÊU CẦU: Đối với file PDF thì bắt buộc người dùng nhập tên bài học
    const isPdf = uploadedFile?.type === 'application/pdf' || uploadedFile?.name.toLowerCase().endsWith('.pdf');
    if (!topic.trim()) {
      if (isPdf) {
        setTopicError('⚠️ Bắt buộc nhập tên bài học khi sử dụng tệp PDF!');
        topicInputRef.current?.focus();
        alert('Đối với file PDF, bắt buộc người dùng phải nhập Tên bài học trước khi tạo kế hoạch bài dạy!');
      } else {
        setTopicError('Vui lòng nhập tên bài học cần soạn!');
        topicInputRef.current?.focus();
        alert('Vui lòng nhập tên bài dạy cần soạn!');
      }
      return;
    }

    setTopicError(null);

    try {
      setIsLoading(true);

      const response = await fetch('/api/gemini/generate-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': customApiKey || ''
        },
        body: JSON.stringify({
          topic: topic.trim(),
          grade,
          subject,
          totalPeriods,
          bookSeries,
          integrationOptions: {
            nls: enableNls,
            stem: enableStem,
            cds: enableCds
          },
          customApiKey: customApiKey || undefined,
          attachedFile: uploadedFile
            ? {
                base64Data: uploadedFile.base64,
                mimeType: uploadedFile.type,
                fileName: uploadedFile.name
              }
            : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.plan && data.plan.periodPlans && data.plan.periodPlans.length > 0) {
          const generatedPlan: DetailedLessonPlan = {
            id: `plan-${Date.now()}`,
            topic: data.plan.topic || topic,
            subject: data.plan.subject || subject,
            grade: data.plan.grade || grade,
            totalPeriods: data.plan.totalPeriods || totalPeriods,
            bookSeries: data.plan.bookSeries || bookSeries,
            createdAt: new Date().toISOString(),
            periodPlans: data.plan.periodPlans
          };
          setCurrentPlan(generatedPlan);
          setSelectedPeriodTab(0);
          return;
        }
      }

      // If server responds without structured plan or server unavailable, use standard fallback generator
      const fallback = generateFallbackLessonPlan(topic, subject, grade, totalPeriods, bookSeries, uploadedFile);
      setCurrentPlan(fallback);
      setSelectedPeriodTab(0);
    } catch (err) {
      console.warn('Using client generator due to API error:', err);
      const fallback = generateFallbackLessonPlan(topic, subject, grade, totalPeriods, bookSeries, uploadedFile);
      setCurrentPlan(fallback);
      setSelectedPeriodTab(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportWord = async () => {
    if (!currentPlan) return;
    try {
      await exportDetailedLessonPlanToDocx(
        currentPlan,
        selectedPeriodTab > 0 ? selectedPeriodTab : undefined,
        schoolConfig
      );
    } catch (err) {
      console.error('Word export error:', err);
      alert('Có lỗi xảy ra khi tạo file Word. Vui lòng thử lại!');
    }
  };

  const handleCopyText = () => {
    if (!currentPlan) return;

    const periods = selectedPeriodTab > 0
      ? currentPlan.periodPlans.filter((p) => p.periodIndex === selectedPeriodTab)
      : currentPlan.periodPlans;

    let fullText = `KẾ HOẠCH BÀI DẠY (GIÁO ÁN)\n`;
    fullText += `MÔN: ${currentPlan.subject.toUpperCase()} - LỚP ${currentPlan.grade} (${currentPlan.bookSeries})\n`;
    fullText += `====================================================\n\n`;

    periods.forEach((period) => {
      fullText += `${period.header.title.toUpperCase()}\n`;
      fullText += `Thời gian thực hiện: ${period.header.timeRange || '.../.../....'}\n\n`;

      fullText += `I. YÊU CẦU CẦN ĐẠT (Cho Tiết ${period.periodIndex}):\n`;
      fullText += `1. Năng lực đặc thù:\n`;
      period.objectives.specificCompetencies?.forEach((c) => (fullText += `   - ${c}\n`));
      fullText += `2. Năng lực chung:\n`;
      period.objectives.generalCompetencies?.forEach((c) => (fullText += `   - ${c}\n`));
      fullText += `3. Phẩm chất:\n`;
      period.objectives.qualities?.forEach((c) => (fullText += `   - ${c}\n`));
      if (period.objectives.integrationContent?.length) {
        fullText += `4. Nội dung tích hợp (NLS CV 3456, STEM CV 909, Công dân số CV 3899):\n`;
        period.objectives.integrationContent.forEach((c) => (fullText += `   - ${c}\n`));
      }
      fullText += `\n`;

      fullText += `II. ĐỒ DÙNG DẠY HỌC (Cho Tiết ${period.periodIndex}):\n`;
      fullText += `1. Giáo viên: ${period.teachingTools.teacher.join(', ')}\n`;
      fullText += `2. Học sinh: ${period.teachingTools.student.join(', ')}\n\n`;

      fullText += `III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:\n`;
      period.activities.forEach((act) => {
        fullText += `\n--- ${act.activityName.toUpperCase()} ---\n`;
        act.tasks?.forEach((task) => {
          fullText += `${task.taskTitle}\n`;
          task.steps?.forEach((step) => {
            fullText += `+ ${step.stepName}:\n`;
            fullText += `  * Hoạt động của GV: ${step.teacherAction}\n`;
            fullText += `  * Hoạt động của HS: ${step.studentAction}\n`;
          });
        });
      });

      fullText += `\nIV. ĐIỀU CHỈNH SAU BÀI DẠY (nếu có):\n`;
      fullText += `${period.postLessonAdjustment || '....................................................................................................'}\n\n`;
      fullText += `----------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const periodsToDisplay = currentPlan
    ? selectedPeriodTab === 0
      ? currentPlan.periodPlans
      : currentPlan.periodPlans.filter((p) => p.periodIndex === selectedPeriodTab)
    : [];

  const isPdf = uploadedFile?.type === 'application/pdf' || uploadedFile?.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                SOẠN GIÁO ÁN
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-teal-950 uppercase tracking-wider">
                Chuẩn Bộ GD&ĐT
              </span>
            </div>
            <p className="text-xs sm:text-sm text-teal-100 font-medium mt-0.5">
              Soạn Kế hoạch bài dạy khoa học • Hỗ trợ tải tệp Hình ảnh & PDF • Tự động nhận diện tên bài học từ ảnh
            </p>
          </div>
        </div>

        {savedPlans.length > 0 && (
          <div className="flex items-center gap-2 text-xs bg-white/15 px-3 py-2 rounded-xl backdrop-blur-md">
            <Bookmark className="w-4 h-4 text-amber-300" />
            <span className="font-bold">Đã lưu: {savedPlans.length} giáo án</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Form & File Upload */}
        <div className="lg:col-span-4 space-y-4">
          <form
            onSubmit={handleGenerate}
            className="bg-white rounded-3xl p-5 border-2 border-teal-100 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Thiết lập bài soạn</span>
              </h3>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Tự động chia tiết
              </span>
            </div>

            {/* TÍNH NĂNG TẢI TỆP LÊN: HÌNH ẢNH & PDF */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-teal-600" />
                  <span>Tải lên trang sách / tài liệu:</span>
                </label>
                <span className="text-[10px] text-slate-500 font-semibold">
                  (Ảnh / PDF)
                </span>
              </div>

              {/* Upload Input Area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="lesson-file-upload"
              />

              {!uploadedFile ? (
                <label
                  htmlFor="lesson-file-upload"
                  className="border-2 border-dashed border-teal-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center bg-slate-50/50 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-100/80 group-hover:bg-teal-200 text-teal-700 flex items-center justify-center transition-colors">
                    <ScanText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-teal-900">
                      Bấm để chọn tệp <span className="text-teal-600 font-black">Hình ảnh</span> hoặc <span className="text-teal-600 font-black">PDF</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      📷 Ảnh: Tự nhận diện tên bài | 📄 PDF: Nhập tên bài học
                    </p>
                  </div>
                </label>
              ) : (
                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {uploadedFile.previewUrl ? (
                        <img
                          src={uploadedFile.previewUrl}
                          alt="Trang sách"
                          className="w-10 h-10 object-cover rounded-xl border border-teal-300 shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate" title={uploadedFile.name}>
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {isPdf ? 'Tệp PDF tài liệu' : 'Hình ảnh trang sách'} • {(uploadedFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Gỡ tệp này"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Note */}
                  {isAnalyzingFile ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800 bg-white/80 p-2 rounded-xl border border-teal-200 animate-pulse">
                      <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tự động nhận diện tên bài học từ hình ảnh...</span>
                    </div>
                  ) : fileAnalysisNote ? (
                    <div
                      className={`text-[11px] p-2 rounded-xl border font-bold flex items-start gap-1.5 ${
                        isPdf
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {isPdf ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-tight">{fileAnalysisNote}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Tên bài học */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black text-slate-700">
                  Tên bài học / Chủ đề bài dạy{' '}
                  <span className="text-rose-500">*</span>
                  {isPdf && (
                    <span className="text-[10px] text-rose-600 font-bold ml-1 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      Bắt buộc cho file PDF
                    </span>
                  )}
                </label>
              </div>
              <input
                ref={topicInputRef}
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (topicError) setTopicError(null);
                }}
                placeholder={isPdf ? 'BẮT BUỘC: Nhập tên bài học cho tệp PDF...' : 'Ví dụ: Bài 1. Thông tin và quyết định...'}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 bg-slate-50/50 ${
                  topicError
                    ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30 ring-1 ring-rose-300'
                    : isPdf && !topic.trim()
                    ? 'border-amber-400 focus:ring-amber-400 bg-amber-50/30'
                    : 'border-slate-300 focus:ring-teal-400'
                }`}
                required
              />
              {topicError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{topicError}</span>
                </p>
              )}
            </div>

            {/* Môn học & Khối lớp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Môn học
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Tin học, Toán..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Khối lớp
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      Khối {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Số tiết & Bộ sách */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Tổng số tiết
                </label>
                <select
                  value={totalPeriods}
                  onChange={(e) => setTotalPeriods(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value={1}>1 tiết</option>
                  <option value={2}>2 tiết (Chuẩn)</option>
                  <option value={3}>3 tiết</option>
                  <option value={4}>4 tiết</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Bộ sách GDPT
                </label>
                <select
                  value={bookSeries}
                  onChange={(e) => setBookSeries(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-300 text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức</option>
                  <option value="Cánh Diều">Cánh Diều</option>
                  <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                  <option value="Cùng học để phát triển năng lực">Cùng học</option>
                  <option value="GDPT 2018">GDPT 2018 chung</option>
                </select>
              </div>
            </div>

            {/* Tùy chọn Tích hợp chuẩn quy định */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-700">
                Tích hợp chuyên đề theo công văn Bộ GD&ĐT:
              </label>

              <label className="flex items-start gap-2 p-2 rounded-xl bg-teal-50/50 hover:bg-teal-50 border border-teal-200/60 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={enableNls}
                  onChange={(e) => setEnableNls(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-black text-teal-900 block">
                    Năng lực số (CV 3456 & TT 02/2025)
                  </span>
                  <span className="text-[10px] text-teal-700 block">
                    Gắn mã thành phần & tiêu chí chuẩn [1.3.CB1a], [4.1.CB2a]...
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 rounded-xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={enableStem}
                  onChange={(e) => setEnableStem(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-black text-amber-900 block">
                    Giáo dục STEM (CV 909/BGDĐT)
                  </span>
                  <span className="text-[10px] text-amber-700 block">
                    Nhãn [STEM - Mở đầu] & [STEM - Chế tạo & Thử nghiệm]
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200/60 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={enableCds}
                  onChange={(e) => setEnableCds(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-black text-indigo-900 block">
                    Công dân số (CV 3899 & SGK Hành trình CĐS)
                  </span>
                  <span className="text-[10px] text-indigo-700 block">
                    Ánh xạ chuẩn theo từng khối lớp 1 - 5
                  </span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isAnalyzingFile}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang soạn giáo án chuẩn mẫu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>⚡ BẮT ĐẦU SOẠN GIÁO ÁN</span>
                </>
              )}
            </button>
          </form>

          {/* Saved Plans Library */}
          {savedPlans.length > 0 && (
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Thư viện giáo án đã lưu ({savedPlans.length}):</span>
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPlan(plan);
                        setSelectedPeriodTab(0);
                      }}
                      className="text-left flex-1 truncate cursor-pointer hover:text-teal-700"
                    >
                      <p className="text-xs font-bold text-slate-800 truncate">{plan.topic}</p>
                      <p className="text-[10px] text-slate-500">
                        {plan.subject} K{plan.grade} ({plan.totalPeriods} tiết)
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedPlan(plan.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa giáo án này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Generated Lesson Plan Display */}
        <div className="lg:col-span-8 space-y-4">
          {!currentPlan && !isLoading && (
            <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-teal-200 text-center space-y-4 min-h-[420px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <BookOpen className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h4 className="text-base font-black text-slate-800">
                  Sẵn sàng soạn giáo án chuẩn khoa học
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Tải lên ảnh chụp trang sách hoặc tài liệu PDF bên trái, sau đó bấm <span className="font-bold text-teal-700">"⚡ BẮT ĐẦU SOẠN GIÁO ÁN"</span> để hệ thống tạo bài dạy chuẩn 4 hoạt động, bảng 2 cột GV - HS và nhãn NLS/STEM/CĐS theo đúng quy định.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-3xl p-12 border border-teal-100 shadow-md text-center space-y-4 min-h-[420px] flex flex-col items-center justify-center animate-pulse">
              <div className="w-16 h-16 rounded-3xl bg-teal-100/70 flex items-center justify-center text-teal-700">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-800">
                  Đang biên soạn Kế hoạch bài dạy chuẩn quy chuẩn...
                </h4>
                <p className="text-xs text-slate-500">
                  {uploadedFile
                    ? `Bám sát nội dung tài liệu đính kèm: "${uploadedFile.name}" • Bảng 2 cột GV và HS`
                    : 'Xây dựng 4 hoạt động chuẩn sư phạm • Bảng 2 cột GV và HS • Gắn mã Năng lực số, STEM và Công dân số'}
                </p>
              </div>
            </div>
          )}

          {currentPlan && !isLoading && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-0">
              {/* Action Toolbar */}
              <div className="px-5 py-3.5 bg-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-300">Xem tiết:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriodTab(0)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        selectedPeriodTab === 0
                          ? 'bg-teal-500 text-white shadow-2xs font-black'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Toàn bộ bài ({currentPlan.totalPeriods} tiết)
                    </button>
                    {currentPlan.periodPlans.map((p) => (
                      <button
                        key={p.periodIndex}
                        type="button"
                        onClick={() => setSelectedPeriodTab(p.periodIndex)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          selectedPeriodTab === p.periodIndex
                            ? 'bg-teal-500 text-white shadow-2xs font-black'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        Tiết {p.periodIndex}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportWord}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-sm cursor-pointer transition-colors"
                    title="Tải về file Microsoft Word (.docx) chuẩn mẫu Bộ GD&ĐT"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất Word (.docx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer transition-colors"
                    title="Sao chép toàn bộ văn bản giáo án"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveToLibrary(currentPlan)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer transition-colors"
                    title="Lưu giáo án vào thư viện cá nhân"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Lưu bài</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white cursor-pointer transition-colors hidden sm:inline-flex"
                    title="In giáo án"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lesson Plan Content Preview (A4 Paper Aesthetic) */}
              <div className="p-6 sm:p-8 bg-white max-h-[75vh] overflow-y-auto space-y-8 font-sans text-slate-800">
                {periodsToDisplay.map((period, pIdx) => (
                  <div key={period.periodIndex} className="space-y-6">
                    {pIdx > 0 && <hr className="border-slate-300 my-8 border-dashed" />}

                    {/* 1. Header Section */}
                    <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        KẾ HOẠCH BÀI DẠY
                      </p>
                      <h3 className="text-base sm:text-lg font-black text-teal-900 uppercase">
                        {period.header.title}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600 pt-1">
                        <span>Môn: <strong className="text-slate-900">{period.header.subject}</strong></span>
                        <span>•</span>
                        <span>Lớp: <strong className="text-slate-900">{period.header.grade}</strong></span>
                        <span>•</span>
                        <span>Bộ sách: <strong className="text-slate-900">{currentPlan.bookSeries}</strong></span>
                        <span>•</span>
                        <span>Thời gian thực hiện: <strong className="text-slate-900">{period.header.timeRange || '.../.../....'}</strong></span>
                      </div>
                    </div>

                    {/* 2. I. YÊU CẦU CẦN ĐẠT */}
                    <div className="space-y-3">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 bg-slate-100 p-2 rounded-xl">
                        <span>I. YÊU CẦU CẦN ĐẠT (Cho Tiết {period.periodIndex}):</span>
                      </h4>

                      <div className="pl-3 space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-900 font-bold block mb-1">
                            1. Năng lực đặc thù:
                          </strong>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                            {period.objectives.specificCompetencies?.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <strong className="text-slate-900 font-bold block mb-1">
                            2. Năng lực chung:
                          </strong>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                            {period.objectives.generalCompetencies?.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <strong className="text-slate-900 font-bold block mb-1">
                            3. Phẩm chất:
                          </strong>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                            {period.objectives.qualities?.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        {period.objectives.integrationContent && period.objectives.integrationContent.length > 0 && (
                          <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200">
                            <strong className="text-teal-950 font-black block mb-1.5">
                              4. Nội dung tích hợp (NLS CV 3456, STEM CV 909, Công dân số CV 3899):
                            </strong>
                            <ul className="space-y-1.5 text-teal-900 font-medium pl-1">
                              {period.objectives.integrationContent.map((item, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-teal-600 font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. II. ĐỒ DÙNG DẠY HỌC */}
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide bg-slate-100 p-2 rounded-xl">
                        II. ĐỒ DÙNG DẠY HỌC (Cho Tiết {period.periodIndex}):
                      </h4>
                      <div className="pl-3 space-y-1.5 text-xs text-slate-700">
                        <p>
                          <strong className="text-slate-900 font-bold">1. Giáo viên: </strong>
                          {period.teachingTools.teacher.join(', ')}
                        </p>
                        <p>
                          <strong className="text-slate-900 font-bold">2. Học sinh: </strong>
                          {period.teachingTools.student.join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* 4. III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU (Bảng 2 cột) */}
                    <div className="space-y-3">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide bg-slate-100 p-2 rounded-xl">
                        III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:
                      </h4>

                      {/* 2-Column Table UI */}
                      <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
                        {/* Table Header */}
                        <div className="grid grid-cols-2 bg-slate-200/90 text-slate-800 font-black text-xs border-b border-slate-300">
                          <div className="p-3 text-center border-r border-slate-300 uppercase tracking-wide">
                            HOẠT ĐỘNG CỦA GIÁO VIÊN
                          </div>
                          <div className="p-3 text-center uppercase tracking-wide">
                            HOẠT ĐỘNG CỦA HỌC SINH
                          </div>
                        </div>

                        {/* Activities (4 hoạt động chuẩn) */}
                        <div className="divide-y divide-slate-300">
                          {period.activities.map((act) => (
                            <div key={act.activityNumber} className="space-y-0">
                              {/* Dòng tiêu đề hoạt động */}
                              <div className="bg-teal-100/60 p-2.5 font-black text-xs text-teal-950 border-b border-slate-300 flex items-center justify-between">
                                <span>{act.activityName.toUpperCase()}</span>
                                <span className="text-[10px] text-teal-700 font-bold bg-white/80 px-2 py-0.5 rounded-full border border-teal-200">
                                  Quy trình 4 bước
                                </span>
                              </div>

                              {/* Tasks bên trong */}
                              <div className="divide-y divide-slate-200">
                                {act.tasks?.map((task) => (
                                  <div key={task.taskId} className="space-y-0">
                                    {/* Task Title (in nghiêng) */}
                                    <div className="bg-slate-50 p-2 font-bold italic text-xs text-slate-800 border-b border-slate-200">
                                      {task.taskTitle}
                                    </div>

                                    {/* Steps 1 to 4 */}
                                    <div className="divide-y divide-slate-200">
                                      {task.steps?.map((step) => (
                                        <div
                                          key={step.stepNumber}
                                          className="grid grid-cols-2 text-xs divide-x divide-slate-200 hover:bg-slate-50/50 transition-colors"
                                        >
                                          <div className="p-3 space-y-1">
                                            <span className="font-bold text-teal-800 block text-[11px]">
                                              {step.stepName}:
                                            </span>
                                            <p className="text-slate-800 leading-relaxed">
                                              {step.teacherAction}
                                            </p>
                                          </div>
                                          <div className="p-3 space-y-1 bg-slate-50/30">
                                            <span className="font-bold text-slate-500 block text-[11px]">
                                              Thao tác / Phản hồi của HS:
                                            </span>
                                            <p className="text-slate-800 leading-relaxed">
                                              {step.studentAction}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 5. IV. ĐIỀU CHỈNH SAU BÀI DẠY */}
                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide bg-slate-100 p-2 rounded-xl">
                        IV. ĐIỀU CHỈNH SAU BÀI DẠY (nếu có):
                      </h4>
                      <p className="text-xs text-slate-500 italic pl-3 font-mono">
                        {period.postLessonAdjustment || '....................................................................................................'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* MODAL CÀI ĐẶT GOOGLE GEMINI API KEY */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                  <Key className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Cấu hình Google Gemini API Key
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Dành cho triển khai Vercel, Netlify hoặc dùng cá nhân
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">
                    Khi bạn đưa website lên <strong className="text-teal-900">Vercel.app</strong>, việc cấu hình <strong>API Key</strong> riêng giúp bạn soạn giáo án không giới hạn, tự động nhận diện ảnh chụp và không bị lỗi quyền truy cập.
                  </p>
                </div>
                <div className="pt-1 border-t border-teal-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-teal-800 font-semibold">
                    Chưa có API Key?
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 underline hover:no-underline"
                  >
                    <span>Lấy API Key miễn phí tại Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>Dán Gemini API Key của bạn vào đây:</span>
                  {customApiKey && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      ✓ Đã lưu
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-teal-600 focus:bg-white rounded-2xl text-xs text-slate-800 font-mono outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPassword ? 'Ẩn API Key' : 'Hiện API Key'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  * API Key được lưu an toàn trực tiếp trên trình duyệt của bạn (LocalStorage) và không bị chia sẻ.
                </p>
              </div>

              {testStatus && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-start gap-2 border ${
                    testStatus.loading
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : testStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testStatus.loading ? (
                    <RefreshCw className="w-4 h-4 text-teal-600 animate-spin shrink-0 mt-0.5" />
                  ) : testStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium leading-relaxed">
                    {testStatus.loading ? 'Đang gửi yêu cầu kiểm tra API Key tới Google...' : testStatus.message}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={testStatus?.loading || !inputKey.trim()}
                  className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus?.loading ? 'animate-spin' : ''}`} />
                  <span>Kiểm tra</span>
                </button>
                {customApiKey && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="px-3 py-2 rounded-2xl hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    Xóa Key
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(inputKey)}
                  className="px-5 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu API Key</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
