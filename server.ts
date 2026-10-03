import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Multi-turn Chat Endpoint (gemini-3.5-flash / gemini-3.1-pro-preview)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, model = 'gemini-3.5-flash', systemInstruction } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const response = await ai.models.generateContent({
      model,
      contents: messages,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are J.A.R.V.I.S., the advanced cybernetic AI system assistant. Answer with technical precision, futuristic composure, and deep system analysis.',
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Error processing AI chat' });
  }
});

// 2. Search Grounding Endpoint (gemini-3.5-flash with googleSearch)
app.post('/api/ai/search', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract search grounding metadata
    const searchChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        web: chunk.web,
      })) || [];

    res.json({
      text: response.text,
      sources: searchChunks,
    });
  } catch (error: any) {
    console.error('Search Grounding Error:', error);
    res.status(500).json({ error: error.message || 'Error executing Google Search grounding' });
  }
});

// 3. Maps Grounding Endpoint (gemini-3.5-flash with googleMaps)
app.post('/api/ai/maps', async (req: Request, res: Response) => {
  try {
    const { prompt, latitude, longitude } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const contents = latitude && longitude
      ? `User location: Lat ${latitude}, Lon ${longitude}. User query: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Maps Grounding Error:', error);
    res.status(500).json({ error: error.message || 'Error executing Google Maps grounding' });
  }
});

// 4. Audio Transcription Endpoint (gemini-3.5-transcribe)
app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: 'audioBase64 string is required' });
      return;
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: { parts: [audioPart, { text: 'Transcribe this audio recording precisely.' }] },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Transcription Error:', error);
    res.status(500).json({ error: error.message || 'Error transcribing audio' });
  }
});

// 5. Image Generation & Editing (gemini-3.1-flash-lite-image / gemini-3.1-flash-image)
app.post('/api/ai/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, base64Image, mimeType = 'image/png', aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const parts: any[] = [];
    if (base64Image) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType,
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    let imageUrl = '';
    let textOutput = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textOutput += part.text;
        }
      }
    }

    res.json({ imageUrl, text: textOutput });
  } catch (error: any) {
    console.error('Image Generation Error:', error);
    res.status(500).json({ error: error.message || 'Error generating image' });
  }
});

// 6. Music Generation (lyria-3-clip-preview)
app.post('/api/ai/generate-music', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const response = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: prompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    res.json({
      audioBase64,
      mimeType,
      lyrics,
    });
  } catch (error: any) {
    console.error('Music Generation Error:', error);
    res.status(500).json({ error: error.message || 'Error generating music' });
  }
});

// 7. Video Generation (veo-3.1-lite-generate-preview)
app.post('/api/ai/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, base64Image, aspectRatio = '16:9' } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const payload: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio,
      },
    };

    if (base64Image) {
      payload.image = {
        imageBytes: base64Image,
        mimeType: 'image/png',
      };
    }

    const operation = await ai.models.generateVideos(payload);
    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Video Generation Error:', error);
    res.status(500).json({ error: error.message || 'Error starting video generation' });
  }
});

app.post('/api/ai/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required' });
      return;
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done });
  } catch (error: any) {
    console.error('Video Status Error:', error);
    res.status(500).json({ error: error.message || 'Error polling video status' });
  }
});

app.post('/api/ai/video-download', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required' });
      return;
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      res.status(404).json({ error: 'Video URI not available' });
      return;
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });
    res.setHeader('Content-Type', 'video/mp4');
    videoRes.body!.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      })
    );
  } catch (error: any) {
    console.error('Video Download Error:', error);
    res.status(500).json({ error: error.message || 'Error downloading video' });
  }
});

// 8. Text-To-Speech (gemini-3.8-flash-lite-tts)
app.post('/api/ai/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text }],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.json({ base64Audio });
  } catch (error: any) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: error.message || 'Error generating speech' });
  }
});

// Mount Vite or serve static dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
