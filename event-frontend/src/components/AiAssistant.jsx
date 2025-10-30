import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function AiAssistant({ token, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'suggestions'
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`${API_BASE}/ai/suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions({ suggestions: 'Failed to load AI suggestions. Please try again later.' });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to chat
    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: newHistory.slice(-6)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory([...newHistory, { role: 'assistant', content: data.response }]);
      } else {
        setChatHistory([...newHistory, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      }
    } catch (error) {
      setChatHistory([...newHistory, { 
        role: 'assistant', 
        content: 'Network error. Please check your connection and try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'suggestions' && !suggestions) {
      loadSuggestions();
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="ai-assistant-toggle"
        onClick={() => setIsOpen(true)}
        title="AI Assistant"
      >
        🤖 AI Assistant
      </button>
    );
  }

  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-header">
        <div className="ai-assistant-tabs">
          <button
            className={`ai-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => handleTabChange('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`ai-tab ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => handleTabChange('suggestions')}
          >
            ✨ Suggestions
          </button>
        </div>
        <button 
          className="ai-assistant-close"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>

      <div className="ai-assistant-content">
        {activeTab === 'chat' ? (
          <>
            <div className="ai-chat-messages">
              {chatHistory.length === 0 && (
                <div className="ai-welcome">
                  <p>👋 Hi {user.email}!</p>
                  <p>I'm your AI event assistant. Ask me anything about events, get recommendations, or need help navigating the platform!</p>
                  <div className="ai-suggestions-prompts">
                    <button onClick={() => setMessage("What events are happening soon?")}>
                      What events are happening soon?
                    </button>
                    <button onClick={() => setMessage("Suggest events for me")}>
                      Suggest events for me
                    </button>
                    <button onClick={() => setMessage("How do I RSVP to an event?")}>
                      How do I RSVP to an event?
                    </button>
                  </div>
                </div>
              )}
              
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`ai-message ${msg.role}`}>
                  <div className="ai-message-content">
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="ai-message assistant">
                  <div className="ai-message-content ai-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            <form className="ai-chat-input" onSubmit={sendMessage}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !message.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="ai-suggestions-panel">
            {loadingSuggestions ? (
              <div className="ai-loading">
                <div className="ai-typing">
                  <span></span><span></span><span></span>
                </div>
                <p>Analyzing your preferences...</p>
              </div>
            ) : suggestions ? (
              <div className="ai-suggestions-content">
                <div className="ai-suggestions-header">
                  <h3>Personalized Event Suggestions</h3>
                  <button 
                    className="btn-refresh"
                    onClick={loadSuggestions}
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="ai-suggestions-text">
                  {suggestions.suggestions.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
                {suggestions.eventsAnalyzed !== undefined && (
                  <div className="ai-suggestions-meta">
                    <small>
                      Analyzed {suggestions.eventsAnalyzed} upcoming events
                      {suggestions.userHistory > 0 && ` based on your ${suggestions.userHistory} past RSVPs`}
                    </small>
                  </div>
                )}
              </div>
            ) : (
              <div className="ai-error">
                <p>Failed to load suggestions. Please try again.</p>
                <button className="btn" onClick={loadSuggestions}>
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AiAssistant;
