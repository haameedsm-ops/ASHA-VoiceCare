/**
 * VoiceSocket Service
 * Manages WebSocket connection between React frontend and FastAPI / Gnani backend
 * Handles streaming PCM audio chunks, barge-in interruptions, and read-back audio playback.
 */

export class VoiceSocketClient {
  constructor({ url = 'ws://localhost:8000/ws/voice-register', onMessage, onError, onConnect, onClose } = {}) {
    this.url = url;
    this.ws = null;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onConnect = onConnect;
    this.onClose = onClose;
    this.isConnected = false;
    this.currentSpeechUtterance = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          this.isConnected = true;
          if (this.onConnect) this.onConnect();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (this.onMessage) this.onMessage(data);

            // If read-back prompt is ready, play spoken audio
            if (data.event === 'READBACK_READY' && data.readback_text) {
              this.speakReadBack(data.readback_text);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('VoiceSocket connection error:', err);
          if (this.onError) this.onError(err);
          reject(err);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.stopSpeechPlayback();
          if (this.onClose) this.onClose();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  startSession(language = 'hi-IN', beneficiaryId = null) {
    this.sendJson({
      action: 'START_SESSION',
      language,
      beneficiary_id: beneficiaryId,
    });
  }

  sendAudioChunk(arrayBuffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(arrayBuffer);
    }
  }

  stopStream() {
    this.sendJson({ action: 'STOP_STREAM' });
  }

  triggerBargeIn() {
    // 1. Immediately halt local audio playback (<50ms response)
    this.stopSpeechPlayback();

    // 2. Notify backend agent orchestrator
    this.sendJson({ action: 'BARGE_IN' });
  }

  correctField(fieldName, fieldValue) {
    this.sendJson({
      action: 'CORRECT_FIELD',
      corrected_field: fieldName,
      corrected_value: fieldValue,
    });
  }

  confirmRecord() {
    this.sendJson({ action: 'CONFIRM_RECORD' });
  }

  sendJson(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  speakReadBack(text) {
    if (!('speechSynthesis' in window)) return;
    this.stopSpeechPlayback();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clear clinical review
    utterance.pitch = 1.0;
    this.currentSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeechPlayback() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentSpeechUtterance = null;
    }
  }

  disconnect() {
    this.stopSpeechPlayback();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
