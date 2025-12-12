import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, folder = "uploads" } = body;

    if (!filename) {
      return NextResponse.json(
        { error: "Nome do arquivo nao fornecido" },
        { status: 400 }
      );
    }

    // Generate presigned URL
    const result = await getPresignedUploadUrl(filename, folder);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar URL de upload" },
      { status: 500 }
    );
  }
}
