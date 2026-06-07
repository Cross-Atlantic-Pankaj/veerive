import { NextResponse } from 'next/server';
import Context from '@/models/Context';
import connectDB from '@/lib/db';

export async function GET(request, { params }) {
  await connectDB();
  const { contextId } = await params;

  try {
    const context = await Context.findById(contextId);

    if (!context) {
      return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    }

    if (!context.pdfFile || !context.pdfFile.data) {
      return NextResponse.json({ error: 'PDF file not found in context' }, { status: 404 });
    }

    // For now, we'll return slide URLs that point to individual PDF pages
    // In a real implementation, you might want to use a PDF-to-image conversion library
    // like pdf2pic or similar to convert each page to an image
    
    const baseUrl = `${request.nextUrl.origin}/api/ppt-file/${contextId}`;
    const totalSlides = 10; // You can get this from the page-count endpoint
    
    // Generate slide URLs - each slide will be a PDF page
    const slides = Array.from({ length: totalSlides }, (_, index) => ({
      slideNumber: index + 1,
      imageUrl: `${baseUrl}/pdf#page=${index + 1}&toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=FitH`,
      thumbnailUrl: `${baseUrl}/pdf#page=${index + 1}&toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=FitH&size=200`
    }));

    return NextResponse.json({
      success: true,
      totalSlides,
      slides,
      fileName: context.pdfFile.fileName
    });

  } catch (error) {
    console.error('Error getting PDF slides:', error);
    return NextResponse.json(
      { error: 'Failed to get PDF slides', details: error.message },
      { status: 500 }
    );
  }
}
