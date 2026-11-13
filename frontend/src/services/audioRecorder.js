/**
 * AudioRecorder Service
 * Captures microphone input and converts float32 audio stream to 16,000 Hz 16-bit Mono Linear PCM chunks
 * Ready to stream directly to FastAPI / Gnani Prisma v3.0 WebSocket
 */

export class AudioRecorder {
  constructor({ sampleRate = 16000, bufferSize = 4096 } = {}) {
    this.targetSampleRate = sampleRate;
    this.bufferSize = bufferSize;
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.analyserNode = null;
    this.isRecording = false;
  }

  async start(onAudioChunk, onError) {
    try {
      if (this.isRecording) return;

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create analyser node for waveform visualization
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.sourceNode.connect(this.analyserNode);

      // Create processor node for capturing raw PCM chunks
      this.processorNode = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);

      const inputSampleRate = this.audioContext.sampleRate;

      this.processorNode.onaudioprocess = (event) => {
        if (!this.isRecording) return;
        const inputData = event.inputBuffer.getChannelData(0);

        // Downsample from browser rate (e.g. 48kHz/44.1kHz) to target 16kHz
        const downsampled = this.downsample(inputData, inputSampleRate, this.targetSampleRate);

        // Convert Float32Array [-1.0, 1.0] to 16-bit Linear PCM ArrayBuffer
        const pcm16Buffer = this.floatTo16BitPCM(downsampled);

        if (onAudioChunk) {
          onAudioChunk(pcm16Buffer);
        }
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.isRecording = true;
    } catch (err) {
      this.stop();
      if (onError) onError(err);
      else console.error('AudioRecorder start failed:', err);
    }
  }

  stop() {
    this.isRecording = false;

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  getAnalyserNode() {
    return this.analyserNode;
  }

  /**
   * Linear interpolation downsampling
   */
  downsample(buffer, inputRate, outputRate) {
    if (outputRate === inputRate) {
      return buffer;
    }
    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  /**
   * Converts Float32 [-1, 1] to Int16 [-32768, 32767] Little-Endian PCM
   */
  floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }
}
