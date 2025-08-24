'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Question } from '@/types';

interface AudioRecorderProps {
  question: Question;
  onAudioRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export default function AudioRecorder({ question, onAudioRecorded, disabled = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

  const { canReRecord = true, maxDurationMinutes = 5 } = question.audioSettings || {};
  const maxDurationMs = maxDurationMinutes * 60 * 1000;

  // Timer effect for recording duration
  useEffect(() => {
    if (isRecording) {
      recordingStartTime.current = Date.now();
      setRecordingTime(0);
      setTimeLeft(maxDurationMs);
      
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime.current;
        setRecordingTime(elapsed);
        setTimeLeft(Math.max(0, maxDurationMs - elapsed));
        
        // Auto-stop when max duration reached
        if (elapsed >= maxDurationMs) {
          stopRecording();
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(null);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, maxDurationMs]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        onAudioRecorded(blob);
        
        // Stop all tracks to free up the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  }, [onAudioRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioRef.current && audioURL) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioURL]);

  const pauseRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioURL('');
    setIsPlaying(false);
    onAudioRecorded(new Blob());
  }, [onAudioRecorded]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        {!isRecording && !audioBlob && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-white rounded-full"></div>
            Start Recording
          </button>
        )}
        
        {isRecording && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={stopRecording}
              className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-white"></div>
              Stop Recording
            </button>
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span>Recording...</span>
            </div>
            <div className="text-sm text-gray-600">
              {formatTime(recordingTime)} / {formatTime(maxDurationMs)}
            </div>
            {timeLeft !== null && timeLeft < 30000 && (
              <div className="text-sm text-orange-600 font-medium">
                {formatTime(timeLeft)} left
              </div>
            )}
          </div>
        )}
        
        {audioBlob && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isPlaying ? pauseRecording : playRecording}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 flex items-center gap-2"
            >
              {isPlaying ? '⏸️' : '▶️'}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            {canReRecord && (
              <button
                type="button"
                onClick={startRecording}
                className="bg-yellow-500 text-white px-3 py-2 rounded-full hover:bg-yellow-600"
              >
                Re-record
              </button>
            )}
            
            <button
              type="button"
              onClick={clearRecording}
              className="bg-gray-500 text-white px-3 py-2 rounded-full hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      
      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      
      {audioBlob && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
          ✓ Audio recorded successfully ({(audioBlob.size / 1024).toFixed(1)} KB)
        </div>
      )}
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>Max recording time: {maxDurationMinutes} minute{maxDurationMinutes !== 1 ? 's' : ''}</div>
        {!canReRecord && <div>⚠️ Re-recording is disabled for this question</div>}
      </div>
    </div>
  );
}