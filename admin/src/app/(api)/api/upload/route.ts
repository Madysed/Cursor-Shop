import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Set dynamic config usando el nuevo formato de Next.js
export const dynamic = 'force-dynamic';
// Set maximum size limit for uploads
export const maxDuration = 60; // 60 seconds timeout
// Usamos runtime para especificar el entorno de ejecución
export const runtime = 'nodejs';

/**
 * Convert a file to a Data URL (base64)
 */
async function fileToDataUrl(file: Blob): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function POST(request: Request) {
  console.log('Upload API route called'); // Server-side log
  try {
    const session = await getServerSession(authOptions);
    console.log('Auth session status:', session ? 'authenticated' : 'unauthenticated'); // Server-side log
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('Unauthorized upload attempt'); // Server-side log
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      console.log('No valid file provided'); // Server-side log
      return NextResponse.json(
        { error: 'No valid file provided' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB file size limit
      console.log('File too large:', file.size); // Server-side log
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    console.log('Processing file, size:', file.size, 'type:', file.type); // Server-side log
    try {
      // Convert file to data URL (base64)
      const dataUrl = await fileToDataUrl(file);
      console.log('File converted to base64 data URL successfully');
      
      // Return the data URL directly
      return NextResponse.json({
        success: true,
        url: dataUrl
      });
    } catch (uploadError) {
      console.error('Error processing file:', uploadError); // Server-side log
      return NextResponse.json(
        { 
          error: 'Failed to process file',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in upload route:', error); // Server-side log
    return NextResponse.json(
      { 
        error: 'Failed to handle upload request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 