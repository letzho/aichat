import React, { useState, useEffect ,useRef} from 'react'
import PropTypes from 'prop-types'
import './ChatBotApp.css'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
const ChatBotApp = ({onGoBack,chats,setChats,activeChat,setActiveChat,onNewChat}) => {
    const [inputValue,setInputValue]=useState('')
    const [messages,setMessages]=useState(chats[0]?.messages || [])
    const [isTyping, setIsTyping] = useState(false)
    const [showEmojiPicker,setShowEmojiPicker]=useState(false)
    const [isMenuOpen,setIsMenuOpen]=useState(false)

    const chatEndRef=useRef(null)


    useEffect(()=>{
       const activeChatObj=chats.find((chat)=>chat.id===activeChat)
       setMessages(activeChatObj?activeChatObj.messages: [])
    },[activeChat,chats])

    useEffect(()=>{
        if(activeChat){
        const storedMessages=JSON.parse(localStorage.getItem(activeChat))||[]
        setMessages(storedMessages)
        }
    },[activeChat])

    const handleEmojiClick = (emojiData) => {
        console.log('Function triggered!')
        console.log('Emoji Data:', emojiData)
        if (emojiData.unified) {
            const emoji = String.fromCodePoint(...emojiData.unified.split('-').map(u => parseInt(u, 16)))
            setInputValue(prev => prev + emoji)
        } else if (emojiData.native) {
            setInputValue(prev => prev + emojiData.native)
        }
    }
    const handleInputChange=(e)=>{
        setInputValue(e.target.value)
    }

    const sendMessage=async()=>{
        if (inputValue.trim()==='') return 

        const newMessage={
            type:'prompt',
            text:inputValue,
            timestamp:new Date().toLocaleTimeString()
        }
        if (!activeChat) {
            const newChat = await onNewChat(inputValue)
            if (!newChat) return;
            setInputValue('')
        } else {
            setIsTyping(true)
            const updatedMessages=[...messages,newMessage]
            setMessages(updatedMessages)
            setInputValue('')

        const updatedChats=chats.map((chat)=>{
            if (chat.id===activeChat) {
                return {...chat,messages:updatedMessages}
            }
            return chat
        })

            setChats(updatedChats)
            
            console.log('Sending request to API...')
            const response=await fetch('https://api.openai.com/v1/chat/completions',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },   
                body:JSON.stringify({
                    model:'gpt-3.5-turbo',
                    messages:[{role:'user',content:inputValue}],
                    max_tokens:500
                })
            })
            const data=await response.json()
            const chatResponse=data.choices[0].message.content.trim()     
            const newResponse={
                type:'response',
                text:chatResponse,
                timestamp:new Date().toLocaleTimeString()   
            }
            const updatedMessagesWithResponse=[...updatedMessages,newResponse]
            setMessages(updatedMessagesWithResponse)
            localStorage.setItem(activeChat,JSON.stringify(updatedMessagesWithResponse))
            setIsTyping(false)

            const updatedChatsWithResponse=chats.map((chat)=>{
                if (chat.id===activeChat){
                    return {...chat,messages:updatedMessagesWithResponse}
                }
                return chat
            })
            setChats(updatedChatsWithResponse)
            localStorage.setItem('chats',JSON.stringify(updatedChatsWithResponse))
            
        }
    }
    const handleKeyDown=(e)=>{
        if (e.key==='Enter'){
            e.preventDefault()
            sendMessage()
        }
    }

    const handleSelectChat=(id)=>{
        setActiveChat(id)
    }

    const handleDeleteChat=(id)=>{
        const updatedChats=chats.filter((chat)=>chat.id!==id)
        setChats(updatedChats)
        localStorage.setItem('chats',JSON.stringify(updatedChats))
        localStorage.removeItem(id)
        if (id===activeChat){
            const newActiveChat=updatedChats.length>0?
            updatedChats[0].id:null
            setActiveChat(newActiveChat)
        }
    }

    useEffect(()=>{
        chatEndRef.current?.scrollIntoView({behavior:'smooth'})
    },[messages])
  return (
    <div className= "chat-app">
        <div className={`chat-list ${isMenuOpen?'open':''}`}>
            <div className="chat-list-header">
                <h2>Chat List</h2>
                <i className="bx bx-edit-alt new-chat" onClick={() => onNewChat("")}></i>
                <i className="bx bx-x-circle close-list" onClick={()=>setIsMenuOpen(false)}></i>
            </div>
            {chats.map((chat)=>(
                <div key={chat.id} className={`chat-list-item ${chat.id===activeChat?'active':''}`}
                onClick={()=>handleSelectChat(chat.id)}>
                <h4>{chat.displayId}</h4>
                <i className="bx bx-x-circle" 
                onClick={(e)=>{
                e.stopPropagation(),handleDeleteChat(chat.id)}}></i>
                </div>
            ))}

        </div>
        <div className="chat-window">
            <div className="chat-title">
                <h3>Chat with AI</h3>
                <i className="bx bx-menu" onClick={()=>setIsMenuOpen(true)}></i>
                <i className="bx bx-arrow-back arrow" onClick={onGoBack}></i>
            </div>
            <div className="chat">
                {messages.map((msg,index)=>(
                <div key={index} className={msg.type==="prompt" ? "prompt":"response"}> 
                {msg.text} <span>{msg.timestamp}</span>
                </div>
                ))}

                {isTyping && <div className="typing">Typing ...</div>}
                <div ref={chatEndRef}></div>
            </div>
            <form className='msg-form' onSubmit={(e)=>e.preventDefault()}>
                <i className="fa-solid fa-face-smile emoji" onClick={()=>setShowEmojiPicker((prev)=>!prev)}></i>
                {showEmojiPicker && (
                    <div className='picker'>
                        <Picker 
                            data={data} 
                            onEmojiSelect={handleEmojiClick}
                            theme="dark"
                        />
                    </div>
                )}
                <input type="text" className='msg-input' 
                placeholder='Type a message..' value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={()=>setShowEmojiPicker(false)}/>
                <i className="fa-solid fa-paper-plane"  onClick={sendMessage}></i>
            </form>
        </div>
    </div>
  )
}

ChatBotApp.propTypes = {
    onGoBack: PropTypes.func.isRequired,
    chats: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        messages: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            timestamp: PropTypes.string.isRequired
        }))
    })).isRequired,
    setChats: PropTypes.func.isRequired,
    activeChat: PropTypes.string,
    setActiveChat: PropTypes.func.isRequired,
    onNewChat: PropTypes.func.isRequired
}

export default ChatBotApp