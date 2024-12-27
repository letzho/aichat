import React from 'react'
import PropTypes from 'prop-types'
import './ChatBotStart.css'

const ChatBotStart = ({onStartChat}) => {
  return (
    <div className='start-page'>
        <button className="start-page-btn" onClick={onStartChat}>Chat AI</button>

    </div>
  
  )
}

ChatBotStart.propTypes = {
    onStartChat: PropTypes.func.isRequired
}

export default ChatBotStart