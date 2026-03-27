import { BrowserRouter, Route, Routes } from 'react-router';
// import './App.css';
import Visualization from './components/Visualization';
import Home from './components/Home';
import Navigation from './components/Navigation';

function App() {

  return (
    <>
      <BrowserRouter>
        <Navigation/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/visualize' element={<Visualization/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
