import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function PdfViewer({ problem, isRunning }) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="border rounded overflow-auto h-full" style={{ pointerEvents: isRunning ? 'auto' : 'none', opacity: isRunning ? 1 : 0.5 }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer 
              fileUrl={`/tests/${problem}.pdf`} 
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
    </div>
  );
}

export default PdfViewer;
