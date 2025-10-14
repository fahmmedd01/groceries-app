'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  className?: string;
}

export function VoiceInput({
  onTranscriptChange,
  onRecordingStateChange,
  className,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser compatibility
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('Voice input is only supported in Chrome and Edge browsers.');
        return;
      }

      // Initialize Speech Recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsProcessing(false);
        setError(null);
        onRecordingStateChange?.(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const combinedTranscript = finalTranscript || interimTranscript;
        setTranscript(combinedTranscript);
        onTranscriptChange(combinedTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'no-speech':
            setError('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            setError('No microphone found. Please ensure your microphone is connected.');
            break;
          case 'not-allowed':
            setError('Microphone permission denied. Please allow access to use voice input.');
            break;
          default:
            setError('An error occurred with voice recognition. Please try again.');
        }
        
        setIsRecording(false);
        onRecordingStateChange?.(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsProcessing(false);
        onRecordingStateChange?.(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptChange, onRecordingStateChange]);

  const toggleRecording = () => {
    if (!isSupported || !recognitionRef.current) {
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsProcessing(true);
    } else {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Microphone Button */}
      <Button
        onClick={toggleRecording}
        disabled={!isSupported || isProcessing}
        size="icon"
        className={cn(
          'h-20 w-20 rounded-full shadow-float transition-all',
          isRecording
            ? 'bg-primary-lime animate-pulse hover:bg-primary-lime-light'
            : isProcessing
            ? 'bg-secondary-lavender'
            : 'bg-dark-charcoal hover:bg-dark-surface'
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        ) : isRecording ? (
          <MicOff className="h-8 w-8 text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </Button>

      {/* Status Text */}
      <div className="text-center">
        {isRecording && (
          <p className="text-sm font-medium text-primary-lime">
            Listening...
          </p>
        )}
        {isProcessing && (
          <p className="text-sm font-medium text-secondary-lavender">
            Processing...
          </p>
        )}
        {!isRecording && !isProcessing && isSupported && (
          <p className="text-sm text-muted-foreground">
            Tap to start voice input
          </p>
        )}
      </div>

      {/* Live Transcript Display */}
      {transcript && (
        <div className="w-full max-w-lg rounded-2xl bg-muted/50 p-4">
          <p className="text-sm italic text-muted-foreground">
            &quot;{transcript}&quot;
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-lg rounded-2xl bg-red-50 border-2 border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isSupported && (
        <div className="w-full max-w-lg rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
          <p className="text-sm text-amber-700">
            Voice input is only supported in Chrome and Edge browsers. Please use text input instead.
          </p>
        </div>
      )}
    </div>
  );
}

