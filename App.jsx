import React, { useState,useEffect } from 'react'
import ChatBotStart from './Components/ChatBotStart.jsx'
import ChatBotApp from './Components/ChatBotApp.jsx'
import { v4 as uuidv4 } from 'uuid'
const App = () => {
  const [isChatting,setIsChatting]=useState(false)
  const [chats,setChats]=useState([])
  const [activeChat,setActiveChat]=useState(null)
  const [isInitialized,setIsInitialized]=useState(false)

  useEffect(()=>{
    const storedChats=JSON.parse(localStorage.getItem('chats'))||[]
    if (storedChats.length > 0) {
      setChats(storedChats)
    }
    setIsInitialized(true)
  },[])

  const handleStartChat=()=>{
    setIsChatting(true)
    if (chats.length > 0) {
      setActiveChat(chats[0].id)
    } else {
      createNewChat()
    }
  }

  const handleGoBack=()=>{
    setIsChatting(false)
  }

  const createNewChat=async(initialMessage="")=>{
    if (!isInitialized) return null;
    
    const newChat={
      id:uuidv4(),
      displayId:`Chat ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}`,
      messages: initialMessage ? [{
        type: 'prompt',
        text: initialMessage,
        timestamp: new Date().toLocaleTimeString()
      }] : []
    }
    const updatedChats=[newChat,...chats]
    setChats(updatedChats)
    setActiveChat(newChat.id)
    localStorage.setItem('chats',JSON.stringify(updatedChats))
    return newChat
  }

  return (
    <div className='container'>
      {isChatting?(
        <ChatBotApp onGoBack={handleGoBack} 
        chats={chats} 
        setChats={setChats} 
      
        activeChat={activeChat} 
        setActiveChat={setActiveChat}
        onNewChat={createNewChat}/>
      ):(
      <ChatBotStart onStartChat={handleStartChat}/>
      )}
    </div>
  )
}

export default App