// import GradeGenerator from './view/GradeGenerator';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='grade-generator-theme'>
      <div className='min-h-screen bg-background text-foreground transition-colors'>
        {/* <GradeGenerator /> */}
      </div>
    </ThemeProvider>
  );
}

export default App;
