import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Context from '@/models/Context';

export async function GET(_request, { params }) {
  try {
    await connectDB();

    const { contextId } = await params;
    if (!contextId) {
      return NextResponse.json({ error: 'Context ID is required' }, { status: 400 });
    }

    const context = await Context.findById(contextId).select('pdfFile');
    if (!context) {
      return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    }

    if (!context.pdfFile || !context.pdfFile.data) {
      return NextResponse.json({ error: 'PDF file not found' }, { status: 404 });
    }

    const pdfBuffer = Buffer.from(context.pdfFile.data);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': context.pdfFile.contentType || 'application/pdf',
        'Content-Disposition': `inline; filename="${(context.pdfFile.fileName || 'presentation.pdf')}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Failed to serve PDF', details: error.message },
      { status: 500 }
    );
  }
}


