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
                size: 20,
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
                    size: 20,
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
                    size: 20,
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
                    size: 20,
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
                    size: 20,
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
                  size: 20,
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
                  size: 20,
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
              size: 20,
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
              size: 20,
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
              size: 20,
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
              size: 20,
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
              size: 20,
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
                    size: 20,
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
                    size: 20,
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
                    size: 20,
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
                    size: 20,
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
                    size: 20,
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
                    size: 20,
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
                    size: 20,
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
                size: 26,
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
                size: 22,
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
                size: 22,
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
