'use client';

import { useState, useEffect } from 'react';
import { message } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface LessonPlanPreviewProps {
  file: File | string;
  fileType: 'pdf' | 'docx';
}

export default function LessonPlanPreview({ file, fileType }: LessonPlanPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docxContent, setDocxContent] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;
  }, []);

  useEffect(() => {
    if (!file || !fileType) {
      console.warn('LessonPlanPreview: Arquivo ou tipo de arquivo não fornecido:', { file, fileType });
      messageApi.error('Nenhum arquivo selecionado para visualização.');
      setPreviewUrl(null);
      setDocxContent(null);
      return;
    }

    const createPreview = async () => {
      try {
        if (fileType === 'pdf') {
          if (file instanceof File) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
          } else if (typeof file === 'string') {
            setPreviewUrl(file);
            console.log('LessonPlanPreview: Usando URL do PDF:', file);
          }
        } else if (fileType === 'docx') {
          if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setDocxContent(result.value);
           
          } else {
            throw new Error('URL não suportada para DOCX. Forneça um arquivo.');
          }
        } else {
          throw new Error('Tipo de arquivo não suportado. Use PDF ou DOCX.');
        }
      } catch (error: any) {
        
        messageApi.error('Erro ao carregar o preview do arquivo. Verifique o formato do arquivo.');
        setPreviewUrl(null);
        setDocxContent(null);
      }
    };

    createPreview();

    return () => {
      if (previewUrl && fileType === 'pdf' && file instanceof File) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, fileType, messageApi]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <>
      {contextHolder}
      <div style={{ width: '100%', height: '600px', border: '1px solid #d9d9d9', borderRadius: '4px', overflow: 'hidden' }}>
        {fileType === 'pdf' && previewUrl ? (
          <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <Document
              file={previewUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('LessonPlanPreview: Erro ao carregar PDF:', error.message);
                messageApi.error('Erro ao carregar o PDF. Verifique o arquivo ou a conexão.');
              }}
            >
              {numPages ? (
                Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={800}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                ))
              ) : (
                <p>Carregando páginas...</p>
              )}
            </Document>
          </div>
        ) : fileType === 'docx' && docxContent ? (
          <div
            style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '16px', background: '#fff' }}
            dangerouslySetInnerHTML={{ __html: docxContent }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: '16px' }}>
            Nenhum preview disponível.
          </div>
        )}
      </div>
    </>
  );
}