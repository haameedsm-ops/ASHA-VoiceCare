import React, { useEffect, useRef } from 'react';

/**
 * Live audio visualizer driven by the microphone's Web Audio API analyser.
 */
export default function WaveformVisualizer({ isRecording, isSpeaking, analyserNode }) {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!isRecording && !isSpeaking) {
        // Flat baseline with subtle idle pulse
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#D6E4DC';
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
        ctx.strokeStyle = '#176B4D';
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
      }

      if (isRecording && analyserNode) {
        animationFrameId.current = requestAnimationFrame(render);
      }
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
        className="h-16 w-full max-w-md rounded-lg border border-health-cardBorder bg-health-offWhite"
      />
      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${isRecording ? 'animate-pulse bg-health-deepGreen' : 'bg-slate-300'}`}></span>
          <span>Microphone signal</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${isSpeaking ? 'animate-pulse bg-amber-500' : 'bg-slate-300'}`}></span>
          <span>Read-back {isSpeaking ? 'active' : 'inactive'}</span>
        </span>
      </div>
    </div>
  );
}
