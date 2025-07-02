import GradeGenerator from './components/GradeGenerator';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='grade-generator-theme'>
      <div className='min-h-screen bg-background text-foreground transition-colors'>
        <GradeGenerator />
      </div>
    </ThemeProvider>
  );
}

export default App;
