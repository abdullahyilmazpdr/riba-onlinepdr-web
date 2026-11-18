import ExcelJS from 'exceljs';
import { RIBA_LEVELS, RibaLevel } from './riba-data';
import { ClassRibaResult, SchoolLevelResult } from './riba-scoring';

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E293B' },
};

const PRIORITY_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFEE2E2' },
};

const SUBHEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE2E8F0' },
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
};

export async function generateClassResultWorkbook(params: {
  schoolName: string;
  academicYear: string;
  classResult: ClassRibaResult;
}): Promise<Buffer> {
  const { schoolName, academicYear, classResult } = params;
  const levelSpec = RIBA_LEVELS[classResult.level];
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'riba.onlinepdr.com MEB RİBA Otomasyonu';

  const ws = workbook.addWorksheet('Sınıf Sonuç Çizelgesi');
  const isPreschool = classResult.level === 'okuloncesi';

  ws.mergeCells('A1:J1');
  ws.getCell('A1').value = `${schoolName} — ${classResult.className} (${levelSpec.name} RİBA Sınıf Sonuç Çizelgesi - ${academicYear})`;
  ws.getCell('A1').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  ws.getCell('A1').fill = HEADER_FILL;
  ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(1).height = 28;

  ws.mergeCells('A2:J2');
  ws.getCell('A2').value = isPreschool
    ? `Katılımcı Sayısı — Veli: ${classResult.counts.veli} | Öğretmen: ${classResult.counts.ogretmenEffective}`
    : `Katılımcı Sayısı — Öğrenci: ${classResult.counts.ogrenci}${!classResult.studentEligible ? ' (1.-2. sınıf öğrenci formu uygulanmaz)' : ''} | Veli: ${classResult.counts.veli} | Öğretmen: ${classResult.counts.ogretmenEffective}`;
  ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF334155' } };
  ws.getRow(2).height = 20;

  const headers = isPreschool
    ? ['RS', 'Hedef Alanı', 'Veli (f)', 'Öğretmen (f)', 'Zpa', 'Zte', 'ASP', 'Öncelik Sırası']
    : ['RS', 'Hedef Alanı', 'Öğrenci (f)', 'Veli (f)', 'Öğretmen (f)', 'Zst', 'Zpa', 'Zte', 'ASP', 'Öncelik Sırası'];

  const hdrRow = ws.getRow(3);
  headers.forEach((h, i) => {
    const cell = hdrRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
    cell.fill = SUBHEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { vertical: 'middle', horizontal: i === 1 ? 'left' : 'center', wrapText: true };
  });
  hdrRow.height = 24;

  classResult.rows.forEach((r, idx) => {
    const row = ws.getRow(4 + idx);
    const values = isPreschool
      ? [
          r.targetId,
          r.title,
          r.freqParent,
          r.freqTeacher,
          r.zParent !== null ? Number(r.zParent.toFixed(2)) : '-',
          r.zTeacher !== null ? Number(r.zTeacher.toFixed(2)) : '-',
          Number(r.asp.toFixed(2)),
          r.rank || '-',
        ]
      : [
          r.targetId,
          r.title,
          r.freqStudent,
          r.freqParent,
          r.freqTeacher,
          r.zStudent !== null ? Number(r.zStudent.toFixed(2)) : '-',
          r.zParent !== null ? Number(r.zParent.toFixed(2)) : '-',
          r.zTeacher !== null ? Number(r.zTeacher.toFixed(2)) : '-',
          Number(r.asp.toFixed(2)),
          r.rank || '-',
        ];

    const isTop = r.rank > 0 && r.rank <= 3;
    values.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.border = THIN_BORDER;
      cell.font = { size: 10, bold: isTop || colIdx === values.length - 2 };
      if (isTop) {
        cell.fill = PRIORITY_FILL;
        if (colIdx >= values.length - 2) {
          cell.font = { size: 10, bold: true, color: { argb: 'FFB91C1C' } };
        }
      }
      cell.alignment = { vertical: 'middle', horizontal: colIdx === 1 ? 'left' : 'center' };
    });
    row.height = 20;
  });

  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 48;
  for (let c = 3; c <= headers.length; c++) {
    ws.getColumn(c).width = 13;
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export async function generateSchoolResultWorkbook(params: {
  schoolName: string;
  academicYear: string;
  level: RibaLevel;
  schoolResult: SchoolLevelResult;
  specialTargets?: [string, string];
}): Promise<Buffer> {
  const { schoolName, academicYear, schoolResult, specialTargets } = params;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'riba.onlinepdr.com MEB RİBA Otomasyonu';

  const ws = workbook.addWorksheet('Sonuç');
  const classCols = schoolResult.participatingClasses;
  const totalCols = 2 + classCols.length + 2; // RS, HEDEFLER, classes..., Ortalama ASP, Sırası

  ws.mergeCells(1, 1, 1, Math.max(6, totalCols));
  ws.getCell(1, 1).value = `${schoolName} — ${schoolResult.levelName} RİBA Okul Sonuç Çizelgesi (${academicYear})`;
  ws.getCell(1, 1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  ws.getCell(1, 1).fill = HEADER_FILL;
  ws.getCell(1, 1).alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(1).height = 28;

  const headers = [
    'RS',
    'HEDEFLER',
    ...classCols.map((c) => c.className),
    'Ortalama ASP',
    'Öncelik Sırası',
  ];

  const hdrRow = ws.getRow(2);
  headers.forEach((h, i) => {
    const cell = hdrRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
    cell.fill = SUBHEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { vertical: 'middle', horizontal: i === 1 ? 'left' : 'center', wrapText: true };
  });
  hdrRow.height = 28;

  schoolResult.targets.forEach((t, idx) => {
    const row = ws.getRow(3 + idx);
    const values: (string | number)[] = [
      t.targetId,
      t.title,
      ...classCols.map((c) => Number((t.classAsps[c.classKey] ?? 0).toFixed(2))),
      Number(t.averageAsp.toFixed(2)),
      t.rank || '-',
    ];

    values.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.border = THIN_BORDER;
      cell.font = {
        size: 10,
        bold: t.isTopPriority || colIdx >= values.length - 2,
        color: t.isTopPriority && colIdx >= values.length - 2 ? { argb: 'FFB91C1C' } : undefined,
      };
      if (t.isTopPriority) {
        cell.fill = PRIORITY_FILL;
      }
      cell.alignment = { vertical: 'middle', horizontal: colIdx === 1 ? 'left' : 'center' };
    });
    row.height = 20;
  });

  // Özel Hedefler Alt Tablosu (Resmi MEB Okul Sonuç Çizelgesi uyumlu)
  const spStartRow = 3 + schoolResult.targets.length + 2;
  ws.mergeCells(spStartRow, 1, spStartRow, Math.max(4, totalCols));
  ws.getCell(spStartRow, 1).value = 'OKULUN RİBA SONUÇLARINA GÖRE BELİRLENEN ÖZEL HEDEFLERİ';
  ws.getCell(spStartRow, 1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  ws.getCell(spStartRow, 1).fill = HEADER_FILL;
  ws.getRow(spStartRow).height = 24;

  const h1 = specialTargets?.[0] || '';
  const h2 = specialTargets?.[1] || '';
  [
    ['1. Özel Hedef:', h1],
    ['2. Özel Hedef:', h2],
  ].forEach(([lbl, val], i) => {
    const r = ws.getRow(spStartRow + 1 + i);
    r.getCell(1).value = lbl;
    r.getCell(1).font = { bold: true };
    ws.mergeCells(spStartRow + 1 + i, 2, spStartRow + 1 + i, Math.max(4, totalCols));
    r.getCell(2).value = val || '(Henüz belirlenmedi)';
    r.height = 22;
  });

  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 48;
  for (let c = 3; c <= headers.length; c++) {
    ws.getColumn(c).width = 16;
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}
