import React, { useState } from "react";
import Card from "./Card";
import { CallGpt } from "../utils/gptUtils";
import { readExcelFile, generateExcelFile } from "../utils/excelUtils";
import { EvaluationItem } from "../types";
import styles from "./GradeGenerator.module.css";
import * as XLSX from "xlsx";

const GradeGenerator: React.FC = () => {
  const [subject, setSubject] = useState<string>("");
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const [data, wb] = await readExcelFile(file);
        setEvaluations(data.evaluations);
        setWorkbook(wb);
      } catch (error) {
        console.error("엑셀 파일 처리 중 오류 발생:", error);
        alert("파일 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || evaluations.length === 0 || !workbook) {
      alert("과목명과 엑셀 파일을 모두 입력해주세요.");
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
      console.error("평가 생성 중 오류 발생:", error);
      alert("평가 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const openUserGuide = () => {
    window.open(
      "https://raw.githubusercontent.com/Cardanoian/test_result/refs/heads/main/README.jpeg",
      "_blank"
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>학기말 성적 생성기</h1>

        <div className={styles.inputContainer}>
          <div className={styles.inputGroup}>
            <span className={styles.label}>과목</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value.trim())}
              className={styles.subjectInput}
              placeholder="과목명 입력"
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.label}>엑셀 파일</span>
            <input
              type="file"
              accept=".xlsx, .xls"
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
            {isLoading ? `처리 중... ${progress}%` : "생성하기"}
          </button>

          <button
            onClick={openUserGuide}
            className={styles.guideButton}
            disabled={isLoading}
          >
            사용방법
          </button>
        </div>

        {evaluations.length > 0 && (
          <div className={styles.dataSection}>
            <h2 className={styles.sectionTitle}>업로드된 데이터</h2>
            <Card className="p-4 bg-white mb-4">
              <div className={styles.dataList}>
                <table className={styles.evaluationTable}>
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>영역</th>
                      <th>성취기준</th>
                      <th>평가요소</th>
                      <th>단계</th>
                      <th>평가결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((item, index) => (
                      <tr key={index}>
                        <td>{item.number}</td>
                        <td>{item.area}</td>
                        <td>{item.standard}</td>
                        <td>{item.element}</td>
                        <td>{item.level}</td>
                        <td>{item.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

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
