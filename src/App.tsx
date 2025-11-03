import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainView from './view/MainView';
import GradeGenerator from './view/GradeGeneratorView';
import BehaviorGenerator from './view/BehaviorGeneratorView';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='grade-generator-theme'>
      <Router>
        <div className='min-h-screen bg-background text-foreground transition-colors'>
          <Routes>
            <Route path='/' element={<MainView />} />
            <Route path='/grade' element={<GradeGenerator />} />
            <Route path='/behavior' element={<BehaviorGenerator />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
