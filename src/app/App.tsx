'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from './components/ChatInterface';
import { InputArea } from './components/InputArea';
import { TeachingCanvas } from './components/TeachingCanvas';
import { ThemeToggle } from './components/ThemeToggle';
import { MessageHistory } from './components/MessageHistory';
import { generateTeachingResponse, getQuickResponse } from './components/mockTeacher';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTeaching, setIsTeaching] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const teachingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (teachingTimeoutRef.current) {
        clearTimeout(teachingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = (content: string) => {
    if (isTeaching && teachingTimeoutRef.current) {
      clearTimeout(teachingTimeoutRef.current);
      setIsTeaching(false);

      const interruptMessage: Message = {
        id: Date.now().toString() + 'interrupt',
        role: 'assistant',
        content: "Of course! Let me pause and answer your question.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, interruptMessage]);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const quickResponse = getQuickResponse(content);
      const aiQuickMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: quickResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiQuickMessage]);

      setTimeout(() => {
        startTeaching(content);
      }, 1000);
    }, 500);
  };

  const startTeaching = (userMessage: string) => {
    const teachingSteps = generateTeachingResponse(userMessage);
    setIsTeaching(true);

    let stepIndex = 0;
    const executeStep = () => {
      if (stepIndex < teachingSteps.length) {
        const step = teachingSteps[stepIndex];
        setCurrentStep(step.canvasContent);

        const aiStepMessage: Message = {
          id: Date.now().toString() + stepIndex,
          role: 'assistant',
          content: step.explanation,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiStepMessage]);

        stepIndex++;
        teachingTimeoutRef.current = window.setTimeout(executeStep, step.duration);
      } else {
        setIsTeaching(false);
        teachingTimeoutRef.current = null;
        const finalMessage: Message = {
          id: Date.now().toString() + 'final',
          role: 'assistant',
          content: "That's the complete explanation! Do you have any questions, or would you like me to explain anything again?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, finalMessage]);
      }
    };

    executeStep();
  };

  return (
    <div className="size-full flex flex-col relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-20 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🧮</div>
          <div>
            <h1 className="text-3xl">Math Teacher AI</h1>
            <p className="text-sm text-muted-foreground">Making complex math simple</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {messages.length === 0 ? (
        <div className="size-full flex flex-col items-center justify-center px-8 pt-20">
          <div className="w-full max-w-3xl space-y-12">
            <div className="text-center space-y-6">
              <div className="text-8xl mb-4">📐</div>
              <h2 className="text-4xl">Welcome to your AI Math Teacher!</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Ask me to teach you any math topic or paste a problem you'd like to solve together.
              </p>
            </div>
            <InputArea onSendMessage={handleSendMessage} disabled={false} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 pt-20 pb-2 relative">
            <TeachingCanvas
              isTeaching={isTeaching}
              currentStep={currentStep}
            />
          </div>

          {isTeaching && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 px-6 py-3 bg-green-500/90 backdrop-blur-md text-white rounded-full shadow-lg border border-green-400 flex items-center gap-3">
              <div className="animate-pulse text-xl">●</div>
              <span className="text-lg">Teaching in progress... Feel free to interrupt!</span>
            </div>
          )}

          <MessageHistory messages={messages} />

          <div className="absolute bottom-0 left-0 right-0 z-20 bg-card/80 backdrop-blur-md border-t border-border p-4">
            <div className="max-w-4xl mx-auto">
              <InputArea onSendMessage={handleSendMessage} disabled={false} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}