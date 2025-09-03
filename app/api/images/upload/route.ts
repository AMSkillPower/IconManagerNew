import { NextRequest, NextResponse } from "next/server";
import { ImageDatabase } from "@/app/api/images/database";
import sharp from "sharp";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const format = searchParams.get("format") || "png";
    const size = parseInt(searchParams.get("size") || "100");

    if (!id) {
      return new NextResponse("ID immagine richiesto", { status: 400 });
    }

    const image = await ImageDatabase.getImageById(id);

    if (!image) {
      return new NextResponse("Immagine non trovata", { status: 404 });
    }

    let processedBuffer = image.buffer;

    // Se la dimensione richiesta è diversa da quella originale, ridimensiona
    if (size !== 100) {
      processedBuffer = await sharp(image.buffer)
        .resize(size, size, { fit: "fill" })
        .toBuffer();
    }

    // Converti nel formato richiesto se necessario
    switch (format.toLowerCase()) {
      case "png":
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
        break;
      case "bmp":
        // Sharp non supporta BMP direttamente, usa PNG
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
        break;
      case "ico":
        // Sharp non supporta ICO direttamente, usa PNG
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
        break;
      case "svg":
        // Per SVG, manteniamo PNG (Sharp non può convertire in SVG)
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
        break;
      default:
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
    }

    const mimeType = `image/${format === "ico" ? "x-icon" : format}`;

    return new NextResponse(processedBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${image.originalName.replace(
          /\.[^/.]+$/,
          ""
        )}_${size}x${size}.${format}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Errore durante il download", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file inviato" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tagsFromFormData = (formData.get("tags") as string) || "";
    const tagsArray = tagsFromFormData
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    const id = await ImageDatabase.saveImage({
      buffer,
      originalName: file.name,
      filename: file.name, // puoi eventualmente modificare se vuoi un nome diverso
      size: buffer.length,
      mimetype: file.type,
      tags: tagsArray,
      uploadDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Upload completato",
      id,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Errore durante l'upload" },
      { status: 500 }
    );
  }
}
