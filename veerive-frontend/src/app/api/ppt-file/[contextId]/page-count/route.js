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

    // Simple approach: try to estimate page count based on file size
    // This is a rough estimation - in production you'd use a proper PDF parser
    const fileSizeKB = context.pdfFile.data.length / 1024;
    let estimatedPages = Math.max(1, Math.round(fileSizeKB / 50)); // Rough estimate: 50KB per page
    
    // Cap at reasonable limits
    estimatedPages = Math.min(estimatedPages, 50);
    estimatedPages = Math.max(estimatedPages, 1);

    console.log(`Estimated ${estimatedPages} pages for PDF (${fileSizeKB.toFixed(1)}KB)`);

    return NextResponse.json({
      success: true,
      pageCount: estimatedPages,
      fileName: context.pdfFile.fileName,
      fileSizeKB: Math.round(fileSizeKB)
    });

  } catch (error) {
    console.error('Error getting page count:', error);
    return NextResponse.json(
      { error: 'Failed to get page count', details: error.message },
      { status: 500 }
    );
  }
}