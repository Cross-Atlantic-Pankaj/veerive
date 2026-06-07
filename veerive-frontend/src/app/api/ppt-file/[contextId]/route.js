import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Context from '@/models/Context';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { contextId } = await params;
    
    if (!contextId) {
      return NextResponse.json({ error: 'Context ID is required' }, { status: 400 });
    }

    // Find the context with the PPT file
    const context = await Context.findById(contextId).select('pptFile');
    
    if (!context) {
      return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    }

    if (!context.pptFile || !context.pptFile.data) {
      return NextResponse.json({ error: 'PPT file not found' }, { status: 404 });
    }

    // Extract file information
    const { data, contentType, fileName } = context.pptFile;
    
    // Convert Buffer to Uint8Array if needed
    const fileBuffer = data instanceof Buffer ? data : Buffer.from(data);
    
    // Create response with proper headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `inline; filename="${fileName || 'presentation.pptx'}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

    return response;

  } catch (error) {
    console.error('Error serving PPT file:', error);
    return NextResponse.json(
      { error: 'Failed to serve PPT file', details: error.message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


