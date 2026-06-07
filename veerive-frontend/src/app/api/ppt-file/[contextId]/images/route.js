import { NextResponse } from 'next/server';
import Context from '@/models/Context';
import connectDB from '@/lib/db';

// Count pages in a PDF buffer without external dependencies by matching
// page objects in the document structure. Falls back to 1 if none found.
function countPdfPages(buffer) {
  const text = buffer.toString('latin1');
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  const count = matches ? matches.length : 0;
  return Math.max(count, 1);
}

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

    // Get actual page count from PDF
    const pdfBuffer = Buffer.from(context.pdfFile.data);
    const totalSlides = countPdfPages(pdfBuffer);

    console.log(`PDF has ${totalSlides} pages`);

    const pdfUrl = `/api/ppt-file/${contextId}/pdf`;

    // Create slide URLs that point to individual PDF pages
    const slides = Array.from({ length: totalSlides }, (_, index) => ({
      slideNumber: index + 1,
      imageUrl: `${pdfUrl}#page=${index + 1}&toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=FitH&pagemode=none`,
      width: 1200,
      height: 800
    }));

    return NextResponse.json({
      success: true,
      totalSlides,
      slides,
      fileName: context.pdfFile.fileName,
      pdfUrl
    });

  } catch (error) {
    console.error('Error preparing PDF slides:', error);
    return NextResponse.json(
      { error: 'Failed to prepare PDF slides', details: error.message },
      { status: 500 }
    );
  }
}
