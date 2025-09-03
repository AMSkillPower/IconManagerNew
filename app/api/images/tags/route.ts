import { NextRequest, NextResponse } from 'next/server';
import { ImageDatabase } from '../database';

export async function GET(request: NextRequest) {
  try {
    console.log('Tags request received');
    
    const tags = await ImageDatabase.getAllTags();
    
    console.log(`Returning ${tags.length} tags`);
    
    return NextResponse.json({
      success: true,
      tags
    });

  } catch (error) {
    console.error('Tags retrieval error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore nel recupero dei tag' 
    });
  }
}
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');

  if (!tag) {
    return NextResponse.json({ success: false, error: 'Tag mancante' }, { status: 400 });
  }

  try {
    await ImageDatabase.removeTagGlobally(tag);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json({ success: false, error: 'Errore rimozione tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const oldTag = searchParams.get('old');
  const newTag = searchParams.get('new');

  if (!oldTag || !newTag) {
    return NextResponse.json({ success: false, error: 'Tag mancanti' }, { status: 400 });
  }

  try {
    await ImageDatabase.renameTagGlobally(oldTag, newTag);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rename tag error:', error);
    return NextResponse.json({ success: false, error: 'Errore rinominazione tag' }, { status: 500 });
  }
}