import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home/Home';
import Play from './pages/play/Play';
import Online from './pages/online/Online';
import PlayOnline from './pages/online/play/PlayOnline';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={<Home />}
        />
        <Route
          path='/play'
          element={<Play />}
        />

        <Route
          path='/online'
          element={<Online />}
        />

        <Route
          path='/online/play'
          element={<PlayOnline />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
