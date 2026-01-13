import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomeMenu } from './Pages/Home-menu';
import { HowToPlay } from './Pages/How-to-play';

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomeMenu />} />
                <Route path='/how' element={<HowToPlay onBack={function (): void {
                    throw new Error('Function not implemented.');
                } } />} />
            </Routes>
        </Router>
    );
}

export default App;