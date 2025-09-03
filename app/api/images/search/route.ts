import { NextRequest, NextResponse } from 'next/server';
import { ImageDatabase } from '../database';
import { ImageSearchParams } from '../types';

export async function GET(request: NextRequest) {
  try {
    console.log('Search request received');
    
    const url = new URL(request.url);
    const tagsParam = url.searchParams.get('tags');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const searchParams: ImageSearchParams = {
      tags: tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : undefined,
      limit,
      offset
    };

    console.log('Search params:', searchParams);

    const images = await ImageDatabase.searchImages(searchParams);
    
    // Rimuovi i buffer dalle risposte per efficienza
    const imageResults = images.map(image => ({
      id: image.id,
      filename: image.filename,
      originalName: image.originalName,
      size: image.size,
      mimetype: image.mimetype,
      tags: image.tags,
      uploadDate: image.uploadDate
    }));

    console.log(`Returning ${imageResults.length} images`);
    
    return NextResponse.json({
      success: true,
      images: imageResults,
      total: imageResults.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore durante la ricerca' 
    });
  }
}