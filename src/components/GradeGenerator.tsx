import React, { useState } from 'react';
import Card from './Card';
import { CallGpt } from '../utils/gptUtils';
import { readExcelFile, generateExcelFile } from '../utils/excelUtils';
import { EvaluationItem } from '../types';
import styles from './GradeGenerator.module.css';
import * as XLSX from 'xlsx';
import { openUserGuide } from './UserGuide';

const GradeGenerator: React.FC = () => {
  const [subject, setSubject] = useState<string>('');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // 직접 입력용 상태
  const [inputNumber, setInputNumber] = useState('');
  const [inputArea, setInputArea] = useState('');
  const [inputStandard, setInputStandard] = useState('');
  const [inputElement, setInputElement] = useState('');
  const [inputLevel, setInputLevel] = useState('');

  // 직접 입력 추가 핸들러
  const handleAddEvaluation = () => {
    if (
      !inputNumber ||
      !inputArea ||
      !inputStandard ||
      !inputElement ||
      !inputLevel
    ) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    const newItem: EvaluationItem = {
      number: inputNumber,
      area: inputArea,
      standard: inputStandard,
      element: inputElement,
      level: inputLevel,
      result: '', // 직접 입력 시 result는 비워둠
    };
    setEvaluations([...evaluations, newItem]);
    setInputNumber('');
    setInputArea('');
    setInputStandard('');
    setInputElement('');
    setInputLevel('');
  };

  // 행 삭제 핸들러
  const handleDeleteEvaluation = (index: number) => {
    setEvaluations(evaluations.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const [data, wb] = await readExcelFile(file, setSubject);
        setEvaluations(data.evaluations);
        setWorkbook(wb);
      } catch (error) {
        console.error('엑셀 파일 처리 중 오류 발생:', error);
        alert('파일 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || evaluations.length === 0 || !workbook) {
      alert('과목명과 엑셀 파일을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const updatedEvaluations = [...evaluations];
    const totalItems = evaluations.length;

    try {
      for (let i = 0; i < evaluations.length; i++) {
        const item = evaluations[i];
        const result = await CallGpt(subject, item);
        updatedEvaluations[i] = { ...item, result };
        setProgress(Math.round(((i + 1) / totalItems) * 100));
        setEvaluations([...updatedEvaluations]);
      }

      generateExcelFile(subject, workbook, updatedEvaluations);
    } catch (error) {
      console.error('평가 생성 중 오류 발생:', error);
      alert('평가 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // const openUserGuide = () => {
  // window.open(
  //   'https://raw.githubusercontent.com/Cardanoian/test_result/refs/heads/main/README.jpeg',
  //   '_blank'
  // );
  // };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>학기말 성적 생성기</h1>

        <div className={styles.inputContainer}>
          <div className={styles.inputGroup}>
            <span className={styles.label}>과목</span>
            <input
              type='text'
              value={subject}
              onChange={(e) => setSubject(e.target.value.trim())}
              className={styles.subjectInput}
              placeholder='과목명'
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.label}>엑셀 파일</span>
            <input
              type='file'
              accept='.xlsx, .xls'
              onChange={handleFileUpload}
              className={styles.fileInput}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSubmit}
            className={styles.button}
            disabled={!subject || evaluations.length === 0 || isLoading}
          >
            {isLoading ? `처리 중... ${progress}%` : '생성하기'}
          </button>

          <button
            onClick={openUserGuide}
            className={styles.guideButton}
            disabled={isLoading}
          >
            사용방법
          </button>
        </div>

        {/* 직접 입력 폼 */}
        <div
          className={styles.inputContainer}
          style={{
            marginTop: '16px',
            background: '#f9f9f9',
            padding: '12px',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <input
              type='text'
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              placeholder='번호'
              className={styles.subjectInput}
              disabled={isLoading}
            />
            <input
              type='text'
              value={inputArea}
              onChange={(e) => setInputArea(e.target.value)}
              placeholder='영역'
              className={styles.subjectInput}
              disabled={isLoading}
            />
            <input
              type='text'
              value={inputStandard}
              onChange={(e) => setInputStandard(e.target.value)}
              placeholder='성취기준'
              className={styles.subjectInput}
              disabled={isLoading}
            />
            <input
              type='text'
              value={inputElement}
              onChange={(e) => setInputElement(e.target.value)}
              placeholder='평가요소'
              className={styles.subjectInput}
              disabled={isLoading}
            />
            <input
              type='text'
              value={inputLevel}
              onChange={(e) => setInputLevel(e.target.value)}
              placeholder='단계'
              className={styles.subjectInput}
              disabled={isLoading}
            />
            <button
              onClick={handleAddEvaluation}
              className={styles.button}
              style={{ minWidth: 80 }}
              disabled={isLoading}
              type='button'
            >
              추가
            </button>
          </div>
        </div>

        {
          <div className={styles.dataSection}>
            <h2 className={styles.sectionTitle}>성적 데이터</h2>
            <Card className='p-4 bg-white mb-4'>
              <div className={styles.dataList}>
                <table className={styles.evaluationTable}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', width: 40 }}>삭제</th>
                      <th style={{ textAlign: 'center', width: 50 }}>번호</th>
                      <th style={{ textAlign: 'center', width: 70 }}>영역</th>
                      <th style={{ textAlign: 'center', width: 220 }}>
                        성취기준
                      </th>
                      <th style={{ textAlign: 'center', width: 220 }}>
                        평가요소
                      </th>
                      <th style={{ textAlign: 'center', width: 60 }}>단계</th>
                      <th style={{ textAlign: 'center', width: 220 }}>
                        평가결과
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((item, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: 'center', width: 40 }}>
                          <button
                            className={styles.button}
                            style={{
                              minWidth: 20,
                              padding: '2px 8px',
                              background: '#e74c3c',
                              color: '#fff',
                              fontSize: 'small',
                            }}
                            onClick={() => handleDeleteEvaluation(index)}
                            type='button'
                          >
                            삭제
                          </button>
                        </td>
                        <td style={{ textAlign: 'center', width: 50 }}>
                          {item.number}
                        </td>
                        <td style={{ textAlign: 'center', width: 70 }}>
                          {item.area}
                        </td>
                        <td style={{ textAlign: 'center', width: 220 }}>
                          {item.standard}
                        </td>
                        <td style={{ textAlign: 'center', width: 220 }}>
                          {item.element}
                        </td>
                        <td style={{ textAlign: 'center', width: 60 }}>
                          {item.level}
                        </td>
                        <td style={{ textAlign: 'center', width: 220 }}>
                          {item.result}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        }

        <div className={styles.footer}>
          포항원동초등학교
          <br />
          교사 김지원 제작
        </div>
      </div>
    </div>
  );
};

export default GradeGenerator;
