import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
  VerticalMergeType
} from 'docx';
import { saveAs } from 'file-saver';
import { SchoolConfig, LessonPlanRow } from '../types';
import { getDayOfWeekName } from './dateUtils';

export async function exportLessonPlanToDocx(
  config: SchoolConfig,
  weekNumber: number,
  startDate: string,
  endDate: string,
  rows: LessonPlanRow[]
): Promise<void> {
  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  };

  const tableHeaderCell = (text: string, widthPercent: number) => {
    const lines = text.split('\n');
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: lines.map(
        (line) =>
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: line,
                bold: true,
                size: 26, // Cỡ chữ 13pt
                font: 'Times New Roman'
              })
            ]
          })
      )
    });
  };

  // Header Table (School name & Department on left, Republic Title on right)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderNone,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (config.schoolName || 'TRƯỜNG TIỂU HỌC THẠNH YÊN 1').toUpperCase(),
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (config.departmentName || 'TỔ CHUYÊN MÔN 4+5').toUpperCase(),
                    bold: true,
                    underline: {},
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (config.republicTitleTop || 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM').toUpperCase(),
                    bold: true,
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: config.republicTitleSub || 'Độc lập – Tự do – Hạnh phúc',
                    bold: true,
                    underline: {},
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Sort rows consistently by dayOfWeek, session, and period
  const sortedRows = [...rows].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    const sessionOrder = (s: string) => (s === 'Sáng' || s === 'morning' ? 1 : 2);
    if (sessionOrder(a.session) !== sessionOrder(b.session)) {
      return sessionOrder(a.session) - sessionOrder(b.session);
    }
    return a.period - b.period;
  });

  // Main table header matching the attached PDF
  const tableRows: TableRow[] = [
    new TableRow({
      children: [
        tableHeaderCell('THỨ', 9),
        tableHeaderCell('BUỔI', 9),
        tableHeaderCell('TIẾT', 7),
        tableHeaderCell('LỚP', 9),
        tableHeaderCell('MÔN', 13),
        tableHeaderCell('TÊN BÀI DẠY', 33),
        tableHeaderCell('ĐIỀU CHỈNH/\nTÍCH HỢP', 20)
      ]
    })
  ];

  // Populate data rows with vertical merges for Day and Session
  sortedRows.forEach((row, idx) => {
    const isFirstOfDay = idx === 0 || row.dayOfWeek !== sortedRows[idx - 1].dayOfWeek;
    const isFirstOfSession = isFirstOfDay || row.session !== sortedRows[idx - 1].session;

    const dayCell = new TableCell({
      width: { size: 9, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      verticalMerge: isFirstOfDay ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
      children: isFirstOfDay
        ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: getDayOfWeekName(row.dayOfWeek),
                  bold: true,
                  size: 26, // Cỡ chữ 13pt
                  font: 'Times New Roman'
                })
              ]
            })
          ]
        : []
    });

    const sessionCell = new TableCell({
      width: { size: 9, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      verticalMerge: isFirstOfSession ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
      children: isFirstOfSession
        ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: row.session,
                  bold: true,
                  size: 26, // Cỡ chữ 13pt
                  font: 'Times New Roman'
                })
              ]
            })
          ]
        : []
    });

    const periodCell = new TableCell({
      width: { size: 7, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: String(row.period),
              bold: true,
              size: 26, // Cỡ chữ 13pt
              font: 'Times New Roman'
            })
          ]
        })
      ]
    });

    const classCell = new TableCell({
      width: { size: 9, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: row.className || '',
              bold: true,
              size: 26, // Cỡ chữ 13pt
              font: 'Times New Roman'
            })
          ]
        })
      ]
    });

    const subjectCell = new TableCell({
      width: { size: 13, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: row.subject || '',
              size: 26, // Cỡ chữ 13pt
              font: 'Times New Roman'
            })
          ]
        })
      ]
    });

    const lessonCell = new TableCell({
      width: { size: 33, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({
              text: row.lessonName || '',
              size: 26, // Cỡ chữ 13pt
              font: 'Times New Roman'
            })
          ]
        })
      ]
    });

    const integrationCell = new TableCell({
      width: { size: 20, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({
              text: row.integrationNote || '',
              size: 26, // Cỡ chữ 13pt
              font: 'Times New Roman'
            })
          ]
        })
      ]
    });

    tableRows.push(
      new TableRow({
        children: [
          dayCell,
          sessionCell,
          periodCell,
          classCell,
          subjectCell,
          lessonCell,
          integrationCell
        ]
      })
    );
  });

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });

  // Footer Signatures matching attached PDF:
  // Date on right, then 3 columns: DUYỆT CỦA P.HIỆU TRƯỜNG | TỔ TRƯỞNG | GIÁO VIÊN
  const footerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderNone,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 66, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [new Paragraph({ text: '' })]
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${config.location || 'Vĩnh Hòa'}, ngày ... tháng ... năm ...`,
                    italics: true,
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (config.principalTitle || 'DUYỆT CỦA P.HIỆU TRƯỜNG').toUpperCase(),
                    bold: true,
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({ text: '\n\n\n\n' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: config.principalName || '',
                    bold: true,
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (config.headTeacherTitle || 'TỔ TRƯỞNG').toUpperCase(),
                    bold: true,
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({ text: '\n\n\n\n' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: config.headTeacherName || '',
                    bold: true,
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (config.teacherTitle || 'GIÁO VIÊN').toUpperCase(),
                    bold: true,
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({ text: '\n\n\n\n' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: config.teacherName || '',
                    bold: true,
                    size: 26, // Cỡ chữ 13pt
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 1000,
              right: 720
            }
          }
        },
        children: [
          headerTable,
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: (config.documentTitle || 'KẾ HOẠCH DẠY HỌC').toUpperCase(),
                bold: true,
                size: 28, // Cỡ chữ 14pt
                font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: (config.subjectTitle || 'MÔN: TIN HỌC - CÔNG NGHỆ').toUpperCase(),
                bold: true,
                size: 26, // Cỡ chữ 13pt
                font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Tuần ${weekNumber} thực hiện từ ngày ${startDate} đến ngày ${endDate}`,
                italics: true,
                size: 26, // Cỡ chữ 13pt
                font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({ text: '' }),
          mainTable,
          new Paragraph({ text: '' }),
          footerTable
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `KHDH_Tuan_${weekNumber}_${(config.teacherName || 'GV').replace(/\s+/g, '_')}.docx`;
  saveAs(blob, fileName);
}

/**
 * Xuất Kế hoạch bài dạy (Giáo án) chi tiết ra file Word (.docx)
 * Bảng 2 cột chuẩn Bộ GD&ĐT: Hoạt động của Giáo viên & Hoạt động của Học sinh
 */
export async function exportDetailedLessonPlanToDocx(
  plan: import('../types').DetailedLessonPlan,
  selectedPeriodIndex?: number,
  config?: SchoolConfig
): Promise<void> {
  const periodsToExport = selectedPeriodIndex
    ? plan.periodPlans.filter((p) => p.periodIndex === selectedPeriodIndex)
    : plan.periodPlans;

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  };

  const docChildren: (Paragraph | Table)[] = [];

  // Main Title (Kế hoạch bài dạy bắt đầu trực tiếp không kèm Quốc hiệu / Tên trường)
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'KẾ HOẠCH BÀI DẠY',
          bold: true,
          size: 28,
          font: 'Times New Roman'
        })
      ]
    })
  );

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `MÔN: ${plan.subject.toUpperCase()} - LỚP ${plan.grade}`,
          bold: true,
          size: 24,
          font: 'Times New Roman'
        })
      ]
    })
  );

  docChildren.push(new Paragraph({ text: '' }));

  for (let idx = 0; idx < periodsToExport.length; idx++) {
    const period = periodsToExport[idx];

    if (idx > 0) {
      docChildren.push(new Paragraph({ text: '' }));
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '----------------------------------------------------------------------------------------------------',
              color: '888888',
              font: 'Times New Roman'
            })
          ]
        })
      );
      docChildren.push(new Paragraph({ text: '' }));
    }

    // Tiêu đề chuẩn theo prompt
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: period.header.title.toUpperCase(),
            bold: true,
            size: 24,
            font: 'Times New Roman'
          })
        ]
      })
    );

    if (period.header.timeRange) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Thời gian thực hiện: ${period.header.timeRange}`,
              italics: true,
              size: 20,
              font: 'Times New Roman'
            })
          ]
        })
      );
    }

    docChildren.push(new Paragraph({ text: '' }));

    // I. YÊU CẦU CẦN ĐẠT
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `I. YÊU CẦU CẦN ĐẠT (Cho Tiết ${period.periodIndex}):`,
            bold: true,
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );

    // 1. Năng lực đặc thù
    docChildren.push(
      new Paragraph({
        indent: { left: 360 },
        children: [
          new TextRun({
            text: '1. Năng lực đặc thù:',
            bold: true,
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );
    period.objectives.specificCompetencies?.forEach((item) => {
      docChildren.push(
        new Paragraph({
          indent: { left: 720 },
          children: [
            new TextRun({
              text: `- ${item}`,
              size: 22,
              font: 'Times New Roman'
            })
          ]
        })
      );
    });

    // 2. Năng lực chung
    docChildren.push(
      new Paragraph({
        indent: { left: 360 },
        children: [
          new TextRun({
            text: '2. Năng lực chung:',
            bold: true,
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );
    period.objectives.generalCompetencies?.forEach((item) => {
      docChildren.push(
        new Paragraph({
          indent: { left: 720 },
          children: [
            new TextRun({
              text: `- ${item}`,
              size: 22,
              font: 'Times New Roman'
            })
          ]
        })
      );
    });

    // 3. Phẩm chất
    docChildren.push(
      new Paragraph({
        indent: { left: 360 },
        children: [
          new TextRun({
            text: '3. Phẩm chất:',
            bold: true,
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );
    period.objectives.qualities?.forEach((item) => {
      docChildren.push(
        new Paragraph({
          indent: { left: 720 },
          children: [
            new TextRun({
              text: `- ${item}`,
              size: 22,
              font: 'Times New Roman'
            })
          ]
        })
      );
    });

    // 4. Nội dung tích hợp
    if (period.objectives.integrationContent && period.objectives.integrationContent.length > 0) {
      docChildren.push(
        new Paragraph({
          indent: { left: 360 },
          children: [
            new TextRun({
              text: '4. Nội dung tích hợp (NLS CV 3456, STEM CV 909, Công dân số CV 3899):',
              bold: true,
              size: 22,
              font: 'Times New Roman'
            })
          ]
        })
      );
      period.objectives.integrationContent.forEach((item) => {
        docChildren.push(
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `- ${item}`,
                size: 22,
                font: 'Times New Roman'
              })
            ]
          })
        );
      });
    }

    docChildren.push(new Paragraph({ text: '' }));

    // II. ĐỒ DÙNG DẠY HỌC
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `II. ĐỒ DÙNG DẠY HỌC (Cho Tiết ${period.periodIndex}):`,
            bold: true,
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );
    docChildren.push(
      new Paragraph({
        indent: { left: 360 },
        children: [
          new TextRun({
            text: '1. Giáo viên: ',
            bold: true,
            size: 22,
            font: 'Times New Roman'
          }),
          new TextRun({
            text: period.teachingTools.teacher.join(', '),
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );
    docChildren.push(
      new Paragraph({
        indent: { left: 360 },
        children: [
          new TextRun({
            text: '2. Học sinh: ',
            bold: true,
            size: 22,
            font: 'Times New Roman'
          }),
          new TextRun({
            text: period.teachingTools.student.join(', '),
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );

    docChildren.push(new Paragraph({ text: '' }));

    // III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:',
            bold: true,
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );

    // Chuẩn bảng 2 cột: Hoạt động của Giáo viên & Hoạt động của Học sinh
    const tableBorder = {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' }
    };

    const activityTableRows: TableRow[] = [];

    // Header Row của bảng 2 cột
    activityTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            shading: { fill: 'F2F4F7' },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'HOẠT ĐỘNG CỦA GIÁO VIÊN',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            shading: { fill: 'F2F4F7' },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'HOẠT ĐỘNG CỦA HỌC SINH',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    // Render 4 hoạt động và các nhiệm vụ
    period.activities.forEach((act) => {
      // Dòng tiêu đề Hoạt động (Khởi động / Khám phá / Luyện tập / Vận dụng)
      activityTableRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              columnSpan: 2,
              borders: tableBorder,
              shading: { fill: 'EAEAEA' },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: act.activityName.toUpperCase(),
                      bold: true,
                      size: 22,
                      font: 'Times New Roman'
                    }),
                    ...(act.integrationNote
                      ? [
                          new TextRun({
                            text: `\n✦ ${act.integrationNote}`,
                            bold: true,
                            italics: true,
                            size: 20,
                            font: 'Times New Roman'
                          })
                        ]
                      : [])
                  ]
                })
              ]
            })
          ]
        })
      );

      // Render từng Task trong Activity
      act.tasks?.forEach((task) => {
        // Dòng Tiêu đề Task in nghiêng (vd: * Nhiệm vụ 1: ...)
        activityTableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnSpan: 2,
                borders: tableBorder,
                shading: { fill: 'F9FAFB' },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: task.taskTitle,
                        bold: true,
                        italics: true,
                        size: 21,
                        font: 'Times New Roman'
                      }),
                      ...(task.integrationNote
                        ? [
                            new TextRun({
                              text: `  [${task.integrationNote}]`,
                              bold: true,
                              italics: true,
                              size: 19,
                              font: 'Times New Roman'
                            })
                          ]
                        : [])
                    ]
                  })
                ]
              })
            ]
          })
        );

        // Các bước trong Task (Bước 1 -> Bước 4)
        task.steps?.forEach((step) => {
          activityTableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: tableBorder,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${step.stepName}: `,
                          bold: true,
                          size: 20,
                          font: 'Times New Roman'
                        }),
                        new TextRun({
                          text: step.teacherAction,
                          size: 20,
                          font: 'Times New Roman'
                        })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: tableBorder,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: step.studentAction,
                          size: 20,
                          font: 'Times New Roman'
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          );
        });
      });
    });

    const activityTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorder,
      rows: activityTableRows
    });

    docChildren.push(activityTable);
    docChildren.push(new Paragraph({ text: '' }));

    // IV. ĐIỀU CHỈNH SAU BÀI DẠY
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'IV. ĐIỀU CHỈNH SAU BÀI DẠY (nếu có):',
            bold: true,
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );
    docChildren.push(
      new Paragraph({
        indent: { left: 360 },
        children: [
          new TextRun({
            text: period.postLessonAdjustment || '....................................................................................................',
            size: 22,
            font: 'Times New Roman'
          })
        ]
      })
    );

    docChildren.push(new Paragraph({ text: '' }));
  }

  // Footer Ký tên
  const footerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderNone,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'TỔ TRƯỞNG CHUYÊN MÔN',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký, ghi rõ họ tên)',
                    italics: true,
                    size: 20,
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: config?.headTeacherName || '',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${config?.location || 'Thạnh Yên'}, ngày ... tháng ... năm ...`,
                    italics: true,
                    size: 20,
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'GIÁO VIÊN SOẠN BÀI',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký, ghi rõ họ tên)',
                    italics: true,
                    size: 20,
                    font: 'Times New Roman'
                  })
                ]
              }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: config?.teacherName || 'Nguyễn Tấn Luận',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  docChildren.push(footerTable);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~2cm
              bottom: 1134,
              left: 1417, // ~2.5cm
              right: 1134 // ~2cm
            }
          }
        },
        children: docChildren
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (plan.topic || 'Giao_An').replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_');
  const fileName = `Giao_An_${plan.subject}_Lop_${plan.grade}_${cleanTitle}.docx`;
  saveAs(blob, fileName);
}

