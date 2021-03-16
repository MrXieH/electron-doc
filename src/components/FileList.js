import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes  } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown  } from '@fortawesome/free-brands-svg-icons'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import PropTypes from 'prop-types'
import { getParentNode } from '../utils/helper'

const { remote } = window.require('electron')
const { Menu, MenuItem } = remote

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [ editStatus, setEditStatus ] = useState(false)
  const [ value, setValue ] = useState('')
  const node = useRef(null)
  /* 自定义hoook 只能在react实例中使用 */
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const closeSearch = (editItem) => {
    setEditStatus(false)
    setValue('')
    // 如果当前操作的项有isNew属性,那么删除他
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }
  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          setEditStatus(parentElement.dataset.id)
          setValue(parentElement.dataset.title)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileDelete(parentElement.dataset.id)
        }
      }
    }
  ], '.file-list', [files])
  useEffect(() => {
    const editItem = files.find(file => file.id === editStatus)
    if (enterPressed && editStatus && value.trim() !== '') {
      onSaveEdit(editItem.id, value, editItem.isNew)
      setEditStatus(false)
      setValue('')
    }
    if (escPressed && editStatus) {
      closeSearch(editItem)
    }
  })
  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files])
  useEffect(() => {
    if (editStatus) {
      node && node.current && node.current.focus()
    }
  }, [editStatus])
  return (
    <ul className='list-group list-group-flush file-list'>
      {
        files.map(file => {
          return (
            <li
              className='list-group-item bg-light row d-flex align-items-center file-item mx-0'
              key={file.id}
              data-id={file.id}
              data-title={file.title}
            >
              { ((file.id !== editStatus) && !file.isNew) && 
                <>
                  <span className='col-2'>
                    <FontAwesomeIcon size='lg' icon={faMarkdown} />
                  </span>
                  <span
                    className='col-6 c-link'
                    onClick={() => {onFileClick(file.id)}}
                  >
                    { file.title }
                  </span>
                  <button
                    type ='botton'
                    className='icon-button col-2'
                    onClick={() => { setEditStatus(file.id); setValue(file.title) }}
                  >
                    <FontAwesomeIcon size='lg' title='编辑' icon={faEdit} />
                  </button>
                  <button
                    type ='botton'
                    className='icon-button col-2'
                    onClick={() => { onFileDelete(file.id) }}
                  >
                    <FontAwesomeIcon size='lg' title='删除' icon={faTrash} />
                  </button>
                </>
              }
              { ((file.id === editStatus) || file.isNew) &&
                <>
                  <input
                    className='form-control col-10'
                    onChange={(e) => { setValue(e.target.value) }}
                    ref={node}
                    value={value}
                    placeholder='请输入文件名称'
                  />
                  <button
                    type ='botton'
                    className='icon-button col-2'
                    onClick={() => { closeSearch(file) }}
                  >
                    <FontAwesomeIcon size='lg' title='关闭' icon={faTimes} />
                  </button>
                </>
              }
            </li>
          )
        })
      }
    </ul>
  )
}

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func
}

export default FileList
