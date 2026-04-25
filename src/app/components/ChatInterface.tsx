import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
}

export function ChatInterface({ messages }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
          <div className="text-6xl">📐</div>
          <p className="text-2xl text-center">Welcome to your AI Math Teacher!</p>
          <p className="text-lg text-center max-w-md">
            Ask me to teach you any math topic or paste a problem you'd like to solve together.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                message.role === 'user'
                  ? 'bg-[var(--chat-bubble-user)] border border-border'
                  : 'bg-[var(--chat-bubble-ai)] border border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{message.role === 'user' ? '🧑‍🎓' : '👨‍🏫'}</div>
                <div className="flex-1">
                  <p className="text-xl whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
