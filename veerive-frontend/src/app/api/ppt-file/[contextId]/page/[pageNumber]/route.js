import { NextResponse } from 'next/server';
import Context from '@/models/Context';
import connectDB from '@/lib/db';

export async function GET(request, { params }) {
  await connectDB();
  const { contextId, pageNumber } = await params;

  try {
    const context = await Context.findById(contextId);

    if (!context) {
      return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    }

    if (!context.pdfFile || !context.pdfFile.data) {
      return NextResponse.json({ error: 'PDF file not found in context' }, { status: 404 });
    }

    // For now, we'll return the PDF with page parameters
    // In a real implementation, you might want to use PDF.js or similar
    // to render individual pages as images
    
    const { data, contentType, fileName } = context.pdfFile;
    const fileBuffer = data instanceof Buffer ? data : Buffer.from(data);
    
    // Create response with proper headers for PDF viewing
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName || 'presentation.pdf'}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

    return response;

  } catch (error) {
    console.error('Error serving PDF page:', error);
    return NextResponse.json(
      { error: 'Failed to serve PDF page', details: error.message },
      { status: 500 }
    );
  }
}
