import * as XLSX from 'xlsx';
import { ExcelData, EvaluationItem } from '../model';

export const readExcelFile = (
  file: File,
  setSubject: React.Dispatch<React.SetStateAction<string>>
): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }

        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          cellStyles: true,
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const evaluations: EvaluationItem[] = [];

        const subject =
          sheet[XLSX.utils.encode_cell({ r: 0, c: 0 })]?.v?.toString();
        setSubject(() => subject);

        let currentRow = 1;
        let lastNum: string = '1';
        let lastArea: string = '';

        while (true) {
          // 행의 모든 열이 비어있는지 확인 (1~12열)
          let isEmptyRow = true;
          for (let col = 0; col < 12; col++) {
            const cellAddress = XLSX.utils.encode_cell({
              r: currentRow - 1,
              c: col,
            });
            if (sheet[cellAddress]?.v) {
              isEmptyRow = false;
              break;
            }
          }

          // 빈 행을 만나면 파일 읽기 종료
          if (isEmptyRow) {
            break;
          }

          // 필요한 데이터 읽기
          const numberCell =
            sheet[
              XLSX.utils.encode_cell({ r: currentRow - 1, c: 0 })
            ]?.v?.toString();
          const standardCell =
            sheet[
              XLSX.utils.encode_cell({ r: currentRow - 1, c: 3 })
            ]?.v?.toString();

          // 영역이 비어있으면 다음 행으로
          if (!standardCell || standardCell == '성취기준') {
            currentRow++;
            continue;
          }

          const item: EvaluationItem = {
            number: numberCell || lastNum,
            area:
              sheet[
                XLSX.utils.encode_cell({ r: currentRow - 1, c: 2 })
              ]?.v?.toString() || lastArea,
            standard: standardCell,
            element:
              sheet[
                XLSX.utils.encode_cell({ r: currentRow - 1, c: 4 })
              ]?.v?.toString() || '',
            level:
              sheet[
                XLSX.utils.encode_cell({ r: currentRow - 1, c: 5 })
              ]?.v?.toString() || '',
            result:
              sheet[
                XLSX.utils.encode_cell({ r: currentRow - 1, c: 6 })
              ]?.v?.toString() || '',
          };
          lastNum = item.number;
          lastArea = item.area;

          evaluations.push(item);
          currentRow++;
        }

        resolve({
          evaluations,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const generateExcelFile = (
  subject: string,
  evaluations: EvaluationItem[]
): void => {
  // 새로운 워크북과 시트 생성
  const newWorkbook = XLSX.utils.book_new();
  const newSheet: XLSX.WorkSheet = {};
  const sheetName = `${subject}생성결과`;

  newSheet['A1'] = { t: 's', v: '번호' };
  newSheet['B1'] = {
    t: 's',
    v: '영역',
  };
  newSheet['C1'] = { t: 's', v: '성취기준' };
  newSheet['D1'] = { t: 's', v: '평가요소' };
  newSheet['E1'] = { t: 's', v: '단계' };
  newSheet['F1'] = { t: 's', v: '생성결과' };

  // 번호, 영역, 성취기준, 평가요소, 단계, 생성결과
  const cols = [
    { wch: 10 },
    { wch: 20 },
    { wch: 40 },
    { wch: 40 },
    { wch: 10 },
    { wch: 80 },
  ];
  newSheet['!cols'] = cols;

  // 데이터 쓰기 (2행부터)
  evaluations.forEach((item, index) => {
    const row = index + 2; // 2행부터 시작

    // 각 열에 데이터 쓰기
    newSheet[XLSX.utils.encode_cell({ r: row - 1, c: 0 })] = {
      t: 's',
      v: item.number,
    };
    newSheet[XLSX.utils.encode_cell({ r: row - 1, c: 1 })] = {
      t: 's',
      v: item.area,
    };
    newSheet[XLSX.utils.encode_cell({ r: row - 1, c: 2 })] = {
      t: 's',
      v: item.standard,
    };
    newSheet[XLSX.utils.encode_cell({ r: row - 1, c: 3 })] = {
      t: 's',
      v: item.element,
    };
    newSheet[XLSX.utils.encode_cell({ r: row - 1, c: 4 })] = {
      t: 's',
      v: item.level,
    };
    newSheet[XLSX.utils.encode_cell({ r: row - 1, c: 5 })] = {
      t: 's',
      v: item.result,
    };
  });

  // 범위 설정
  const range = {
    s: { c: 0, r: 0 },
    e: { c: 5, r: evaluations.length },
  };
  newSheet['!ref'] = XLSX.utils.encode_range(range);

  // 새 시트를 워크북에 추가
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

  // 파일 다운로드
  const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${subject}생성결과.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
