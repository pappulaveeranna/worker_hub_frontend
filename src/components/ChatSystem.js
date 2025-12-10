import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

function ChatSystem({ workerId, workerName, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'system',
      text: `Chat started with ${workerName}. You can discuss your requirements before booking.`,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const sendMessage = () => {
    if (!newMessage.trim() && !selectedImage) return;

    const message = {
      id: Date.now(),
      sender: user._id,
      senderName: user.name,
      text: newMessage,
      image: selectedImage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setSelectedImage(null);

    // Simulate worker response
    setTimeout(() => {
      const responses = [
        "Thanks for reaching out! I'd be happy to help with your project.",
        "Could you provide more details about the work required?",
        "I'm available for the dates you mentioned. Let's discuss the specifics.",
        "I have experience with similar projects. When would you like to start?"
      ];
      
      const workerResponse = {
        id: Date.now() + 1,
        sender: workerId,
        senderName: workerName,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, workerResponse]);
    }, 2000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      border: '1px solid #e9ecef'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px' }}>💬 Chat with {workerName}</h4>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Online now</p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa'
      }}>
        {messages.map(message => (
          <div key={message.id} style={{
            marginBottom: '15px',
            display: 'flex',
            flexDirection: message.sender === user._id ? 'row-reverse' : 'row'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 12px',
              borderRadius: '18px',
              backgroundColor: message.sender === 'system' ? '#e9ecef' : 
                             message.sender === user._id ? '#007bff' : '#ffffff',
              color: message.sender === 'system' ? '#6c757d' :
                     message.sender === user._id ? 'white' : '#333',
              border: message.sender !== user._id && message.sender !== 'system' ? '1px solid #dee2e6' : 'none',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {message.sender !== 'system' && message.sender !== user._id && (
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {message.senderName}
                </div>
              )}
              {message.image && (
                <img 
                  src={message.image} 
                  alt="Shared" 
                  style={{ 
                    width: '100%', 
                    borderRadius: '8px', 
                    marginBottom: message.text ? '8px' : '0' 
                  }} 
                />
              )}
              {message.text}
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.7, 
                marginTop: '4px',
                textAlign: message.sender === user._id ? 'right' : 'left'
              }}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div style={{
          padding: '10px 15px',
          borderTop: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={selectedImage} 
              alt="Preview" 
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #dee2e6',
        backgroundColor: 'white',
        borderRadius: '0 0 12px 12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '8px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Share photo"
          >
            📷
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '20px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() && !selectedImage}
            style={{
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: (!newMessage.trim() && !selectedImage) ? 0.5 : 1
            }}
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatSystem;