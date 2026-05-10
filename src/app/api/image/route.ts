import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, appearance } = (await request.json()) as {
      prompt: string;
      appearance: string;
    };

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Empty prompt' }, { status: 400 });
    }

    // Enhance prompt with character appearance for consistency
    const enhancedPrompt = `${prompt}。画风要求：动漫风格，高质量，精细，${appearance}。不要出现文字。`;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config({ timeout: 30000 });
    const client = new ImageGenerationClient(config, customHeaders);

    const response = await client.generate({
      prompt: enhancedPrompt,
      size: '2K',
      watermark: false,
    });

    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls.length > 0) {
      return NextResponse.json({ imageUri: helper.imageUrls[0] });
    } else {
      console.error('Image generation failed:', helper.errorMessages);
      return NextResponse.json({ imageUri: '', error: 'Image generation failed' });
    }
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json({ imageUri: '', error: 'Image generation failed' });
  }
}
