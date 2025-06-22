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
          :root {
            --main-bg: #f4f6fa;
            --container-bg: #fff;
            --primary: #232946;
            --primary-light: #394867;
            --primary-dark: #121629;
            --accent: #3ddad7;
            --accent-hover: #23bdb8;
            --danger: #ff5c5c;
            --danger-hover: #e04a4a;
            --gray: #e0e3e8;
            --gray-dark: #b0b8c1;
            --text-main: #232946;
            --text-sub: #6b7280;
            --button-bg: #232946;
            --button-hover: #394867;
            --button-text: #fff;
            --reset-bg: #ffb86b;
            --reset-hover: #ffd6a5;
            --guide-bg: #3ddad7;
            --guide-hover: #23bdb8;
            --footer-text: #232946;
          }
          body {
            background-color: var(--main-bg);
            color: var(--text-main);
            font-family: 'Jua', sans-serif;
            font-size: 1.7rem;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          .container {
            background: var(--container-bg);
            max-width: 800px;
            margin: 40px auto 0 auto;
            padding: 2.5rem 2rem 2rem 2rem;
            border-radius: 18px;
            box-shadow: 0 4px 24px 0 rgba(35, 41, 70, 0.07);
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          h1 {
            font-size: 4rem;
            line-height: 3.5rem;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 2rem;
            letter-spacing: -1px;
            text-align: center;
          }
          img {
            max-width: 100%;
            border-radius: 12px;
            box-shadow: 0 2px 8px 0 rgba(35, 41, 70, 0.04);
            margin: 0.5rem 0 1.5rem 0;
          }
          ol, ul {
            font-family: 'Jua', sans-serif;
            font-size: 1.7rem;
            color: var(--primary);
            margin: 0 0 1.5rem 1.5rem;
            padding: 0 0 0 1.5rem;
          }
          ol {
            list-style: decimal inside;
          }
          ul {
            list-style: disc inside;
          }
          li {
            margin-bottom: 0.7rem;
            line-height: 2.2rem;
          }
          hr {
            border: none;
            border-top: 2px solid var(--gray);
            margin: 2.5rem 0 2.5rem 0;
            width: 100%;
          }
          .footer {
            text-align: center;
            font-size: 1.3rem;
            color: var(--footer-text);
            margin-top: 2rem;
            opacity: 0.7;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>학기말 성적 생성기 사용 방법</h1>
          <img src="/1.png" alt="나이스 접속 안내" />
          <ol>
            <li>나이스에 접속한다.</li>
            <li>성적 - 학생평가 - 교과평가 메뉴로 들어간다.</li>
            <li>교과별 평가 탭을 누르고 들어가서 과목을 선택하고 조회한다.</li>
          </ol>
          <hr/>
          <img src="/2.png" alt="XLS 저장 안내" />
          <ol start="4">
            <li>저장(💾) 버튼을 누르고 XLS data 파일 형식을 선택한다.</li>
          </ol>
          <hr/>
          <img src="/3.png" alt="엑셀 업로드 안내" />
          <ol start="5">
            <li>다운받은 엑셀 파일을 업로드하고 '생성하기' 버튼을 누르면 시작합니다.(몇 분 정도 걸릴 수 있으니 커피 한 잔 마시고 온다.)</li>
          </ol>
          <ul>
            <li>서버에는 학생의 이름이나 번호 등 개인정보가 올라가지 않습니다.</li>
            <li>엑셀 파일은 고치지 말고 그대로 업로드 해주세요.(직접 고치시면 작동하지 않을 수 있습니다.)</li>
          </ul>
          <div class="footer">
            &copy; 포항원동초등학교 김지원
          </div>
        </div>
      </body>
    </html>
  `;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(guideHtml);
    win.document.close();
  }
}
