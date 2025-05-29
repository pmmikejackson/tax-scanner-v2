import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), '..', 'docs');
    const generateScript = path.join(docsDir, 'generate-guide.js');
    const outputDir = path.join(docsDir, 'user-guide', 'output');
    const outputFile = path.join(outputDir, 'tax-scanner-user-guide.pdf');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if PDF already exists and is recent (less than 24 hours old)
    let needsRegeneration = true;
    if (fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
      if (ageInHours < 24) {
        needsRegeneration = false;
      }
    }

    // Generate PDF if needed
    if (needsRegeneration && fs.existsSync(generateScript)) {
      console.log('Generating new PDF user guide...');
      
      const generatePDF = () => {
        return new Promise<void>((resolve, reject) => {
          const child = spawn('node', [generateScript], {
            cwd: docsDir,
            stdio: 'pipe',
            timeout: 60000 // 60 second timeout
          });

          let stdout = '';
          let stderr = '';

          child.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          child.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          child.on('close', (code) => {
            if (code === 0) {
              console.log('PDF generation completed successfully');
              resolve();
            } else {
              console.error('PDF generation failed:', stderr);
              reject(new Error(`PDF generation failed with code ${code}: ${stderr}`));
            }
          });

          child.on('error', (error) => {
            console.error('Failed to start PDF generation:', error);
            reject(error);
          });
        });
      };

      try {
        await generatePDF();
      } catch (error) {
        console.error('PDF generation error:', error);
        // If generation fails but we have an old PDF, serve that instead
        if (!fs.existsSync(outputFile)) {
          return NextResponse.json(
            { error: 'PDF generation failed and no cached version available' },
            { status: 500 }
          );
        }
      }
    }

    // Check if the PDF exists (either pre-existing or freshly generated)
    if (!fs.existsSync(outputFile)) {
      return NextResponse.json(
        { error: 'PDF file not found. Please try generating the guide manually first.' },
        { status: 404 }
      );
    }

    // Read and return the PDF file
    const pdfBuffer = fs.readFileSync(outputFile);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="tax-scanner-user-guide.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error in PDF generation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 