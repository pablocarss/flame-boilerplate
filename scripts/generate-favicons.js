#!/usr/bin/env node
/**
 * Script para gerar favicons em múltiplos formatos a partir do SVG
 *
 * Requisitos:
 * - Node.js instalado
 * - Executar: npm install sharp --save-dev
 *
 * Uso:
 * - node scripts/generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  try {
    // Verifica se sharp está instalado
    let sharp;
    try {
      sharp = require('sharp');
    } catch (error) {
      console.log('📦 Instalando sharp...');
      const { execSync } = require('child_process');
      execSync('npm install sharp --save-dev', { stdio: 'inherit' });
      sharp = require('sharp');
    }

    const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
    const publicDir = path.join(__dirname, '..', 'public');

    // Ler o SVG
    const svgBuffer = fs.readFileSync(svgPath);

    // Tamanhos para gerar
    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-96x96.png', size: 96 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
    ];

    console.log('🎨 Gerando favicons...\n');

    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name);

      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name} (${size}x${size})`);
    }

    // Gerar favicon.ico (32x32)
    const icoPath = path.join(publicDir, 'favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFormat('png')
      .toFile(icoPath.replace('.ico', '-temp.png'));

    // Converter PNG para ICO manualmente ou manter PNG
    // Por simplicidade, vamos renomear o PNG para ICO
    // (browsers modernos aceitam PNG como .ico)
    fs.copyFileSync(path.join(publicDir, 'favicon-32x32.png'), icoPath);

    console.log(`✅ favicon.ico (32x32)`);

    console.log('\n🎉 Todos os favicons foram gerados com sucesso!');
    console.log('\n📁 Arquivos criados em /public:');
    console.log('   - favicon.ico');
    console.log('   - favicon-16x16.png');
    console.log('   - favicon-32x32.png');
    console.log('   - favicon-96x96.png');
    console.log('   - apple-touch-icon.png');
    console.log('   - android-chrome-192x192.png');
    console.log('   - android-chrome-512x512.png');
    console.log('\n✨ Não esqueça de atualizar src/app/layout.tsx com os novos ícones!');

  } catch (error) {
    console.error('❌ Erro ao gerar favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
