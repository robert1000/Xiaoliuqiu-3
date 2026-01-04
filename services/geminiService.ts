
import { GoogleGenAI } from "@google/genai";

export const generateLiuqiuMemory = async (
  base64Image: string,
  mimeType: string,
  scenePrompt: string,
  aspectRatio: string,
  style: string
): Promise<string> => {
  // Always create a new instance to ensure the latest API Key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const systemInstruction = `You are a professional travel photographer specializing in Liuqiu Island, Taiwan.
  Task: Composite the person from the input image into the Liuqiu scene.
  
  1. **Person Processing**:
     - Maintain original person's identity and facial features.
     - Relighting to match the scene ambient light.
     - Natural blending into the environment.
     - Preserve the pose if possible.

  2. **Aesthetics**:
     - Keywords: Turquoise water, Coral reefs, Sea turtles, Sunshine, Tropical island scenery.
     - Style: ${style} Photography.
  
  3. **Technical**:
     - High Definition output.
     - Output exactly ONE image file. No conversational text.`;

  const userPrompt = `Composite the person from the provided image into this Xiao Liu Qiu scene: ${scenePrompt}. 
  Ensure it looks like a high-quality travel memory. 
  The aspect ratio should be ${aspectRatio}.`;

  try {
    // Upgraded to Gemini 3 Pro Image Preview for better quality
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: '1K', // Explicitly set size for Pro model
        }
      },
    });

    // Iterate through parts to find the image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('模型未返回圖片數據。');
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Propagate the specific error message to be handled by the UI
    throw error;
  }
};
