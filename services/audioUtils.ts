// Utility to decode base64 string
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Utility to decode raw PCM audio data to AudioBuffer
export async function decodeAudioData(
  base64Data: string,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const bytes = decode(base64Data);
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class AudioPlayer {
  private context: AudioContext;
  private source: AudioBufferSourceNode | null = null;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  async play(base64Audio: string): Promise<number> {
    try {
      // Ensure context is running
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      this.stop(); // Stop any currently playing audio

      const audioBuffer = await decodeAudioData(base64Audio, this.context);
      this.source = this.context.createBufferSource();
      this.source.buffer = audioBuffer;
      this.source.connect(this.context.destination);
      this.source.start(0);
      
      return audioBuffer.duration;
    } catch (error) {
      console.error("Error playing audio:", error);
      return 0;
    }
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {
        // Ignore errors
      }
      this.source.disconnect();
      this.source = null;
    }
  }
}