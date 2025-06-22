import React from 'react';
import styles from './GradeGenerator.module.css';

/**
 * README.md 내용을 JSX로 변환한 React.FC 컴포넌트
 */
export const UserGuide: React.FC = () => (
  <div
    className={styles.container}
    style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}
  >
    <h1 className={styles.title}>학기말 성적 생성기 사용 방법</h1>
    <p style={{ textAlign: 'center' }}>
      <img src='/1.png' alt='나이스 접속 안내' style={{ maxWidth: '100%' }} />
    </p>
    <ol
      style={{
        fontFamily: '"Jua", sans-serif',
        fontSize: '1.7rem',
        color: '#581c87',
      }}
    >
      <li>나이스에 접속한다.</li>
      <li>성적 - 학생평가 - 교과평가 메뉴로 들어간다.</li>
      <li>교과별 평가 탭을 누르고 들어가서 과목을 선택하고 조회한다.</li>
    </ol>
    <hr />
    <br />
    <br />
    <br />
    <p style={{ textAlign: 'center' }}>
      <img src='/2.png' alt='XLS 저장 안내' style={{ maxWidth: '100%' }} />
    </p>
    <ol
      start={4}
      style={{
        fontFamily: '"Jua", sans-serif',
        fontSize: '1.7rem',
        color: '#581c87',
      }}
    >
      <li>저장(💾) 버튼을 누르고 XLS data 파일 형식을 선택한다.</li>
    </ol>
    <hr />
    <br />
    <br />
    <br />
    <p style={{ textAlign: 'center' }}>
      <img src='/3.png' alt='엑셀 업로드 안내' style={{ maxWidth: '100%' }} />
    </p>
    <ol
      start={5}
      style={{
        fontFamily: '"Jua", sans-serif',
        fontSize: '1.7rem',
        color: '#581c87',
      }}
    >
      <li>앱의 과목 란에 생성할 과목의 이름을 적는다. (ex - 국어, 수학)</li>
      <li>
        다운받은 엑셀 파일을 업로드하고, 10분 정도 걸릴 수 있으니 커피 한 잔
        마시고 온다.
      </li>
    </ol>
    <ul
      style={{
        fontFamily: '"Jua", sans-serif',
        fontSize: '1.7rem',
        color: '#581c87',
      }}
    >
      <li>서버에는 학생의 이름이나 번호 등 개인정보가 올라가지 않습니다.</li>
      <li>
        엑셀 파일은 고치지 말고 그대로 업로드 해주세요.(직접 고치시면 작동하지
        않을 수 있습니다.)
      </li>
    </ul>
  </div>
);

/**
 * openUserGuide 함수: README 내용을 새 창에 띄움 (이미지 경로 public 기준, 스타일 통일)
 */
export function openUserGuide() {
  const guideHtml = `
    <html>
      <head>
        <title>학기말 성적 생성기 사용 방법</title>
        <meta charset="utf-8" />
        <style>
          body {
            max-width: 800px;
            margin: 0 auto;
            padding: 24px;
            font-family: "Jua", sans-serif;
            background-color: #f5f7e9;
            color: #581c87;
            font-size: 1.7rem;
          }
          h1 {
            font-size: 4rem;
            line-height: 3.5rem;
            font-weight: bold;
            color: #581c87;
            margin-bottom: 2rem;
          }
          img { max-width: 100%; }
          ol, ul {
            font-family: "Jua", sans-serif;
            font-size: 1.7rem;
            color: #581c87;
          }
        </style>
      </head>
      <body>
        <h1>학기말 성적 생성기 사용 방법</h1>
        <p style="text-align: center;">
          <img src="/1.png" alt="나이스 접속 안내" />
        </p>
        <ol>
          <li>나이스에 접속한다.</li>
          <li>성적 - 학생평가 - 교과평가 메뉴로 들어간다.</li>
          <li>교과별 평가 탭을 누르고 들어가서 과목을 선택하고 조회한다.</li>
        </ol>
        <hr/>
        <br/><br/><br/>
        <p style="text-align: center;">
          <img src="/2.png" alt="XLS 저장 안내" />
        </p>
        <ol start="4">
          <li>저장(💾) 버튼을 누르고 XLS data 파일 형식을 선택한다.</li>
        </ol>
        <hr/>
        <br/><br/><br/>
        <p style="text-align: center;">
          <img src="/3.png" alt="엑셀 업로드 안내" />
        </p>
        <ol start="5">
          <li>앱의 과목 란에 생성할 과목의 이름을 적는다. (ex - 국어, 수학)</li>
          <li>다운받은 엑셀 파일을 업로드하고, 10분 정도 걸릴 수 있으니 커피 한 잔 마시고 온다.</li>
        </ol>
        <ul>
          <li>서버에는 학생의 이름이나 번호 등 개인정보가 올라가지 않습니다.</li>
          <li>엑셀 파일은 고치지 말고 그대로 업로드 해주세요.(직접 고치시면 작동하지 않을 수 있습니다.)</li>
        </ul>
      </body>
    </html>
  `;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(guideHtml);
    win.document.close();
  }
}
