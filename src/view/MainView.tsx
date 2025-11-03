import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/view/ui/card';
import { Button } from '@/view/ui/button';
import { ThemeToggle } from '@/view/ThemeToggle';
import { GraduationCap, FileText, Sparkles, ArrowRight } from 'lucide-react';

const MainView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden'>
      {/* 배경 애니메이션 효과 */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      {/* 메인 컨텐츠 */}
      <div className='relative z-10 min-h-screen flex flex-col'>
        {/* 헤더 */}
        <div className='w-full px-4 py-6 flex justify-end'>
          <ThemeToggle />
        </div>

        {/* 중앙 컨텐츠 */}
        <div className='flex-1 flex items-center justify-center px-4 pb-20'>
          <div className='max-w-6xl w-full space-y-12 animate-in fade-in duration-1000'>
            {/* 타이틀 섹션 */}
            <div className='text-center space-y-4'>
              <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-in zoom-in duration-500'>
                <Sparkles className='w-10 h-10 text-white' />
              </div>
              <h1 className='text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-in slide-in-from-bottom duration-700'>
                AI 성적 생성 시스템
              </h1>
              <p className='text-lg md:text-xl text-muted-foreground animate-in slide-in-from-bottom duration-700 delay-100'>
                교육의 미래를 함께 만들어갑니다
              </p>
            </div>

            {/* 카드 섹션 */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto'>
              {/* 교과성적 생성 카드 */}
              <Card
                className='group relative overflow-hidden border-2 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer animate-in slide-in-from-left duration-700 delay-200'
                onClick={() => navigate('/grade')}
              >
                <CardContent className='p-8 md:p-10 space-y-6'>
                  {/* 아이콘 */}
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity' />
                    <div className='relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300'>
                      <GraduationCap className='w-8 h-8 md:w-10 md:h-10 text-white' />
                    </div>
                  </div>

                  {/* 텍스트 */}
                  <div className='space-y-3'>
                    <h2 className='text-2xl md:text-3xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                      교과성적 생성하기
                    </h2>
                    <p className='text-muted-foreground text-sm md:text-base leading-relaxed'>
                      AI 기반 교과 성적 평가 시스템으로 학생들의 학업 성취도를
                      효율적으로 관리하세요
                    </p>
                  </div>

                  {/* 버튼 */}
                  <Button
                    className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300'
                    size='lg'
                  >
                    시작하기
                    <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </CardContent>

                {/* 호버 효과 */}
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
              </Card>

              {/* 행발 생성 카드 */}
              <Card
                className='group relative overflow-hidden border-2 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer animate-in slide-in-from-right duration-700 delay-200'
                onClick={() => navigate('/behavior')}
              >
                <CardContent className='p-8 md:p-10 space-y-6'>
                  {/* 아이콘 */}
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity' />
                    <div className='relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300'>
                      <FileText className='w-8 h-8 md:w-10 md:h-10 text-white' />
                    </div>
                  </div>

                  {/* 텍스트 */}
                  <div className='space-y-3'>
                    <h2 className='text-2xl md:text-3xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors'>
                      행발 생성하기
                    </h2>
                    <p className='text-muted-foreground text-sm md:text-base leading-relaxed'>
                      AI 기반 행동특성 및 종합의견 생성으로 학생들의 성장을
                      체계적으로 기록하세요
                    </p>
                  </div>

                  {/* 버튼 */}
                  <Button
                    className='w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300'
                    size='lg'
                  >
                    시작하기
                    <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </CardContent>

                {/* 호버 효과 */}
                <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
              </Card>
            </div>

            {/* 푸터 정보 */}
            <div className='text-center text-muted-foreground text-sm animate-in fade-in duration-1000 delay-500'>
              <p>AI 기술로 교육 현장의 업무 효율을 높입니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainView;
