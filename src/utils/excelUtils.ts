import * as XLSX from 'xlsx';
import { ExcelData, EvaluationItem } from '../types';

export const readExcelFile = (
	file: File
): Promise<[ExcelData, XLSX.WorkBook]> => {
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

				// 과목명 읽기 (A1 셀)
				const subject: string = sheet['A1']?.v?.toString().trim() || '';

				const evaluations: EvaluationItem[] = [];
				let currentRow: number = 4;
				let lastNumber: string = '';

				while (true) {
					// 11개 행을 읽기
					for (let i = 0; i < 11; i++) {
						const row = currentRow + i;
						const number =
							sheet[
								XLSX.utils.encode_cell({ r: row - 1, c: 0 })
							]?.v?.toString() || lastNumber;
						const area =
							sheet[
								XLSX.utils.encode_cell({ r: row - 1, c: 2 })
							]?.v?.toString();

						// area가 없으면 더 이상 데이터가 없는 것으로 간주
						if (!area) {
							// 데이터가 없는 경우 while 루프 종료를 위해 break
							currentRow = Infinity;
							break;
						}

						lastNumber = number;

						const item: EvaluationItem = {
							number,
							area,
							standard:
								sheet[
									XLSX.utils.encode_cell({ r: row - 1, c: 3 })
								]?.v?.toString() || '',
							element:
								sheet[
									XLSX.utils.encode_cell({ r: row - 1, c: 4 })
								]?.v?.toString() || '',
							level:
								sheet[
									XLSX.utils.encode_cell({ r: row - 1, c: 5 })
								]?.v?.toString() || '',
							result:
								sheet[
									XLSX.utils.encode_cell({ r: row - 1, c: 6 })
								]?.v?.toString() || '',
						};

						evaluations.push(item);
					}

					// while 루프 종료 조건
					if (currentRow === Infinity) {
						break;
					}

					// 다음 섹션으로 이동 (11개 읽고 3개 스킵)
					currentRow += 14;
				}

				resolve([
					{
						subject,
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
		const rowIndex = Math.floor(index / 11) * 14 + (index % 11) + 4;
		const cellAddress = XLSX.utils.encode_cell({ r: rowIndex - 1, c: 6 }); // G열 (결과)

		if (!sheet[cellAddress]) {
			sheet[cellAddress] = { t: 's', v: '' };
		}
		sheet[cellAddress].v = item.result;
	});

	// 파일 다운로드
	const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

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
