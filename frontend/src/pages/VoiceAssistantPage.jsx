import React, { useState, useEffect, useRef } from 'react';
import { Mic, RefreshCw, ArrowRight, UserCheck, ShieldCheck, AlertCircle, Volume2, Wifi, WifiOff, ClipboardCheck } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MicButton from '../components/voice/MicButton';
import WaveformVisualizer from '../components/voice/WaveformVisualizer';
import BargeInIndicator from '../components/voice/BargeInIndicator';
import { AudioRecorder } from '../services/audioRecorder';
import { VoiceSocketClient } from '../services/voiceSocket';

export default function VoiceAssistantPage({ onNavigate, selectedLanguage, targetBeneficiary, onExtractionComplete }) {
  // Voice interaction states: 'IDLE', 'LISTENING', 'PROCESSING', 'SPEAKING'
  const [voiceState, setVoiceState] = useState('IDLE');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [readbackText, setReadbackText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  const [micError, setMicError] = useState(null);
  const [chunkCount, setChunkCount] = useState(0);

  const recorderRef = useRef(null);
  const socketRef = useRef(null);
  const [analyserNode, setAnalyserNode] = useState(null);

  useEffect(() => {
    recorderRef.current = new AudioRecorder({ sampleRate: 16000 });

    socketRef.current = new VoiceSocketClient({
      onConnect: () => setConnectionStatus('connected'),
      onClose: () => setConnectionStatus((status) => status === 'error' ? 'error' : 'disconnected'),
      onMessage: (msg) => {
        if (msg.event === 'INTERIM_TRANSCRIPT') {
          setInterimText(msg.transcript);
        } else if (msg.event === 'FINAL_TRANSCRIPT') {
          setTranscript(msg.transcript);
          setInterimText('');
        } else if (msg.event === 'FIELDS_EXTRACTED') {
          setExtractedData(msg.extracted_data);
          if (msg.safety_alerts) setSafetyAlerts(msg.safety_alerts);
          if (onExtractionComplete) {
            onExtractionComplete({
              extracted: msg.extracted_data,
              alerts: msg.safety_alerts || [],
              transcript: msg.transcript || transcript
            });
          }
        } else if (msg.event === 'READBACK_READY') {
          setReadbackText(msg.readback_text);
          setVoiceState('SPEAKING');
        } else if (msg.event === 'BARGE_IN_CONFIRMED') {
          setVoiceState('LISTENING');
        }
      },
      onError: (err) => {
        console.warn('Voice service WebSocket connection failed:', err);
        setConnectionStatus('error');
      }
    });

    return () => {
      if (recorderRef.current) recorderRef.current.stop();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const startAudioCapture = async () => {
    await recorderRef.current.start(
        (pcmChunk) => {
          setChunkCount((prev) => prev + 1);
          if (socketRef.current && socketRef.current.isConnected) {
            socketRef.current.sendAudioChunk(pcmChunk);
          }
        },
        (err) => {
          console.warn('Microphone permission error:', err);
          setMicError('Microphone permission denied or the recording device is busy.');
        }
      );

    setAnalyserNode(recorderRef.current.getAnalyserNode());
    setVoiceState('LISTENING');
  };

  const startVoiceRecording = async () => {
    setMicError(null);
    setInterimText('');
    setReadbackText('');
    setChunkCount(0);

    const benId = targetBeneficiary ? targetBeneficiary.id : 'BEN-102';

    try {
      if (!socketRef.current.isConnected) {
        setConnectionStatus('connecting');
        await socketRef.current.connect();
      }
      socketRef.current.startSession(selectedLanguage, benId);
    } catch (err) {
      setConnectionStatus('error');
      console.info('Voice service is unavailable; audio will not be sent to the backend.');
    }

    try {
      await startAudioCapture();
    } catch (err) {
      setMicError(err.message || 'Microphone error');
    }
  };

  const stopVoiceRecording = () => {
    if (recorderRef.current) recorderRef.current.stop();
    setInterimText('');
    setVoiceState('PROCESSING');

    if (socketRef.current && socketRef.current.isConnected) {
      socketRef.current.stopStream();
    }
  };

  const handleInterrupt = () => {
    if (socketRef.current) {
      socketRef.current.triggerBargeIn();
    }
    setMicError(null);
    startAudioCapture().catch((err) => {
      setMicError(err.message || 'Microphone error');
      setVoiceState('IDLE');
    });
  };

  const handleProceedToVerification = () => {
    if (onExtractionComplete && extractedData) {
      onExtractionComplete({
        extracted: extractedData,
        alerts: safetyAlerts,
        transcript: transcript
      });
    }
    onNavigate('verification');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 border-b border-health-cardBorder pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-health-deepGreen">
            <Mic className="h-4 w-4" />
            Visit workflow · Step 1 of 2
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-health-navy sm:text-3xl">Voice Field Register</h1>
          <p className="mt-1.5 text-sm text-health-navyLight">
            Capture household-visit observations by voice and review the available transcript.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={connectionStatus === 'connected' ? 'success' : connectionStatus === 'error' ? 'danger' : 'neutral'}>
            {connectionStatus === 'connected' ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>
              {connectionStatus === 'connected'
                ? 'Voice service connected'
                : connectionStatus === 'connecting'
                ? 'Connecting…'
                : connectionStatus === 'error'
                ? 'Voice service unavailable'
                : 'Voice service not connected'}
            </span>
          </Badge>
          <Badge variant={voiceState === 'LISTENING' ? 'danger' : voiceState === 'SPEAKING' ? 'warning' : 'neutral'}>
            <span className={`h-2 w-2 rounded-full ${voiceState === 'LISTENING' ? 'animate-pulse bg-rose-500' : voiceState === 'SPEAKING' ? 'animate-pulse bg-amber-500' : 'bg-slate-400'}`} />
            <span>{voiceState === 'IDLE' ? 'Ready' : voiceState}</span>
          </Badge>
          <Badge variant="default">Lang: {selectedLanguage}</Badge>
        </div>
      </div>

      {targetBeneficiary && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-health-cardBorder bg-health-lightMint/60 p-4">
          <div className="flex items-center gap-2.5">
            <UserCheck className="h-5 w-5 shrink-0 text-health-deepGreen" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-health-navyLight">Selected beneficiary</span>
                <span className="text-sm font-bold text-health-navy">{targetBeneficiary.name}</span>
                <Badge variant="royal" size="sm">{targetBeneficiary.id}</Badge>
              </div>
              <p className="text-[11px] text-health-navyLight mt-0.5">
                {targetBeneficiary.categoryDetail} • Prev Weight: {targetBeneficiary.currentWeight} kg
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('beneficiaries')}
            className="shrink-0 text-xs font-semibold text-health-deepGreen hover:underline"
          >
            Switch
          </button>
        </div>
      )}

      {micError && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
          <span>{micError}</span>
        </div>
      )}

      {connectionStatus === 'error' && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Voice service unavailable.</strong> Microphone capture can still start, but audio will only be sent when the service is connected. No transcript is generated locally.
          </p>
        </div>
      )}

      <Card className="overflow-hidden border-health-cardBorder p-0">
        <div className="border-b border-health-cardBorder bg-health-offWhite px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-health-deepGreen text-xs font-bold text-white">1</span>
            <h2 className="text-sm font-semibold text-health-navy">Record household visit</h2>
          </div>
          <p className="mt-1 pl-9 text-xs text-health-navyLight">Tap the microphone to begin recording. Tap again to stop.</p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-5 px-5 py-8 text-center sm:px-8 sm:py-10">
        <BargeInIndicator
          isSpeaking={voiceState === 'SPEAKING'}
          onInterrupt={handleInterrupt}
        />

        <div className="py-2">
          <MicButton
            state={voiceState}
            onClick={voiceState === 'LISTENING' ? stopVoiceRecording : startVoiceRecording}
            onInterrupt={handleInterrupt}
          />
        </div>

        <WaveformVisualizer
          isRecording={voiceState === 'LISTENING'}
          isSpeaking={voiceState === 'SPEAKING'}
          analyserNode={analyserNode}
        />

        {voiceState === 'LISTENING' && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
            <span>Captured PCM Chunks: <strong>{chunkCount}</strong></span>
            <span>•</span>
            <span>Sample Rate: 16,000 Hz</span>
            <span>•</span>
            <span>Encoding: Linear PCM 16-bit Mono</span>
          </div>
        )}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-health-cardBorder pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-health-lightMint text-health-deepGreen">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-health-navy">Visit transcript</h2>
              <p className="mt-0.5 text-xs text-health-navyLight">Review captured speech before proceeding.</p>
            </div>
            <span className="sr-only">
              Voice Transcript
            </span>
          </div>
          {transcript && (
            <button
              onClick={() => {
                setTranscript('');
                setInterimText('');
                setReadbackText('');
                setExtractedData(null);
                setVoiceState('IDLE');
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-health-navyLight transition hover:bg-health-offWhite hover:text-health-navy"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="relative min-h-32 rounded-lg border border-health-cardBorder bg-health-offWhite p-4 text-sm leading-6 text-health-charcoal">
          {transcript ? (
            <div>
              <span>{transcript}</span>
              {interimText && (
                <span className="ml-1 rounded bg-health-lightMint px-1 font-semibold text-health-deepGreen">
                  {interimText}...
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-xs italic text-slate-500">
              <Mic className="mb-2 h-6 w-6 text-health-deepGreen/60" />
              <span>Captured speech will appear here after the voice service responds.</span>
              <span className="mt-1 text-[11px] not-italic text-slate-400">
                E.g.: "Today I visited beneficiary 102. Baby weight is 2.8 kilograms. Next visit 15 December."
              </span>
            </div>
          )}
        </div>

        {/* Readback announcement if available */}
        {readbackText && (
          <div className="space-y-1 rounded-lg border border-health-cardBorder bg-health-lightMint/50 p-3 text-xs text-health-navy">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-health-deepGreen">
              <Volume2 className="h-3.5 w-3.5" />
              <span>Visit Read-Back</span>
            </div>
            <p className="italic font-sans">"{readbackText}"</p>
          </div>
        )}

        {transcript && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-health-cardBorder pt-4 sm:flex-row">
            <span className="flex items-center gap-1.5 text-xs font-medium text-health-deepGreen">
              <ShieldCheck className="h-4 w-4" />
              <span>Transcript available. Review extracted fields before saving.</span>
            </span>
            <button
              onClick={handleProceedToVerification}
              className="health-button-primary w-full py-2 text-xs sm:w-auto"
            >
              <span>Extract & Verify Visit Fields</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
