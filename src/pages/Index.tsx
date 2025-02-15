import { useState } from 'react';
import { CameraCapture } from '@/components/CameraCapture';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitCompare, Loader2, RotateCcw } from 'lucide-react';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{
    score: number;
    status: 'success' | 'error' | null;
  }>({ score: 0, status: null });

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

  const getFaceFeatures = (prediction: any): Float32Array => {
    const landmarks = prediction.landmarks || [];
    const features = landmarks.flat();
    return new Float32Array(features);
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
    setComparisonResult({ score: 0, status: null });

    try {
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js initialized');

      // Load BlazeFace model
      const model = await blazeface.load();
      console.log('BlazeFace model loaded');

      // Load images
      const selfieImg = await loadImage(selfieImage);
      const idImg = await loadImage(idImage);
      console.log('Images loaded');

      // Get predictions for both images
      const selfiePrediction = await model.estimateFaces(selfieImg, false);
      const idPrediction = await model.estimateFaces(idImg, false);
      console.log('Face predictions obtained:', { selfiePrediction, idPrediction });

      if (selfiePrediction.length === 0 || idPrediction.length === 0) {
        setComparisonResult({ score: 0, status: 'error' });
        toast.error("No face detected in one or both images. Please try again.");
        return;
      }

      // Extract face features and calculate similarity
      const selfieFeatures = getFaceFeatures(selfiePrediction[0]);
      const idFeatures = getFaceFeatures(idPrediction[0]);
      console.log('Features extracted');

      // Calculate similarity score
      const similarity = calculateSimilarity(selfieFeatures, idFeatures);
      console.log('Similarity calculated:', similarity);

      // Convert to percentage and show result
      const confidenceScore = Math.round(similarity * 100);
      setComparisonResult({ 
        score: confidenceScore, 
        status: confidenceScore >= 80 ? 'success' : 'error' 
      });

    } catch (error) {
      console.error('Comparison error:', error);
      setComparisonResult({ score: 0, status: 'error' });
      toast.error('Error comparing images. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setSelfieImage(null);
    setIdImage(null);
    setComparisonResult({ score: 0, status: null });
    setIsComparing(false);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-center">ID Verification</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              {isComparing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <GitCompare className="mr-2" />
                  Compare Images
                </>
              )}
            </Button>
          </div>
        </Card>

        {(comparisonResult.status || isComparing) && (
          <>
            <Card className="p-6">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">Verification Results</h2>
                
                {isComparing ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">Processing your images...</p>
                    <Progress value={100} className="w-full animate-pulse" />
                  </div>
                ) : comparisonResult.status === 'success' ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-green-600">
                      Identity Verified
                    </p>
                    <p className="text-gray-600">
                      Match confidence: {comparisonResult.score}%
                    </p>
                    <Progress 
                      value={comparisonResult.score} 
                      className="w-full"
                    />
                  </div>
                ) : comparisonResult.status === 'error' && (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-red-600">
                      Verification Failed
                    </p>
                    {comparisonResult.score > 0 && (
                      <>
                        <p className="text-gray-600">
                          Low match confidence: {comparisonResult.score}%
                        </p>
                        <Progress 
                          value={comparisonResult.score} 
                          className="w-full"
                        />
                      </>
                    )}
                    <p className="text-gray-600">
                      Please ensure both images are clear and try again.
                    </p>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="text-center">
              <Button 
                onClick={handleReset}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Application
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
