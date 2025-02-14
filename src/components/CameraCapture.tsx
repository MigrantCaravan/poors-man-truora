
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (image: string) => void;
  type: 'selfie' | 'id';
  instruction: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  type,
  instruction,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    let stream: MediaStream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: type === 'selfie' ? 'user' : 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [type]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 500);

        const image = canvas.toDataURL('image/jpeg');
        onCapture(image);
      }
    }
  };

  return (
    <div className="relative space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4">
        {type === 'selfie' ? 'Take a Selfie' : 'Scan Your ID'}
      </h2>
      
      <Card className="relative overflow-hidden aspect-[3/4] w-full max-w-sm mx-auto">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {showFlash && (
          <div className="absolute inset-0 bg-white animate-camera-flash" />
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 border-2 border-dashed border-primary/50 m-4 rounded-lg"
        />

        {/* Capture Button */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Button
            onClick={handleCapture}
            disabled={!isReady}
            size="lg"
            className="rounded-full h-16 w-16 p-0 bg-white hover:bg-white/90"
          >
            <div className="rounded-full h-12 w-12 border-4 border-primary flex items-center justify-center">
              <Camera className="h-6 w-6 text-primary" />
            </div>
          </Button>
        </div>

        {/* Instructions Overlay */}
        <div className="absolute top-4 left-0 right-0 text-center">
          <p className="text-sm bg-black/50 text-white py-2 px-4 rounded-full mx-4 backdrop-blur-sm">
            {instruction}
          </p>
        </div>
      </Card>

      {!isReady && (
        <div className="text-center text-sm text-destructive">
          Please allow camera access to continue
        </div>
      )}
    </div>
  );
};
