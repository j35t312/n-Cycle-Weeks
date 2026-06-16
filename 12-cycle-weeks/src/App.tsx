import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { twelveCycleConfig } from './config'
import { createSwapCalendarCycle } from './utils'

function App() {
  twelveCycleConfig.cycleLength 
  console.log(createSwapCalendarCycle())

  return (
    <>
      <div>{twelveCycleConfig.cycleLength}</div>
    </>
  )
}

export default App
