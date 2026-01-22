import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { HomeMenu } from './Pages/Home-menu';
import { HowToPlay } from './Pages/How-to-play';
import { NewGame } from './Pages/New-game';
import { Options } from './Pages/Options';
import { Board } from './Pages/Board';

function App() {
    return (
        <SettingsProvider>
            <Router>
                <Routes>
                    <Route path='/' element={<HomeMenu />} />
                    <Route path='/how' element={<HowToPlay />} />
                    <Route path="/new-game" element={<NewGame />}></Route>
                    <Route path="/options" element={<Options />}></Route>
                    <Route path="/board/:gameId" element={<Board />}></Route>
                    <Route path="/board" element={<Board />}></Route>
                </Routes>
            </Router>
        </SettingsProvider>
    );
}

export default App;