import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Upload, RotateCcw, HelpCircle, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CallGpt } from '../utils/gptUtils';
import { readExcelFile, generateExcelFile } from '../utils/excelUtils';
import { EvaluationItem } from '../types';
import * as XLSX from 'xlsx';
import UserGuide from './UserGuide';

const GradeGenerator: React.FC = () => {
  const [subject, setSubject] = useState<string>('');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
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

  // 초기화 핸들러
  const handleReset = () => {
    setSubject('');
    setEvaluations([]);
    setWorkbook(null);
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
        const [data, wb] = await readExcelFile(file, setSubject);
        setEvaluations(data.evaluations);
        setWorkbook(wb);
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* 헤더 */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              학기말 성적 생성기
            </h1>
            <p className='text-muted-foreground mt-2'>
              AI를 활용한 스마트 성적 관리 시스템
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* 메인 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              기본 설정
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>과목명</label>
                <Input
                  type='text'
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.trim())}
                  placeholder='과목명을 입력하세요'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>엑셀 파일</label>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className='gap-2'
                  >
                    <Upload className='h-4 w-4' />
                    파일 선택
                  </Button>
                  <p className='text-sm text-muted-foreground'>
                    {fileName || '선택된 파일 없음'}
                  </p>
                  <Input
                    type='file'
                    accept='.xlsx, .xls'
                    onChange={handleFileUpload}
                    disabled={isLoading}
                    ref={fileInputRef}
                    className='hidden'
                  />
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Button
                onClick={handleSubmit}
                disabled={!subject || evaluations.length === 0 || isLoading}
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              >
                {isLoading ? <></> : <Sparkles />}
                {isLoading ? `처리 중... ${progress}%` : '생성하기'}
              </Button>

              <Button
                onClick={handleReset}
                variant='outline'
                disabled={isLoading}
                className='gap-2'
              >
                <RotateCcw className='h-4 w-4' />
                초기화
              </Button>

              <Button
                onClick={() => setIsUserGuideOpen(true)}
                variant='outline'
                disabled={isLoading}
                className='gap-2'
              >
                <HelpCircle className='h-4 w-4' />
                사용방법
              </Button>
            </div>

            {isLoading && (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>진행률</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className='w-full' />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 데이터 개별 추가 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>데이터 개별 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-6 gap-3 items-end'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>번호</label>
                <Input
                  type='text'
                  value={inputNumber}
                  onChange={(e) => setInputNumber(e.target.value)}
                  placeholder='번호'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>영역</label>
                <Input
                  type='text'
                  value={inputArea}
                  onChange={(e) => setInputArea(e.target.value)}
                  placeholder='영역'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>성취기준</label>
                <Input
                  type='text'
                  value={inputStandard}
                  onChange={(e) => setInputStandard(e.target.value)}
                  placeholder='성취기준'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>평가요소</label>
                <Input
                  type='text'
                  value={inputElement}
                  onChange={(e) => setInputElement(e.target.value)}
                  placeholder='평가요소'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>단계</label>
                <Input
                  type='text'
                  value={inputLevel}
                  onChange={(e) => setInputLevel(e.target.value)}
                  placeholder='단계'
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleAddEvaluation}
                disabled={isLoading}
                className='h-10'
              >
                추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 성적 데이터 테이블 */}
        {evaluations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>성적 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border overflow-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12 text-center'>삭제</TableHead>
                      <TableHead className='w-16 text-center'>번호</TableHead>
                      <TableHead className='w-24 text-center'>영역</TableHead>
                      <TableHead className='text-center'>성취기준</TableHead>
                      <TableHead className='text-center'>평가요소</TableHead>
                      <TableHead className='w-16 text-center'>단계</TableHead>
                      <TableHead className='text-center'>평가결과</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className='text-center'>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleDeleteEvaluation(index)}
                            className='h-8 w-8 p-0'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                        <TableCell className='text-center'>
                          {item.number}
                        </TableCell>
                        <TableCell className='text-center'>
                          {item.area}
                        </TableCell>
                        <TableCell className='text-center'>
                          {item.standard}
                        </TableCell>
                        <TableCell className='text-center'>
                          {item.element}
                        </TableCell>
                        <TableCell className='text-center'>
                          {item.level}
                        </TableCell>
                        <TableCell className='text-center'>
                          {item.result}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 푸터 */}
        <div className='text-center text-muted-foreground text-sm py-8'>
          <p>포항원동초등학교</p>
          <p>교사 김지원 제작</p>
        </div>
      </div>
      {isUserGuideOpen && (
        <UserGuide onClose={() => setIsUserGuideOpen(false)} />
      )}
    </div>
  );
};

export default GradeGenerator;
