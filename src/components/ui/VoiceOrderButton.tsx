'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Send, Volume2 } from 'lucide-react';

const VOICE_AI_URL = process.env.NEXT_PUBLIC_VOICE_AI_URL || 'http://localhost:4000';

interface Message {
  role: 'ai' | 'user';
  text: string;
  time: string;
}

export default function VoiceOrderButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [callId] = useState(() => 'web_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const addMessage = useCallback((role: 'ai' | 'user', text: string) => {
    setMessages(prev => [...prev, { role, text, time: getTime() }]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  // Start voice session when modal opens
  const openVoiceChat = async () => {
    setIsOpen(true);
    if (!sessionActive) {
      try {
        const res = await fetch(`${VOICE_AI_URL}/api/pipeline/start-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId, callerPhone: '+91customer_web' }),
        });
        const data = await res.json();
        if (data.success) {
          setSessionActive(true);
          addMessage('ai', data.greeting || 'Vanakkam! Namma Ooru Express. Enna order pannanum?');
          speak(data.greeting || 'Vanakkam! Namma Ooru Express. Enna order pannanum?');
        }
      } catch (err) {
        addMessage('ai', '⚠️ Voice AI server not reachable. Please start the server on port 4000.');
      }
    }
  };

  // Browser TTS fallback
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ta-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // Play audio from base64
  const playAudio = (base64: string) => {
    const audio = new Audio('data:audio/mp3;base64,' + base64);
    audio.play().catch(() => {});
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      addMessage('ai', '⚠️ Microphone access denied. Please allow mic permission or use text input.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  // Process audio through Voice AI
  const processAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('callId', callId);
    formData.append('language', 'ta');

    try {
      const res = await fetch(`${VOICE_AI_URL}/api/pipeline/process-voice`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.customerText) addMessage('user', data.customerText);
      if (data.text) {
        addMessage('ai', data.text);
        if (data.audioBase64) playAudio(data.audioBase64);
        else speak(data.text);
      }
    } catch (err) {
      addMessage('ai', '⚠️ Error processing voice. Try again or type your order.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process text input
  const sendText = async () => {
    const text = textInput.trim();
    if (!text) return;

    setTextInput('');
    addMessage('user', text);
    setIsProcessing(true);

    try {
      const res = await fetch(`${VOICE_AI_URL}/api/pipeline/process-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, text, language: 'ta' }),
      });
      const data = await res.json();

      if (data.text) {
        addMessage('ai', data.text);
        if (data.audioBase64) playAudio(data.audioBase64);
        else speak(data.text);
      }
    } catch (err) {
      addMessage('ai', '⚠️ Server error. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Voice Button (always visible) */}
      <button
        onClick={openVoiceChat}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform animate-bounce"
        aria-label="Voice Order"
      >
        <Mic size={24} className="text-white" />
      </button>

      {/* Voice Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md h-[85vh] sm:h-[80vh] bg-gradient-to-b from-indigo-900 to-purple-900 sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slide-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Volume2 size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Voice Order</h3>
                  <p className="text-white/60 text-xs">Speak Tamil, English or Tanglish</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 bg-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🤖</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'ai' 
                      ? 'bg-white/90 text-gray-800 rounded-bl-md' 
                      : 'bg-indigo-500/80 text-white rounded-br-md'
                  }`}>
                    {msg.text}
                    <div className={`text-[10px] mt-1 ${msg.role === 'ai' ? 'text-gray-400' : 'text-white/60'}`}>
                      {msg.time}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-pink-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">👤</span>
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-indigo-500/30 rounded-full flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div className="bg-white/90 px-3 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Controls */}
            <div className="border-t border-white/10 px-4 py-3 space-y-3">
              {/* Mic Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
                      : isProcessing 
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30 hover:scale-105'
                  }`}
                >
                  {isRecording ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
                </button>
              </div>
              <p className="text-center text-white/50 text-xs">
                {isRecording ? '🔴 Recording... tap to stop' : isProcessing ? '⏳ Processing...' : 'Tap mic or type below'}
              </p>

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendText()}
                  placeholder="Type your order here..."
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder:text-white/40 outline-none focus:border-white/40"
                />
                <button
                  onClick={sendText}
                  disabled={isProcessing || !textInput.trim()}
                  className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 transition disabled:opacity-50"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
