import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import LikeButton from './components/LikeButton'
import MounseTracker from './components/MouseTracker'
import DogShow from './components/DogShow'
import useMousePosition from './hooks/useMounsePosition'
import useURLLoader from './hooks/useURLLoader'

const style = {
  width: 200
}
const DogShowWithHook = () => {
  const [ data, loading ] = useURLLoader('https://dog.ceo/api/breeds/image/random')
  return (
    <>
      {loading ? <p>🐶读取中</p> : <img src={data && data.message} alt='dog' style={style} />}
      {/* <button onClick={() => {setFetch(!fetch)}}>再看一张</button> */}
    </>
  )
}

const CatShowWithHook = () => {
  const [category, setCategory] = useState('1')
  const [data, loading] = useURLLoader(`https://api.thecatapi.com/v1/images/search?limit=1&category_ids=${category}`)
  return (
    <>
      {loading ? <p>🐱读取中</p> : <img src={data && data[0].url} alt='cat' style={style} />}
      <button onClick={() => {setCategory('1')}}>帽子</button>
      <button onClick={() => {setCategory('5')}}>盒子</button>
    </>
  )
}

function App() {
  const position = useMousePosition()
  const { data, loading } = useURLLoader()
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>{position.x}, {position.y}</h1>
        {/* <MounseTracker /> */}
        {/* <DogShow /> */}
        <DogShowWithHook />
        <CatShowWithHook />
        <LikeButton />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
