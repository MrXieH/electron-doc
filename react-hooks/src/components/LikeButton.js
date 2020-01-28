import React, { useState, useEffect } from 'react'

const LikeButton = () => {
  const [ like, setLike ] = useState(0)
  const [ on, setOn ] = useState(true)
  useEffect(() => {
    document.title = `点击了${like}次`
  })
  return (
    <>
      <button onClick={() => {setLike(like + 1)}}>
        {like} 👍
      </button>
      <button onClick={() => {setOn(!on)}}>
        { on ? 'on' : 'off' } 
      </button>
    </>
  )
}

export default LikeButton