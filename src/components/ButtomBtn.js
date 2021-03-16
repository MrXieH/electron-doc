import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ButtomBtn = ({ text, colorClass, icon, onBtnClick }) => {
  return (
    <button
      type='button'
      className={`btn btn-block no-border ${colorClass}`}
      onClick={ onBtnClick }
    >
      <FontAwesomeIcon size='lg' icon={icon} />
      <span> { text }</span>
    </button>
  )
}

ButtomBtn.propTypes = {
  text: PropTypes.string,
  colorClass: PropTypes.string,
  icon: PropTypes.object.isRequired,
  onBtnClick: PropTypes.func
}

ButtomBtn.defaultProps = {
  text: '默认文字'
}

export default ButtomBtn
