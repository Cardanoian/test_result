import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/ui/card';
import { Button } from '@/view/ui/button';
import { Input } from '@/view/ui/input';
import { Progress } from '@/view/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/view/ui/table';
import { Trash2, Upload, RotateCcw, HelpCircle, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/view/ThemeToggle';
import UserGuide from '@/view/UserGuide';
import { useGradeGeneratorViewModel } from '@/viewmodel/useGradeGeneratorViewModel';
import { EvaluationItem } from '@/model';

const GradeGenerator: React.FC = () => {
  const {
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
  } = useGradeGeneratorViewModel();

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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSubject(e.target.value)
                  }
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFileUpload(e)
                    }
                    disabled={isLoading}
                    ref={fileInputRef}
                    className='hidden'
                  />
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  handleSubmit(e)
                }
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputNumber(e.target.value)
                  }
                  placeholder='번호'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>영역</label>
                <Input
                  type='text'
                  value={inputArea}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputArea(e.target.value)
                  }
                  placeholder='영역'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>성취기준</label>
                <Input
                  type='text'
                  value={inputStandard}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputStandard(e.target.value)
                  }
                  placeholder='성취기준'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>평가요소</label>
                <Input
                  type='text'
                  value={inputElement}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputElement(e.target.value)
                  }
                  placeholder='평가요소'
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>단계</label>
                <Input
                  type='text'
                  value={inputLevel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputLevel(e.target.value)
                  }
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
                    {evaluations.map((item: EvaluationItem, index: number) => (
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
