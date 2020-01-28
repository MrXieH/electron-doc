import React, { useState, useEffect } from 'react'

const MounseTracker = () => {
  const [positions, setPositions] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const updateMouse = (event) => {
      console.log('add')
      setPositions({
        x: event.clientX,
        y: event.clientY
      })
    }
    document.addEventListener('click', updateMouse)
    return () => {
      console.log('remove')
      document.removeEventListener('click', updateMouse)
    }
  })
  return (
    <p>X: {positions.x}, Y: {positions.y}</p>
  )
}

export default MounseTracker