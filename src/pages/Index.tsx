
import { useState } from 'react';
import { CameraCapture } from '@/components/CameraCapture';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compare } from 'lucide-react';

const Index = () => {
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);

  const handleSelfieCaptured = (image: string) => {
    setSelfieImage(image);
    console.log('Selfie captured:', image);
  };

  const handleIdCaptured = (image: string) => {
    setIdImage(image);
    console.log('ID captured:', image);
  };

  const handleCompare = () => {
    console.log('Comparing images...');
    // Add comparison logic here
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-center">ID Verification</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selfie Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Take a Selfie</h2>
            {selfieImage ? (
              <Card className="p-4">
                <img 
                  src={selfieImage} 
                  alt="Captured Selfie" 
                  className="w-full rounded-lg"
                />
                <button
                  onClick={() => setSelfieImage(null)}
                  className="mt-4 w-full p-2 bg-primary text-white rounded-lg"
                >
                  Retake Selfie
                </button>
              </Card>
            ) : (
              <CameraCapture
                onCapture={handleSelfieCaptured}
                type="selfie"
                instruction="Position your face within the frame and ensure good lighting"
              />
            )}
          </div>

          {/* ID Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Scan Your ID</h2>
            {idImage ? (
              <Card className="p-4">
                <img 
                  src={idImage} 
                  alt="Captured ID" 
                  className="w-full rounded-lg"
                />
                <button
                  onClick={() => setIdImage(null)}
                  className="mt-4 w-full p-2 bg-primary text-white rounded-lg"
                >
                  Retake ID Photo
                </button>
              </Card>
            ) : (
              <CameraCapture
                onCapture={handleIdCaptured}
                type="id"
                instruction="Place your ID card within the frame"
              />
            )}
          </div>
        </div>

        {/* Comparison Card */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Verify Identity</h2>
            <p className="text-gray-600">
              Click the button below to compare your selfie with your ID photo
            </p>
            <Button 
              onClick={handleCompare}
              disabled={!selfieImage || !idImage}
              className="w-full sm:w-auto"
            >
              <Compare className="mr-2" />
              Compare Images
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
