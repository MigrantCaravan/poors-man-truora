
import { useState } from 'react';
import { CameraCapture } from '@/components/CameraCapture';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitCompare } from 'lucide-react';
import * as blazeface from '@tensorflow-models/blazeface';
import { toast } from 'sonner';

const Index = () => {
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleSelfieCaptured = (image: string) => {
    setSelfieImage(image);
    console.log('Selfie captured:', image);
  };

  const handleIdCaptured = (image: string) => {
    setIdImage(image);
    console.log('ID captured:', image);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const calculateSimilarity = (features1: Float32Array, features2: Float32Array): number => {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < features1.length; i++) {
      dotProduct += features1[i] * features2[i];
      norm1 += features1[i] * features1[i];
      norm2 += features2[i] * features2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  };

  const handleCompare = async () => {
    if (!selfieImage || !idImage) return;
    
    setIsComparing(true);
    try {
      // Load BlazeFace model
      const model = await blazeface.load();

      // Load images
      const selfieImg = await loadImage(selfieImage);
      const idImg = await loadImage(idImage);

      // Get predictions for both images
      const selfiePrediction = await model.estimateFaces(selfieImg, false);
      const idPrediction = await model.estimateFaces(idImg, false);

      if (selfiePrediction.length === 0 || idPrediction.length === 0) {
        toast.error("No face detected in one or both images. Please try again.");
        return;
      }

      // Calculate similarity score
      const similarity = calculateSimilarity(
        new Float32Array(selfiePrediction[0].probability),
        new Float32Array(idPrediction[0].probability)
      );

      // Convert to percentage and show result
      const confidenceScore = Math.round(similarity * 100);
      
      if (confidenceScore >= 80) {
        toast.success(`Match confidence: ${confidenceScore}%`);
      } else {
        toast.error(`Low match confidence: ${confidenceScore}%`);
      }

    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Error comparing images. Please try again.');
    } finally {
      setIsComparing(false);
    }
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
              disabled={!selfieImage || !idImage || isComparing}
              className="w-full sm:w-auto"
            >
              <GitCompare className={`mr-2 ${isComparing ? 'animate-spin' : ''}`} />
              {isComparing ? 'Comparing...' : 'Compare Images'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
