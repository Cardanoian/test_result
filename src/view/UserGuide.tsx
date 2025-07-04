import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/ui/card';
import { Button } from '@/view/ui/button';
import {
  X,
  Sparkles,
  Upload,
  RotateCcw,
  Trash2,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';

interface UserGuideProps {
  onClose: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onClose }) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4'>
      <Card className='w-full max-w-4xl h-[90vh] flex flex-col'>
        <CardHeader className='flex flex-row items-center justify-between z-10 border-b'>
          <CardTitle className='text-xl font-bold'>
            학기말 성적 생성기 사용 방법
          </CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            aria-label='Close'
          >
            <X className='h-5 w-5' />
          </Button>
        </CardHeader>
        <CardContent className='space-y-6 text-sm md:text-base overflow-y-auto p-6'>
          {/* 주요 기능 */}
          <div>
            <h2 className='font-bold text-lg mb-3 text-blue-600 dark:text-blue-400'>
              🎯 주요 기능
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
              <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <strong>AI 기반 평가 기록 생성</strong>
                <br />
                Google Gemini API를 활용하여 상세하고 객관적인 교과 평가 기록을
                생성합니다.
              </div>
              <div className='p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                <strong>생성 길이 조절</strong>
                <br />
                슬라이더와 스위치를 사용하여 '짧게', '보통', '길게' 또는
                '무작위'로 길이를 선택할 수 있습니다.
              </div>
              <div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
                <strong>엑셀 파일 일괄 업로드</strong>
                <br />
                나이스(NEIS)에서 받은 성적 파일로 여러 학생의 데이터를 한 번에
                입력할 수 있습니다.
              </div>
              <div className='p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg'>
                <strong>개별 입력</strong>
                <br />
                UI에서 직접 성적 데이터를 입력하고 목록에 추가할 수 있습니다.
              </div>
            </div>
          </div>

          <hr className='border-gray-200 dark:border-gray-700' />

          {/* 1. 기본 설정 */}
          <div>
            <h2 className='font-bold text-lg mb-3 text-blue-600 dark:text-blue-400'>
              1️⃣ 기본 설정
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>🖋️ 과목명 입력</h3>
                <p className='text-muted-foreground ml-4'>
                  메인 화면 상단의 <strong>"과목명"</strong> 입력 필드에 성적을
                  처리할 과목의 이름을 입력합니다. (예: 국어, 수학)
                </p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>📏 생성 길이 설정</h3>
                <p className='text-muted-foreground ml-4 mb-2'>
                  <strong>"생성 길이"</strong> 컨트롤을 사용하여 생성될 텍스트의
                  길이를 조절합니다.
                </p>
                <div className='space-y-2 ml-4'>
                  <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                    <h4 className='font-medium'>슬라이더</h4>
                    <p className='text-sm text-muted-foreground'>
                      '짧게', '보통', '길게' 세 단계로 길이를 직접 선택할 수
                      있습니다.
                    </p>
                  </div>
                  <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                    <h4 className='font-medium'>무작위 스위치</h4>
                    <p className='text-sm text-muted-foreground'>
                      이 스위치를 켜면 슬라이더가 비활성화되고, 생성 시 세 가지
                      길이 중 하나가 무작위로 선택됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className='border-gray-200 dark:border-gray-700' />

          {/* 2. 데이터 입력 방법 */}
          <div>
            <h2 className='font-bold text-lg mb-3 text-blue-600 dark:text-blue-400'>
              2️⃣ 데이터 입력 방법
            </h2>
            <div className='space-y-6'>
              {/* 방법 A: 엑셀 파일 업로드 */}
              <div className='border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10'>
                <h3 className='font-semibold mb-3 text-green-700 dark:text-green-400'>
                  📊 방법 A: 엑셀 파일 일괄 업로드 (권장)
                </h3>
                <div className='space-y-3'>
                  <div>
                    <h4 className='font-medium mb-2'>
                      1. 나이스(NEIS)에서 성적 파일 다운로드
                    </h4>
                    <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6'>
                      <li>
                        나이스에 접속하여{' '}
                        <strong>[성적] - [학생평가] - [교과평가]</strong> 메뉴로
                        이동합니다.
                      </li>
                      <li>
                        '교과별 평가' 탭에서 과목을 선택하고 조회한 후, 저장(💾)
                        아이콘을 클릭하여 <strong>'XLS data'</strong> 형식으로
                        저장합니다.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-medium mb-2 flex items-center gap-2'>
                      <Upload className='h-4 w-4' />
                      2. 파일 업로드
                    </h4>
                    <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6'>
                      <li>
                        <strong>"파일 선택"</strong> 버튼(업로드 아이콘)을
                        클릭합니다.
                      </li>
                      <li>작성한 엑셀 파일(.xlsx 또는 .xls)을 선택합니다.</li>
                      <li>
                        파일이 성공적으로 업로드되면 파일명이 표시되고, 학생
                        데이터가 하단 테이블에 자동으로 추가됩니다.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 방법 B: 개별 입력 */}
              <div className='border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10'>
                <h3 className='font-semibold mb-3 text-blue-700 dark:text-blue-400'>
                  ✍️ 방법 B: 개별 입력
                </h3>
                <div className='space-y-3'>
                  <div>
                    <h4 className='font-medium mb-2'>
                      1. "데이터 개별 추가" 섹션에서 정보 입력
                    </h4>
                    <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4'>
                      <li>
                        <strong>번호</strong>: 학생 번호나 순서
                      </li>
                      <li>
                        <strong>영역</strong>: 평가 영역 (예: 듣기/말하기)
                      </li>
                      <li>
                        <strong>성취기준</strong>: 해당 영역의 성취기준
                      </li>
                      <li>
                        <strong>평가요소</strong>: 구체적인 평가요소
                      </li>
                      <li>
                        <strong>단계</strong>: 학생의 성취 단계 (예: 상, 중, 하)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-medium mb-2'>2. 목록에 추가</h4>
                    <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4'>
                      <li>
                        모든 필수 항목을 입력한 후 <strong>"추가"</strong>{' '}
                        버튼을 클릭합니다.
                      </li>
                      <li>
                        입력한 정보가 하단 테이블에 추가되고, 입력 필드는
                        자동으로 초기화됩니다.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className='border-gray-200 dark:border-gray-700' />

          {/* 3. 평가 기록 생성 */}
          <div>
            <h2 className='font-bold text-lg mb-3 text-blue-600 dark:text-blue-400'>
              3️⃣ 평가 기록 생성
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2 flex items-center gap-2'>
                  <Sparkles className='h-4 w-4' />
                  생성 시작
                </h3>
                <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6'>
                  <li>
                    학생 데이터가 입력되면 <strong>"생성하기"</strong> 버튼(별
                    아이콘)이 활성화됩니다.
                  </li>
                  <li>버튼을 클릭하여 AI 생성을 시작합니다.</li>
                </ul>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>⏳ 진행 상황 확인</h3>
                <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6'>
                  <li>
                    생성이 시작되면 버튼이 <strong>"처리 중... X%"</strong>로
                    변경되고, 진행률 바가 표시됩니다.
                  </li>
                  <li>학생 수에 따라 몇 분 정도 소요될 수 있습니다.</li>
                </ul>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>✅ 결과 확인</h3>
                <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6'>
                  <li>
                    생성이 완료되면 각 학생의 <strong>"평가결과"</strong> 열에
                    AI가 생성한 내용이 표시됩니다.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <hr className='border-gray-200 dark:border-gray-700' />

          {/* 4. 추가 기능 */}
          <div>
            <h2 className='font-bold text-lg mb-3 text-blue-600 dark:text-blue-400'>
              4️⃣ 추가 기능
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='p-3 border rounded-lg'>
                <h3 className='font-semibold mb-2 flex items-center gap-2'>
                  <Trash2 className='h-4 w-4 text-red-500' />
                  개별 학생 삭제
                </h3>
                <p className='text-sm text-muted-foreground'>
                  테이블의 각 행 맨 왼쪽에 있는 <strong>휴지통 아이콘</strong>을
                  클릭하여 특정 학생을 목록에서 삭제할 수 있습니다.
                </p>
              </div>
              <div className='p-3 border rounded-lg'>
                <h3 className='font-semibold mb-2 flex items-center gap-2'>
                  <RotateCcw className='h-4 w-4 text-orange-500' />
                  전체 초기화
                </h3>
                <p className='text-sm text-muted-foreground'>
                  <strong>"초기화"</strong> 버튼을 클릭하면 모든 입력 데이터와
                  결과가 삭제됩니다.
                </p>
              </div>
              <div className='p-3 border rounded-lg'>
                <h3 className='font-semibold mb-2 flex items-center gap-2'>
                  <HelpCircle className='h-4 w-4 text-blue-500' />
                  사용방법 가이드
                </h3>
                <p className='text-sm text-muted-foreground'>
                  <strong>"사용방법"</strong> 버튼을 클릭하면 이 가이드를 다시
                  확인할 수 있습니다.
                </p>
              </div>
              <div className='p-3 border rounded-lg'>
                <h3 className='font-semibold mb-2 flex items-center gap-2'>
                  <Sun className='h-4 w-4 text-yellow-500' />
                  <Moon className='h-4 w-4 text-gray-500' />
                  다크 모드
                </h3>
                <p className='text-sm text-muted-foreground'>
                  화면 우측 상단의 <strong>테마 토글 버튼</strong>을 클릭하여
                  라이트/다크 모드를 전환할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <hr className='border-gray-200 dark:border-gray-700' />

          {/* 5. 주의사항 */}
          <div>
            <h2 className='font-bold text-lg mb-3 text-red-600 dark:text-red-400'>
              ⚠️ 주의사항
            </h2>
            <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start gap-2'>
                  <span className='text-red-500 font-bold'>🔒</span>
                  <div>
                    <strong>개인정보 보호:</strong> 학생의 개인정보(이름 등)는
                    서버에 전송되지 않으며, 입력하지 않는 것을 권장합니다.
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500 font-bold'>🌐</span>
                  <div>
                    <strong>인터넷 연결:</strong> AI 생성을 위해 안정적인 인터넷
                    연결이 필요합니다.
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 font-bold'>📄</span>
                  <div>
                    <strong>파일 형식:</strong> 엑셀 파일은 .xlsx 또는 .xls
                    형식만 지원됩니다. 원본 파일을 수정 없이 업로드해주세요.
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500 font-bold'>🌍</span>
                  <div>
                    <strong>브라우저 호환성:</strong> 최신 버전의 Chrome,
                    Firefox, Safari, Edge에서 최적화되어 있습니다.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* 푸터 */}
          <div className='text-center text-muted-foreground text-xs pt-6 border-t'>
            <p>&copy; 포항원동초등학교 교사 김지원</p>
            <p className='mt-1'>
              학기말 성적 생성기 - AI를 활용한 교과 평가 기록 생성 도구
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserGuide;
