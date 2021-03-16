import React, { useState } from 'react'
import './App.css'
import 'easymde/dist/easymde.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import ButtomBtn from './components/ButtomBtn'
import TabList from './components/TabList'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import SimpleMDE from 'react-simplemde-editor'
import uuidv4 from 'uuid/v4'
import { flattenArr, objToArr } from './utils/helper'
import fileHelper from './utils/fileHelper'
import useIpcRenderer from './hooks/useIpcRenderer'
// require node.js modules
const { join, basename, extname, dirname } = window.require('path')
const { remote } = window.require('electron')
const Store = window.require('electron-store')
const fileStore = new Store({ 'name': 'Files Data' })

const saveFilesToStore = (files) => {
  // 不需要把所有信息都存store,例如isNew、body等状态信息
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}

function App() {
  const [ files, setFiles ] = useState(fileStore.get('files') || {})
  const [ activeFileID, setActiveFileId ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [ searchFiles, setSearchFiles ] = useState([])
  const filesArr = objToArr(files)
  const savedLocation = remote.app.getPath('documents')

  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
  const activedFile = files[activeFileID]
  const fileListArr = (searchFiles.length > 0) ? searchFiles : filesArr

  const fileClick = (fileID) => {
    // set current active file
    setActiveFileId(fileID)
    const currentFile = files[fileID]
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true }
        setFiles({...files, [fileID]: newFile})
      }).catch(err => {
        alert(err)
        const { [fileID]: value, ...afterFiles } = files
        tabClose(fileID)
        setFiles(afterFiles)
        saveFilesToStore(afterFiles)
      })
    }
    // if opendedFiles don't have the current ID
    // add new fileID to openedFiles
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
  }

  const tabClick = (fileID) => {
    // set current active file
    setActiveFileId(fileID)
  }

  const tabClose = (id) => {
    // remove current id from openedFileIDs
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabsWithout)
    // set the active to the first opened tab if still tabs left
    if (tabsWithout.length > 0) {
      setActiveFileId(tabsWithout[0])
    } else {
      setActiveFileId('')
    }
  }

  const fileChange = (id, value) => {
    // file array to update to new value
    if (value !== files[id].body) {
      const newfile = { ...files[id], body: value }
      setFiles({ ...files, [id]: newfile })
      // update unsavedIDs
      if (!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id])
      }
    }
  }

  const deleteFile = (id) => {
    if (files[id].isNew) {
      const { [id]: value, ...afterDelete } = files
      setFiles(afterDelete)
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        const { [id]: value, ...afterDelete } = files
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
        // close the tab if opened
        tabClose(id)
      })
    }
  }

  const updateFileName = (id, title, isNew) => {
    // 如果不是新文件，那么path不变,否则保存在savedLocation
    const newPath = isNew ? join(savedLocation,`${title}.md`)
    : join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    if (filesArr.find(item => item.title === title)) {
      alert('已有同名文件存在')
      return
    }
    if (isNew) {
      // create
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    } else {
      // update
      const oldPath = files[id].path
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    }
  }

  const fileSearch = (keyword) => {
    // filter out the new files based on the keyword
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchFiles(newFiles)
  }

  const createNewFile = () => {
    const newID = uuidv4()
    const newFile = {
      id: newID,
      title: '',
      body: '## 请输入Markdown',
      createdAt: new Date().getTime(),
      isNew: true
    }
    setFiles({ ...files, [newID]: newFile })
  }

  const saveCurrentFile = () => {
    fileHelper.writeFile(
      join(activedFile.path),
      activedFile.body
    ).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activedFile.id))
    })
  }

  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdowm 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdowm files', extensions: ['md'] }
      ]
    }).then(ret => {
      if (ret.filePaths && ret.filePaths.length) {
        // 过滤数组 筛选出已存在相同名字的文件
        // ["C:\Users\x\Desktop\learn\electron\cloude-doc\README.md"]
        const filteredPaths = ret.filePaths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path
          })
          return !alreadyAdded
        })
        // 扩展数组,现在只有path  [{ id: '', path: '', title: '' }]
        const importFilesArr = filteredPaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path
          }
        })
        // 获得flattenArr 结构
        const newFiles = { ...files, ...flattenArr(importFilesArr) }
        // setState and update electron store && messagebox
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        if (importFilesArr.length > 0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: `成功导入了${importFilesArr.length}个文件`,
            message: `成功导入了${importFilesArr.length}个文件`
          })
        }
      }
    })
  }

  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile
  })

  return (
    <div className="App container-fluid px-0">
      <div className='row no-gutters'>
        <div className='col-3 left-panel bg-light'>
          <FileSearch title='我的云文档' onFileSearch={(value) => { fileSearch(value) }} />
          <FileList
            files={fileListArr}
            onFileClick={(id) => { fileClick(id) }}
            onFileDelete={(id) => { deleteFile(id) }}
            onSaveEdit={(id, title, isNew) => { updateFileName(id, title, isNew) }}
          />
          <div className='row no-gutters buttom-group'>
            <div className='col'>
              <ButtomBtn
                text='新建'
                colorClass='btn-primary'
                icon={faPlus}
                onBtnClick={createNewFile}
              />
            </div>
            <div className='col'>
              <ButtomBtn
                text='导入'
                colorClass='btn-success'
                icon={faFileImport}
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className='col-9 right-panel'>
          { !activedFile &&
            <div className='start-page'>
              选择或者创建新的 Markdown 文档
            </div>
          }
          { activedFile &&
            <>
              <TabList
                files={openedFiles}
                activedId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={(id) => { tabClick(id) }}
                onCloseTab={(id) => { tabClose(id) }}
              />
              <SimpleMDE
                key={activedFile && activedFile.id}
                value={activedFile && activedFile.body}
                onChange={(value) => {fileChange(activedFile.id, value)}}
                options={{
                  minHeight: '515px'
                }}
              />
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
