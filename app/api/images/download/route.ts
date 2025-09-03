import { NextRequest, NextResponse } from 'next/server';
import { ImageDatabase } from '@/app/api/images/database'; // <-- corretto
import { ImageDownloadParams } from '@/app/api/images/types'; // <-- correggere anche il path per types
import sharp from 'sharp';
export async function GET(request: NextRequest) {
  try {
    console.log('Download request received');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const format = url.searchParams.get('format') as 'png' | 'bmp' | 'ico' | 'svg';
    const sizeParam = url.searchParams.get('size');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID immagine obbligatorio' 
      }, { status: 400 });
    }

    if (!format) {
      return NextResponse.json({ 
        success: false, 
        error: 'Formato obbligatorio' 
      }, { status: 400 });
    }

    const size = sizeParam ? parseInt(sizeParam) : 1024;
    const validSizes = [1024, 512, 256, 128, 100, 96, 70, 64, 50, 46, 40, 38, 32, 24, 20, 16];
    
    if (!validSizes.includes(size)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dimensione non valida' 
      }, { status: 400 });
    }

    const image = await ImageDatabase.getImage(id);
    
    if (!image) {
      return NextResponse.json({ 
        success: false, 
        error: 'Immagine non trovata' 
      }, { status: 404 });
    }

    console.log(`Processing download: ${format} format, ${size}px size`);

    let processedBuffer: Buffer;
    let contentType: string;
    let fileExtension: string;

    // Processa l'immagine in base al formato richiesto
    const sharpInstance = sharp(image.buffer).resize(size, size, { 
      fit: 'inside', 
      withoutEnlargement: false 
    });

    switch (format) {
      case 'png':
        processedBuffer = await sharpInstance.png().toBuffer();
        contentType = 'image/png';
        fileExtension = 'png';
        break;
      case 'bmp':
        // Sharp non supporta BMP direttamente, convertiamo in PNG
        processedBuffer = await sharpInstance.png().toBuffer();
        contentType = 'image/png';
        fileExtension = 'png';
        break;
      case 'ico':
        // Per ICO usiamo PNG con dimensioni appropriate
        const icoSize = Math.min(size, 256); // ICO max 256x256
        processedBuffer = await sharp(image.buffer)
          .resize(icoSize, icoSize, { fit: 'inside', withoutEnlargement: false })
          .png()
          .toBuffer();
        contentType = 'image/png';
        fileExtension = 'png';
        break;
      case 'svg':
        // Per SVG creiamo un SVG che incorpora l'immagine PNG
        const pngBuffer = await sharpInstance.png().toBuffer();
        const base64 = pngBuffer.toString('base64');
        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <image href="data:image/png;base64,${base64}" width="${size}" height="${size}"/>
          </svg>
        `;
        processedBuffer = Buffer.from(svgContent);
        contentType = 'image/svg+xml';
        fileExtension = 'svg';
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Formato non supportato' 
        }, { status: 400 });
    }

    const filename = `${image.originalName.split('.')[0]}_${size}px.${fileExtension}`;
    
    console.log(`Download prepared: ${filename}`);

    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': processedBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore durante il download' 
    }, { status: 500 });
  }
}