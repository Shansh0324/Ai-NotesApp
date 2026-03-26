import { useState, useRef, useEffect } from 'react';
import { useAI } from '../hooks/useAI';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, FileText, Send, X, UploadCloud, Bot, Loader2, Sparkles, BookOpen, Maximize2, Minimize2, Check, Layers } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [inputValue, setInputValue] = useState('');
  
  const {
    messages, chatLoading, uploadLoading, documents, selectedDocs,
    askQuestion, uploadDocument, fetchDocuments, toggleDocSelection, selectAllDocs
  } = useAI();
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading]);

  // Fetch documents when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, fetchDocuments]);

  // Listen for new uploads
  useEffect(() => {
    const handleUpload = () => fetchDocuments();
    window.addEventListener('documentUploaded', handleUpload);
    return () => window.removeEventListener('documentUploaded', handleUpload);
  }, [fetchDocuments]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || chatLoading) return;
    const question = inputValue;
    setInputValue('');
    await askQuestion(question);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
       alert("Please upload a PDF file.");
       return;
    }
    const success = await uploadDocument(file);
    if (success && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const drawerWidth = isExpanded ? 'w-full sm:w-[700px]' : 'w-full sm:w-[420px]';
  const isAllSelected = selectedDocs.length === 0;

  // Get the context label for current selection
  const getContextLabel = () => {
    if (isAllSelected) return 'All Sources (Notes + PDFs)';
    if (selectedDocs.length === 1) {
      const doc = documents.find(d => d._id === selectedDocs[0]);
      return doc ? doc.filename : '1 document';
    }
    return `${selectedDocs.length} documents`;
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary-600 text-white shadow-xl hover:bg-primary-700 transition-all duration-300 z-40 flex items-center justify-center transform hover:scale-105 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500 border-2 border-white"></span>
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full ${drawerWidth} bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">AI Assistant</h2>
              <p className="text-xs text-gray-500">Answers from your notes & PDFs</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-50/50 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'chat' ? 'bg-white text-primary-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
          <button
            onClick={() => setActiveTab('kb')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'kb' ? 'bg-white text-primary-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <BookOpen className="w-4 h-4" /> Knowledge Base
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* Chat Interface */}
          <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            
            {/* Context Selector Bar */}
            {documents.length > 0 && (
              <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Context Source</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {/* All Sources pill */}
                  <button
                    onClick={selectAllDocs}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                      isAllSelected
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    {isAllSelected && <Check className="w-3 h-3" />}
                    All Sources
                  </button>
                  
                  {/* Individual document pills */}
                  {documents.map((doc) => {
                    const isSelected = selectedDocs.includes(doc._id);
                    return (
                      <button
                        key={doc._id}
                        onClick={() => toggleDocSelection(doc._id)}
                        title={doc.filename}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border max-w-[180px] ${
                          isSelected
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">{doc.filename}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-500">
                    <Bot className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">How can I help you today?</h3>
                    <p className="text-sm text-gray-500 mt-2">I can answer questions based on your notes and PDFs.</p>
                    {documents.length > 0 && (
                      <p className="text-xs text-primary-500 mt-3 bg-primary-50 rounded-lg px-3 py-2 inline-block">
                        💡 Select a specific PDF above to ask targeted questions
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-sm shadow-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200/50'
                    }`}>
                      {msg.role === 'ai' && <Bot className="w-4 h-4 mb-1 text-primary-500" />}
                      {msg.role === 'user' ? (
                        <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="leading-relaxed prose max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              {/* Active context indicator */}
              <div className="flex items-center gap-1.5 mb-2 text-[11px] text-gray-400">
                <Layers className="w-3 h-3" />
                <span>Searching: <span className="font-medium text-gray-600">{getContextLabel()}</span></span>
              </div>
              <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Ask a question..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-h-[52px] max-h-[120px] text-sm custom-scrollbar"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || chatLoading}
                  className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Knowledge Base Interface */}
          <div className={`absolute inset-0 overflow-y-auto p-6 transition-opacity duration-300 bg-white ${activeTab === 'kb' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="text-center mb-6">
              <div className="inline-flex w-12 h-12 bg-blue-50 text-blue-500 rounded-xl items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900">Document Upload</h3>
              <p className="text-sm text-gray-500 mt-1">Upload PDFs to expand the AI's knowledge base.</p>
            </div>

            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${uploadLoading ? 'border-primary-300 bg-primary-50/50' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'}`}
              onClick={() => !uploadLoading && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="application/pdf" 
                className="hidden" 
              />
              
              {uploadLoading ? (
                <div className="flex flex-col items-center justify-center text-primary-600">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="font-medium">Reading Document...</p>
                  <p className="text-xs text-primary-400 mt-1">Extracting text and chunking</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 cursor-pointer">
                  <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="font-medium text-gray-700">Click to upload PDF</p>
                  <p className="text-xs mt-1">Max file size: 50MB</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">How it works</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2 text-left">
                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">1</span></div>
                  <span>Upload a PDF containing information you want to query.</span>
                </li>
                <li className="flex items-start gap-2 text-left">
                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">2</span></div>
                  <span>Select which PDF(s) to use as context in the Chat tab.</span>
                </li>
                <li className="flex items-start gap-2 text-left">
                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">3</span></div>
                  <span>Ask targeted questions — the AI only searches selected sources!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
