import { NextRequest, NextResponse } from 'next/server';
import { ImageDatabase } from '../database';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Image request received for ID:', params.id);
    
    const image = await ImageDatabase.getImage(params.id);
    
    if (!image) {
      return NextResponse.json({ 
        success: false, 
        error: 'Immagine non trovata' 
      }, { status: 404 });
    }

    // Restituisce l'immagine come risposta binaria
    return new NextResponse(image.buffer, {
      headers: {
        'Content-Type': image.mimetype,
        'Content-Length': image.size.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache per 1 anno
      },
    });

  } catch (error) {
    console.error('Image retrieval error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore nel recupero dell\'immagine' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ImageDatabase.deleteImage(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ success: false, error: 'Errore eliminazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { tags } = body;

    if (!Array.isArray(tags)) {
      return NextResponse.json({ success: false, error: 'Tags non validi' }, { status: 400 });
    }

    await ImageDatabase.updateImageTags(params.id, tags);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ success: false, error: 'Errore aggiornamento' }, { status: 500 });
  }
}