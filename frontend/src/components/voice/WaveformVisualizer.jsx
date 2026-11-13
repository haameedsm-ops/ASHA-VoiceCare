import React, { useEffect, useRef } from 'react';

/**
 * Live audio visualizer rendering a responsive canvas waveform
 * driven by Web Audio API AnalyserNode or an animated synthetic frequency pattern
 */
export default function WaveformVisualizer({ isRecording, isSpeaking, analyserNode }) {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!isRecording && !isSpeaking) {
        // Flat baseline with subtle idle pulse
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#CBD5E1'; // Slate 300
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      if (analyserNode && isRecording) {
        // Real-time microphone frequency data
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#1D4ED8'; // Royal Blue Accent
        ctx.beginPath();

        const sliceWidth = (width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Simulated responsive acoustic wave (speaking read-back or fallback)
        phase += 0.08;
        const color = isSpeaking ? '#059669' : '#1D4ED8'; // Emerald if agent speaking, Blue if recording
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const freq = 0.025;
          const amp = isSpeaking ? 18 : 24;
          const y = height / 2 + Math.sin(x * freq + phase) * Math.cos(phase * 0.5) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRecording, isSpeaking, analyserNode]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={480}
        height={64}
        className="w-full max-w-md h-16 rounded-xl bg-slate-50 border border-health-cardBorder"
      />
      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-health-blueAccent animate-pulse' : 'bg-slate-300'}`}></span>
          <span>Mic Input (16kHz PCM)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
          <span>Gnani Timbre Audio</span>
        </span>
      </div>
    </div>
  );
}
