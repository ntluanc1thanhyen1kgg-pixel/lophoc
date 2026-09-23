import React, { useState, useEffect } from 'react';
import { Navbar, KhdhTabId } from './Navbar';
import { DocumentPreview } from './DocumentPreview';
import { PpctManager } from './PpctManager';
import { TkbManager } from './TkbManager';
import { AiAssistantTab } from './AiAssistantTab';
import { SettingsTab } from './SettingsTab';
import { SchoolConfig, PpctItem, TimetableSlot, LessonPlanRow } from '../types';
import {
  defaultSchoolConfig,
  defaultPpctList,
  defaultTimetable
} from '../data/defaultData';

const STORAGE_KEYS = {
  CONFIG: 'khdh_school_config_v1',
  PPCT: 'khdh_ppct_list_v1',
  TIMETABLE: 'khdh_timetable_v1',
  CUSTOMIZED_WEEKS: 'khdh_customized_weeks_v1',
  ACTIVE_TAB: 'khdh_active_tab_v1'
};

export const KhdhModule: React.FC = () => {
  // 1. School config state
  const [config, setConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.documentTitle === 'KẾ HOẠCH DẠY HỌC (LỊCH BÁO GIẢNG)') {
          parsed.documentTitle = 'KẾ HOẠCH DẠY HỌC';
        }
        if (parsed.departmentName === 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO U MINH THƯỢNG') {
          parsed.departmentName = 'TỔ CHUYÊN MÔN 4+5';
        }
        if (parsed.location === 'Thạnh Yên') {
          parsed.location = 'Vĩnh Hòa';
        }
        if (parsed.principalTitle === 'HIỆU TRƯỞNG') {
          parsed.principalTitle = 'DUYỆT CỦA P.HIỆU TRƯỜNG';
        }
        if (parsed.headTeacherTitle === 'TỔ TRƯỞNG CHUYÊN MÔN') {
          parsed.headTeacherTitle = 'TỔ TRƯỞNG';
        }
        if (parsed.teacherTitle === 'GIÁO VIÊN GIẢNG DẠY') {
          parsed.teacherTitle = 'GIÁO VIÊN';
        }
        if (parsed.subjectTitle === 'MÔN: TIN HỌC & CÔNG NGHỆ') {
          parsed.subjectTitle = 'MÔN: TIN HỌC - CÔNG NGHỆ';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading khdh config:', e);
    }
    return defaultSchoolConfig;
  });

  // 2. PPCT list state
  const [ppctList, setPpctList] = useState<PpctItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PPCT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading khdh ppct:', e);
    }
    return defaultPpctList;
  });

  // 3. Timetable state
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading khdh timetable:', e);
    }
    return defaultTimetable;
  });

  // 4. Customized weeks state
  const [customizedWeeks, setCustomizedWeeks] = useState<Record<number, LessonPlanRow[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMIZED_WEEKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading khdh customized weeks:', e);
    }
    return {};
  });

  // 5. Active Tab
  const [activeTab, setActiveTab] = useState<KhdhTabId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      if (saved && ['document', 'ppct', 'tkb', 'ai', 'settings'].includes(saved)) {
        return saved as KhdhTabId;
      }
    } catch {}
    return 'document';
  });

  useEffect(() => {
    const handleCustomTabChange = (e: any) => {
      if (e.detail && ['document', 'ppct', 'tkb', 'ai', 'settings'].includes(e.detail)) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('khdh_change_tab', handleCustomTabChange);
    return () => window.removeEventListener('khdh_change_tab', handleCustomTabChange);
  }, []);

  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('khdh_tab_updated', { detail: activeTab }));
    } catch {}
  }, [activeTab]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PPCT, JSON.stringify(ppctList));
    } catch {}
  }, [ppctList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
    } catch {}
  }, [timetable]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMIZED_WEEKS, JSON.stringify(customizedWeeks));
    } catch {}
  }, [customizedWeeks]);

  const handleTabChange = (tab: KhdhTabId) => {
    setActiveTab(tab);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
    } catch {}
  };

  const handleSaveWeekRows = (weekNumber: number, rows: LessonPlanRow[]) => {
    setCustomizedWeeks((prev) => ({
      ...prev,
      [weekNumber]: rows
    }));
  };

  const handleResetWeekRows = (weekNumber: number) => {
    setCustomizedWeeks((prev) => {
      const updated = { ...prev };
      delete updated[weekNumber];
      return updated;
    });
  };

  const handleResetPpct = () => {
    setPpctList(defaultPpctList);
  };

  const handleResetTimetable = () => {
    setTimetable(defaultTimetable);
  };

  const handleResetConfig = () => {
    setConfig(defaultSchoolConfig);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        title={config.documentTitle || 'KẾ HOẠCH DẠY HỌC'}
        academicYear={config.academicYear || '2024 - 2025'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'document' && (
          <DocumentPreview
            config={config}
            ppctList={ppctList}
            timetable={timetable}
            customizedWeeks={customizedWeeks}
            onSaveWeekRows={handleSaveWeekRows}
            onResetWeekRows={handleResetWeekRows}
          />
        )}

        {activeTab === 'ppct' && (
          <PpctManager
            ppctList={ppctList}
            onUpdatePpctList={setPpctList}
            onResetPpctList={handleResetPpct}
          />
        )}

        {activeTab === 'tkb' && (
          <TkbManager
            timetable={timetable}
            onUpdateTimetable={setTimetable}
            onResetTimetable={handleResetTimetable}
          />
        )}

        {activeTab === 'ai' && <AiAssistantTab />}

        {activeTab === 'settings' && (
          <SettingsTab
            config={config}
            onUpdateConfig={setConfig}
            onResetConfig={handleResetConfig}
          />
        )}
      </main>
    </div>
  );
};
