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

    // Estimate page count based on file size
    const fileSizeKB = context.pdfFile.data.length / 1024;
    let totalSlides = Math.max(1, Math.round(fileSizeKB / 50)); // Rough estimate: 50KB per page
    
    // Cap at reasonable limits
    totalSlides = Math.min(totalSlides, 50);
    totalSlides = Math.max(totalSlides, 1);

    console.log(`Estimated ${totalSlides} pages for PDF (${fileSizeKB.toFixed(1)}KB)`);

    // For now, return the page count and create slide URLs
    // In a production environment, you would convert each page to an image here
    const slides = Array.from({ length: totalSlides }, (_, index) => ({
      slideNumber: index + 1,
      imageUrl: `/api/ppt-file/${contextId}/pdf#page=${index + 1}&toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=FitH&pagemode=none`,
      width: 1200,
      height: 800
    }));

    return NextResponse.json({
      success: true,
      totalSlides,
      slides,
      fileName: context.pdfFile.fileName,
      pdfUrl: `/api/ppt-file/${contextId}/pdf`
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF', details: error.message },
      { status: 500 }
    );
  }
}
