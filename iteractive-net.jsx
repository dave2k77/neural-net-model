import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const NeuralNetworkVisualization = () => {
  // Larger network architecture
  const layers = [6, 8, 8, 4];
  const maxRadius = 16; // Slightly smaller neurons
  
  const [weights, setWeights] = useState(null);
  const [activations, setActivations] = useState(null);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
  
  // Initialize weights and activations
  useEffect(() => {
    const initWeights = [];
    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights = Array(layers[i]).fill(0).map(() => 
        Array(layers[i + 1]).fill(0).map(() => Math.random() * 2 - 1)
      );
      initWeights.push(layerWeights);
    }
    setWeights(initWeights);

    const initActivations = layers.map(size => Array(size).fill(0.5));
    setActivations(initActivations);
  }, []);

  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  const toggleNeuron = (layerIndex, neuronIndex) => {
    if (!activations) return;
    
    const newActivations = [...activations];
    newActivations[layerIndex] = [...activations[layerIndex]];
    newActivations[layerIndex][neuronIndex] = 
      activations[layerIndex][neuronIndex] > 0.5 ? 0 : 1;
    setActivations(newActivations);
  };

  useEffect(() => {
    if (!weights || !activations || !animationEnabled) return;

    const timer = setInterval(() => {
      setAnimationStep((prev) => {
        if (prev >= layers.length - 1) return 0;
        
        const newActivations = [...activations];
        const currentLayer = prev;
        const nextLayer = currentLayer + 1;
        
        for (let j = 0; j < layers[nextLayer]; j++) {
          let sum = 0;
          for (let i = 0; i < layers[currentLayer]; i++) {
            sum += activations[currentLayer][i] * weights[currentLayer][i][j];
          }
          newActivations[nextLayer][j] = sigmoid(sum);
        }
        
        setActivations(newActivations);
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [weights, activations, animationEnabled]);

  const resetNetwork = () => {
    const newActivations = layers.map(size => Array(size).fill(0.5));
    setActivations(newActivations);
    setAnimationStep(0);
  };

  const randomizeWeights = () => {
    const newWeights = weights.map(layer =>
      layer.map(neuron =>
        neuron.map(() => Math.random() * 2 - 1)
      )
    );
    setWeights(newWeights);
  };

  if (!weights || !activations) return <div>Loading...</div>;

  // Calculate layer positions with more horizontal spacing
  const layerSpacing = 220; // Increased horizontal spacing
  const getNeuronX = (layerIndex) => (layerIndex + 1) * layerSpacing;
  const getNeuronY = (layerSize, neuronIndex) => 250 + (neuronIndex - (layerSize - 1) / 2) * 60; // Increased vertical spacing

  return (
    <div className="w-full max-w-6xl p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Interactive Neural Network</h2>
          <div className="space-x-2">
            <Button 
              onClick={() => setAnimationEnabled(!animationEnabled)}
              variant={animationEnabled ? "default" : "outline"}
            >
              {animationEnabled ? "Pause" : "Resume"} Animation
            </Button>
            <Button onClick={resetNetwork} variant="outline">
              Reset Neurons
            </Button>
            <Button onClick={randomizeWeights} variant="outline">
              Randomize Weights
            </Button>
          </div>
        </div>
        
        <svg viewBox="0 0 1200 500" className="w-full">
          {/* Draw connections first so they appear behind neurons */}
          {layers.map((layerSize, layerIndex) => {
            if (layerIndex === layers.length - 1) return null;
            
            const nextLayerSize = layers[layerIndex + 1];
            
            return Array(layerSize).fill(0).map((_, i) => {
              const startX = getNeuronX(layerIndex);
              const startY = getNeuronY(layerSize, i);
              
              return Array(nextLayerSize).fill(0).map((_, j) => {
                const endX = getNeuronX(layerIndex + 1);
                const endY = getNeuronY(nextLayerSize, j);
                const weight = weights[layerIndex][i][j];
                const isActive = animationEnabled && animationStep === layerIndex;
                
                // Calculate control points for curved lines
                const controlX1 = startX + (endX - startX) * 0.4;
                const controlX2 = startX + (endX - startX) * 0.6;
                
                return (
                  <path
                    key={`${layerIndex}-${i}-${j}`}
                    d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`}
                    stroke={weight > 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)'}
                    strokeWidth={Math.abs(weight) * 2.5}
                    fill="none"
                    className={isActive ? 'animate-pulse' : ''}
                  />
                );
              });
            });
          })}
          
          {/* Draw neurons on top of connections */}
          {layers.map((layerSize, layerIndex) => {
            return Array(layerSize).fill(0).map((_, i) => {
              const x = getNeuronX(layerIndex);
              const y = getNeuronY(layerSize, i);
              const activation = activations[layerIndex][i];
              const radius = maxRadius * activation;
              
              return (
                <g 
                  key={`${layerIndex}-${i}`}
                  onClick={() => toggleNeuron(layerIndex, i)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={maxRadius}
                    fill="white"
                    stroke="gray"
                    strokeWidth="2"
                    className="hover:stroke-blue-500"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill="rgb(59, 130, 246)"
                    className="transition-all duration-300"
                  />
                  <text
                    x={x}
                    y={y + 32}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {activation.toFixed(2)}
                  </text>
                </g>
              );
            });
          })}
        </svg>
        
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium">Instructions:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Click any neuron to toggle its activation (0 or 1)</li>
            <li>Use the controls above to pause/resume animation, reset neurons, or randomize weights</li>
            <li>Blue curves show positive weights, red curves show negative weights</li>
            <li>Curve thickness indicates weight magnitude</li>
            <li>Circle fill shows neuron activation (0-1)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkVisualization;
