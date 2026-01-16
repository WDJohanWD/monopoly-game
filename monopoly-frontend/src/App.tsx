import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomeMenu } from './Pages/Home-menu';
import { HowToPlay } from './Pages/How-to-play';
import { NewGame } from './Pages/New-game';
import { Options } from './Pages/Options';

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomeMenu />} />
                <Route path='/how' element={<HowToPlay />} />
                <Route path="/new-game" element={<NewGame />}></Route>
                <Route path="/options" element={<Options />}></Route>
            </Routes>

        </Router>
    );
}

export default App;