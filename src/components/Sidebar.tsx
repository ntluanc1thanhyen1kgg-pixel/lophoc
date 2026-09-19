import React from 'react';
import {
  Home,
  School,
  GraduationCap,
  ClipboardCheck,
  LayoutGrid,
  CalendarDays,
  Gift,
  Sparkles,
  Film,
  VolumeX,
  Timer,
  Link as LinkIcon,
  BarChart3,
  Database,
  Settings,
  BookOpen,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';
import { UserAccount } from '../types';
import { Avatar } from './Avatar';
import { compressImageFile } from '../utils/helpers';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  studentCount: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  systemLogo?: string;
  onUpdateLogo?: (logo: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  studentCount,
  isOpen,
  onClose,
  onOpenGuide,
  currentUser,
  onLogout,
  systemLogo,
  onUpdateLogo
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    if (isAdmin && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateLogo) {
      try {
        // Compress to 400px max dimension, 0.7 quality to stay well under 1MB limit
        const compressed = await compressImageFile(file, 400, 0.7);
        onUpdateLogo(compressed);
      } catch (err) {
        console.error('Error compressing logo image:', err);
      }
    }
  };

  const navItems = isAdmin
    ? [
        { id: 'accounts', label: 'Quản trị TK', icon: ShieldCheck, badge: 'ADMIN' },
        { id: 'home', label: 'Tổng quan hệ thống', icon: Home, badge: '' },
        { id: 'data', label: 'Dữ liệu hệ thống', icon: Database, badge: '' },
        { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings, badge: '' }
      ]
    : [
        { id: 'home', label: 'Trang chủ', icon: Home, badge: '' },
        { id: 'classes', label: 'Lớp học', icon: School, badge: '' },
        { id: 'students', label: 'Học sinh', icon: GraduationCap, badge: `${studentCount}` },
        { id: 'attendance', label: 'Điểm danh', icon: ClipboardCheck, badge: '' },
        { id: 'seating', label: 'Sơ đồ lớp', icon: LayoutGrid, badge: '' },
        { id: 'timetable', label: 'Thời khóa biểu', icon: CalendarDays, badge: '' },
        { id: 'rewards', label: 'Đổi quà', icon: Gift, badge: 'HOT' },
        { id: 'wheel', label: 'Vòng quay', icon: Sparkles, badge: 'HOT' },
        { id: 'film', label: 'Cuộn phim', icon: Film, badge: 'NEW' },
        { id: 'noise', label: 'Chống ồn', icon: VolumeX, badge: '' },
        { id: 'countdown', label: 'Đếm ngược', icon: Timer, badge: '' },
        { id: 'links', label: 'Liên kết', icon: LinkIcon, badge: '' },
        { id: 'stats', label: 'Thống kê', icon: BarChart3, badge: '' },
        { id: 'data', label: 'Dữ liệu', icon: Database, badge: '' },
        { id: 'settings', label: 'Cài đặt', icon: Settings, badge: '' }
      ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-3.5 left-0 lg:left-3.5 bottom-0 lg:bottom-3.5 z-50 w-[260px] flex-shrink-0 bg-white/95 backdrop-blur-md border-r lg:border-2 border-teal-200/90 lg:rounded-3xl shadow-xl shadow-teal-900/10 p-3.5 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-full lg:max-h-[calc(100vh-28px)]`}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div 
                onClick={handleLogoClick}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white bg-gradient-to-br from-teal-700 via-teal-600 to-teal-400 shadow-md shadow-teal-700/20 border-2 border-white text-base tracking-tight overflow-hidden ${isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all' : ''}`}
                title={isAdmin ? 'Nhấn để thay đổi logo trường' : undefined}
              >
                {systemLogo ? (
                  <img src={systemLogo} alt="School Logo" className="w-full h-full object-cover" />
                ) : (
                  'TY1'
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div>
                <h2 className="font-extrabold text-teal-800 text-[15px] leading-tight tracking-tight">
                  LỚP HỌC VUI NHỘN
                </h2>
                <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                  Bảng điều khiển giáo viên
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 lg:hidden"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="space-y-0.5 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-[13.5px] transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-600/25'
                      : 'text-slate-700 hover:bg-teal-50/80 hover:text-teal-800 hover:translate-x-0.5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : item.badge === 'HOT'
                          ? 'bg-rose-100 text-rose-600'
                          : item.badge === 'NEW'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions & User Profile */}
        <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
          {/* Privacy badge */}
          <div className="px-2.5 py-1.5 rounded-xl bg-teal-50/90 border border-teal-200/70 text-[10px] text-teal-800 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">
              {isAdmin ? 'Quản trị hệ thống · Bảo mật phân quyền' : 'Không gian riêng tư · Độc lập 100%'}
            </span>
          </div>

          {currentUser && (
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
                <div className="min-w-0">
                  <span className="block text-xs font-black text-slate-800 truncate">
                    {currentUser.name}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Giáo Viên'}
                  </span>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={onOpenGuide}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Xem hướng dẫn</span>
          </button>
        </div>
      </aside>
    </>
  );
};
