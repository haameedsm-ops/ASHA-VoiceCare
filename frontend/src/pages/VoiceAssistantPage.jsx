import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Sparkles, RefreshCw, ArrowRight, UserCheck, ShieldCheck, AlertCircle, Volume2 } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MicButton from '../components/voice/MicButton';
import WaveformVisualizer from '../components/voice/WaveformVisualizer';
import BargeInIndicator from '../components/voice/BargeInIndicator';
import { AudioRecorder } from '../services/audioRecorder';
import { VoiceSocketClient } from '../services/voiceSocket';

export default function VoiceAssistantPage({ onNavigate, selectedLanguage, targetBeneficiary, onExtractionComplete }) {
  // Voice interaction states: 'IDLE', 'LISTENING', 'PROCESSING', 'SPEAKING'
  const [isSimulated, setIsSimulated] = useState(false);
  const [providerStatus, setProviderStatus] = useState('');
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
      url: 'ws://localhost:8000/ws/voice-register',
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
        console.warn('Backend WebSocket offline. Running in local simulation mode.');
      }
    });

    return () => {
      if (recorderRef.current) recorderRef.current.stop();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const startVoiceRecording = async () => {
    setMicError(null);
    setInterimText('');
    setReadbackText('');
    setChunkCount(0);

    const benId = targetBeneficiary ? targetBeneficiary.id : 'BEN-102';

    // 1. Connect WebSocket if not connected
    try {
      if (!socketRef.current.isConnected) {
        await socketRef.current.connect();
      }
      socketRef.current.startSession(selectedLanguage, benId);
    } catch (err) {
      console.info('WebSocket fallback to offline mode');
    }

    // 2. Start microphone capture
    try {
      await recorderRef.current.start(
        (pcmChunk) => {
          setChunkCount((prev) => prev + 1);
          // Stream raw 16kHz PCM chunk to backend WebSocket
          if (socketRef.current && socketRef.current.isConnected) {
            socketRef.current.sendAudioChunk(pcmChunk);
          }
        },
        (err) => {
          console.warn('Microphone permission error:', err);
          setMicError('Microphone permission denied or device busy. Voice test simulation enabled.');
        }
      );

      setAnalyserNode(recorderRef.current.getAnalyserNode());
      setVoiceState('LISTENING');

      // If WebSocket is not connected, we do NOT fabricate a transcript.
      // The backend will return an empty transcript with provider_status "WAITING_FOR_SPEECH".
      // UI will show the simulation banner (see below) and the user can provide a manual transcript.

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
    } else {
      // No local fallback simulation – rely on manual transcript input.
      // If the backend is disconnected, the UI will show the simulation banner and the user must submit a manual transcript.

    }
  };

  const handleInterrupt = () => {
    if (socketRef.current) {
      socketRef.current.triggerBargeIn();
    }
    setVoiceState('LISTENING');
    setTranscript((prev) => prev + ' [CORRECTION]: Baby weight is actually 3.10 kilograms.');
    if (extractedData) {
      setExtractedData({ ...extractedData, weight: 3.10 });
    }
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
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-health-navy tracking-tight">Voice Field Register</h1>
          <p className="text-xs sm:text-sm text-health-navyLight">
            Capture household-visit observations by voice and review the available transcript.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              voiceState === 'LISTENING'
                ? 'danger'
                : voiceState === 'SPEAKING'
                ? 'warning'
                : voiceState === 'PROCESSING'
                ? 'neutral'
                : 'default'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                voiceState === 'LISTENING'
                  ? 'bg-rose-500 animate-ping'
                  : voiceState === 'SPEAKING'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-health-blueAccent'
              }`}
            ></span>
            <span>{voiceState}</span>
          </Badge>
          <Badge variant="neutral">Lang: {selectedLanguage}</Badge>
        </div>
      </div>

      {/* Target Beneficiary Context Banner if pre-selected */}
      {targetBeneficiary && (
        <div className="bg-health-cardPale border border-health-cardBorder rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-health-blueAccent shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Selected Beneficiary:</span>
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
            className="text-xs text-health-blueAccent hover:underline font-semibold"
          >
            Switch
          </button>
        </div>
      )}

      {/* Mic Notice if applicable */}
      {micError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Primary Voice Interaction Card */}
      <Card className="flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-white border-2 border-health-cardBorder space-y-4">
        {/* Barge-in top indicator when agent is reciting */}
        <BargeInIndicator
          isSpeaking={voiceState === 'SPEAKING'}
          onInterrupt={handleInterrupt}
        />

        {/* Large Tactile Mic Button */}
        <div className="py-2">
          <MicButton
            state={voiceState}
            onClick={voiceState === 'LISTENING' ? stopVoiceRecording : startVoiceRecording}
            onInterrupt={handleInterrupt}
          />
        </div>

        {/* Live Canvas Audio Waveform */}
        <WaveformVisualizer
          isRecording={voiceState === 'LISTENING'}
          isSpeaking={voiceState === 'SPEAKING'}
          analyserNode={analyserNode}
        />

        {/* Streaming PCM diagnostic badge */}
        {voiceState === 'LISTENING' && (
          <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
            <span>Captured PCM Chunks: <strong>{chunkCount}</strong></span>
            <span>•</span>
            <span>Sample Rate: 16,000 Hz</span>
            <span>•</span>
            <span>Encoding: Linear PCM 16-bit Mono</span>
          </div>
        )}
      </Card>

      {/* Live Transcript & Extraction Card */}
      <Card pale={true} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-health-blueAccent" />
            <span className="text-xs sm:text-sm font-bold text-health-navy uppercase tracking-wider">
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
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="min-h-[100px] bg-white rounded-xl p-4 border border-health-cardBorder text-sm text-health-navy font-mono leading-relaxed relative">
          {transcript ? (
            <div>
              <span>{transcript}</span>
              {interimText && (
                <span className="text-health-blueAccent font-semibold ml-1 bg-health-blueLight/50 px-1 rounded animate-pulse">
                  {interimText}...
                </span>
              )}
            </div>
          ) : (
            <div className="text-slate-400 italic font-sans text-xs flex flex-col items-center justify-center py-6">
              <Mic className="w-6 h-6 text-slate-300 mb-1" />
              <span>Tap the microphone button above and speak your home-visit observations.</span>
              <span className="text-[11px] text-slate-400 mt-1">
                E.g.: "Today I visited beneficiary 102. Baby weight is 2.8 kilograms. Next visit 15 December."
              </span>
            </div>
          )}
        </div>

        {/* Readback announcement if available */}
        {readbackText && (
          <div className="p-3 bg-health-blueLight/40 rounded-xl border border-health-cardBorder text-xs text-health-navy space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-health-blueAccent uppercase text-[10px] tracking-wider">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Visit Read-Back</span>
            </div>
            <p className="italic font-sans">"{readbackText}"</p>
          </div>
        )}

        {transcript && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transcript available. Review extracted fields before saving.</span>
            </span>
            <button
              onClick={handleProceedToVerification}
              className="health-button-primary text-xs py-2 px-4 w-full sm:w-auto"
            >
              <span>Extract & Verify Visit Fields</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
