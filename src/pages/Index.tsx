
import { useState } from 'react';
import { CameraCapture } from '@/components/CameraCapture';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (image: string) => {
    setCapturedImage(image);
    console.log('Image captured:', image);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">ID Verification</h1>
        
        {capturedImage ? (
          <Card className="p-4">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full rounded-lg"
            />
            <button
              onClick={() => setCapturedImage(null)}
              className="mt-4 w-full p-2 bg-primary text-white rounded-lg"
            >
              Take Another Photo
            </button>
          </Card>
        ) : (
          <CameraCapture
            onCapture={handleCapture}
            type="selfie"
            instruction="Position your face within the frame and ensure good lighting"
          />
        )}
      </div>
    </div>
  );
};

export default Index;
