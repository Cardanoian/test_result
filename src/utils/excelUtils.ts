import * as XLSX from "xlsx";
import { ExcelData, EvaluationItem } from "../types";

export const readExcelFile = (
  file: File
): Promise<[ExcelData, XLSX.WorkBook]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file");
        }

        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
          cellStyles: true,
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const evaluations: EvaluationItem[] = [];
        let currentRow: number = 1;
        let lastNum: string = "1";
        let lastArea: string = "";

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
          if (!standardCell || standardCell == "성취기준") {
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
              ]?.v?.toString() || "",
            level:
              sheet[
                XLSX.utils.encode_cell({ r: currentRow - 1, c: 5 })
              ]?.v?.toString() || "",
            result:
              sheet[
                XLSX.utils.encode_cell({ r: currentRow - 1, c: 6 })
              ]?.v?.toString() || "",
          };
          lastNum = item.number;
          lastArea = item.standard;
          evaluations.push(item);
          currentRow++;
        }

        resolve([
          {
            evaluations,
          },
          workbook,
        ]);
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
  workbook: XLSX.WorkBook,
  evaluations: EvaluationItem[]
): void => {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // 결과를 시트에 쓰기
  evaluations.forEach((item, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: index + 1, c: 6 }); // G열 (결과)

    if (!sheet[cellAddress]) {
      sheet[cellAddress] = { t: "s", v: "" };
    }
    sheet[cellAddress].v = item.result;
  });

  // 파일 다운로드
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${subject}생성결과.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
