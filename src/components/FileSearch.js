import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useIpcRenderer from '../hooks/useIpcRenderer'

const FileSearch = ({ title, onFileSearch }) => {
  const [ inputActive, setInputActive ] = useState(false)
  const [ value, setValue ] = useState('')
  /* 自定义hoook 只能在react实例中使用 */
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  
  let node = useRef(null)
  const closeSearch = () => {
    /* 点击关闭 或 keyup esc触发 */
    setInputActive(false)
    setValue('')
    onFileSearch('')
  }
  useEffect(() => {
    if (enterPressed && inputActive) {
      onFileSearch(value)
    }
    if (escPressed && inputActive) {
      closeSearch()
    }
    // const handleInputEvent = (event) => {
    //   const { keyCode } = event
    //   /* 回车触发search  esc 触发close */
    //   if (keyCode === 13 && inputActive) {
    //     onFileSearch(value)
    //   } else if (keyCode === 27 && inputActive) {
    //     closeSearch(event)
    //   }
    // }
    // document.addEventListener('keyup', handleInputEvent)
    // return () => {
    //   document.removeEventListener('keyup', handleInputEvent)
    // }
  })
  useEffect(() => {
    if (inputActive) {
      node.current.focus()
    }
  }, [inputActive])
  useIpcRenderer({
    'search-file': () => {
      setInputActive(true)
    }
  })
  return (
    <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
      { !inputActive && 
        <>
          <span>{title}</span>
          <button
            type ='botton'
            className='icon-button'
            onClick={() => { setInputActive(true) }}
          >
            <FontAwesomeIcon size='lg' title='搜索' icon={faSearch} />
          </button>
        </>
      }
      { inputActive && 
        <>
          <input
            className='form-control'
            onChange={(e) => { setValue(e.target.value) }}
            ref={node}
            value={value}
          />
          <button
            type ='botton'
            className='icon-button'
            onClick={closeSearch}
          >
            <FontAwesomeIcon size='lg' title='关闭' icon={faTimes} />
          </button>
        </>
      }
    </div>
  )
}

FileSearch.propTypes = {
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired
}

FileSearch.defaultProps = {
  title: '我的云文档'
}

export default FileSearch