import { useState } from 'react';
import { Mic, Send, Square } from 'lucide-react';
import { motion } from 'motion/react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function InputArea({ onSendMessage, disabled }: InputAreaProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        onSendMessage("I'd like to learn about quadratic equations");
      }, 2000);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-shrink-0 p-4 rounded-full transition-all shadow-lg ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-accent hover:bg-accent/80 text-accent-foreground'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </motion.button>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask me anything about math or paste a problem..."
              disabled={disabled}
              className="w-full px-6 py-4 bg-card rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-ring text-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-border"
              rows={1}
              style={{ maxHeight: '150px', minHeight: '60px' }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!input.trim() || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 p-4 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </div>

        {isRecording && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-red-500 mt-3 text-center"
          >
            🎤 Recording... (Demo mode)
          </motion.p>
        )}
      </form>
    </div>
  );
}
