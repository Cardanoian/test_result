import { useState, useRef } from 'react';
import { EvaluationItem } from '../model';
import { generateExcelFile, readExcelFile } from '../service/excelService';
import { callGeminiApi } from '../service/geminiService';

export const useGradeGeneratorViewModel = () => {
  const [subject, setSubject] = useState<string>('');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('');
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 직접 입력용 상태
  const [inputNumber, setInputNumber] = useState('');
  const [inputArea, setInputArea] = useState('');
  const [inputStandard, setInputStandard] = useState('');
  const [inputElement, setInputElement] = useState('');
  const [inputLevel, setInputLevel] = useState('');
  const [promptLength, setPromptLength] = useState<'짧게' | '보통' | '길게'>(
    '보통'
  );

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
      result: '',
    };
    setEvaluations([...evaluations, newItem]);
    setInputNumber('');
    setInputArea('');
    setInputStandard('');
    setInputElement('');
    setInputLevel('');
  };

  const handleDeleteEvaluation = (index: number) => {
    setEvaluations(evaluations.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSubject('');
    setEvaluations([]);
    setInputNumber('');
    setInputArea('');
    setInputStandard('');
    setInputElement('');
    setInputLevel('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      try {
        const data = await readExcelFile(file, setSubject);
        setEvaluations(data.evaluations);
      } catch (error) {
        console.error('엑셀 파일 처리 중 오류 발생:', error);
        alert('파일 처리 중 오류가 발생했습니다.');
        setFileName('');
      }
    } else {
      setFileName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || evaluations.length === 0) {
      alert('과목명과 엑셀 파일을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const updatedEvaluations = [...evaluations];
    const totalItems = evaluations.length;

    const lengthInstruction =
      promptLength === '짧게'
        ? '간결하게 30자 이내로 작성합니다.'
        : promptLength === '길게'
        ? '상세하게 150자 이상, 200자 이내로 작성합니다.'
        : '보통 길이(50자~100자 정도)로 작성합니다.';

    try {
      for (let i = 0; i < evaluations.length; i++) {
        const item = evaluations[i];
        const result = await callGeminiApi(subject, item, lengthInstruction);
        updatedEvaluations[i] = { ...item, result };
        setProgress(Math.round(((i + 1) / totalItems) * 100));
        setEvaluations([...updatedEvaluations]);
      }

      generateExcelFile(subject, updatedEvaluations);
    } catch (error) {
      console.error('평가 생성 중 오류 발생:', error);
      alert('평가 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return {
    subject,
    setSubject,
    evaluations,
    isLoading,
    progress,
    fileName,
    isUserGuideOpen,
    setIsUserGuideOpen,
    fileInputRef,
    inputNumber,
    setInputNumber,
    inputArea,
    setInputArea,
    inputStandard,
    setInputStandard,
    inputElement,
    setInputElement,
    inputLevel,
    setInputLevel,
    handleAddEvaluation,
    handleDeleteEvaluation,
    handleReset,
    handleFileUpload,
    handleSubmit,
    promptLength,
    setPromptLength,
  };
};
