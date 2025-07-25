import { MessageCodec, Platform, getAllQueryString } from 'ranuts/utils';
import type { MessageHandler } from 'ranuts/utils';
import { handleDocumentOperation, initX2T, loadEditorApi, loadScript } from './lib/x2t';
import { getDocmentObj, setDocmentObj } from './store';
import { showLoading } from './lib/loading';
import 'ranui/button';
import './styles/base.css';

interface RenderOfficeData {
  chunkIndex: number;
  data: string;
  lastModified: number;
  name: string;
  size: number;
  totalChunks: number;
  type: string;
}

declare global {
  interface Window {
    onCreateNew: (ext: string) => Promise<void>;
    DocsAPI: {
      DocEditor: new (elementId: string, config: any) => any;
    };
    editor: any;
  }
}

let fileChunks: RenderOfficeData[] = [];

const events: Record<string, MessageHandler<any, unknown>> = {
  RENDER_OFFICE: async (data: RenderOfficeData) => {
    // Hide the control panel when rendering office
    const controlPanel = document.getElementById('control-panel');
    if (controlPanel) {
      controlPanel.style.display = 'none';
    }
    fileChunks.push(data);
    if (fileChunks.length >= data.totalChunks) {
      const { removeLoading } = showLoading('Processing document...');
      const file = await MessageCodec.decodeFileChunked(fileChunks);
      setDocmentObj({
        fileName: file.name,
        file: file,
        url: window.URL.createObjectURL(file),
      });
      await initX2T();
      const { fileName, file: fileBlob } = getDocmentObj();
      await handleDocumentOperation({ file: fileBlob, fileName, isNew: !fileBlob });
      fileChunks = [];
      removeLoading();
    }
  },
  CLOSE_EDITOR: () => {
    fileChunks = [];
    if (window.editor && typeof window.editor.destroyEditor === 'function') {
      window.editor.destroyEditor();
    }
  },
};

Platform.init(events);

// Get URL parameters to handle different actions
const urlParams = getAllQueryString();
const { action, type } = urlParams;

const onCreateNew = async (ext: string) => {
  const { removeLoading } = showLoading('Creating new document...');
  setDocmentObj({
    fileName: 'New_Document' + ext,
    file: undefined,
  });
  await loadScript();
  await loadEditorApi();
  await initX2T();
  const { fileName, file: fileBlob } = getDocmentObj();
  await handleDocumentOperation({ file: fileBlob, fileName, isNew: !fileBlob });
  removeLoading();
};

window.onCreateNew = onCreateNew;

// Create a single file input element
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.docx,.xlsx,.pptx,.doc,.xls,.ppt';
fileInput.style.setProperty('visibility', 'hidden');
document.body.appendChild(fileInput);

const onOpenDocument = async () => {
  return new Promise((resolve) => {
    fileInput.click();
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      const { removeLoading } = showLoading('Opening document...');
      if (file) {
        setDocmentObj({
          fileName: file.name,
          file: file,
          url: window.URL.createObjectURL(file),
        });
        await initX2T();
        const { fileName, file: fileBlob } = getDocmentObj();
        await handleDocumentOperation({ file: fileBlob, fileName, isNew: !fileBlob });
        resolve(true);
        removeLoading();
        fileInput.value = '';
      }
    };
  });
};

// Handle uploaded file from sessionStorage
const handleUploadedFile = async () => {
  const uploadedFileData = sessionStorage.getItem('uploadedFile');
  if (uploadedFileData) {
    const { removeLoading } = showLoading('Loading your document...');
    try {
      const fileData = JSON.parse(uploadedFileData);
      
      // Convert data URL back to File
      const response = await fetch(fileData.data);
      const blob = await response.blob();
      const file = new File([blob], fileData.name, { type: fileData.type });
      
      setDocmentObj({
        fileName: file.name,
        file: file,
        url: window.URL.createObjectURL(file),
      });
      
      await initX2T();
      const { fileName, file: fileBlob } = getDocmentObj();
      await handleDocumentOperation({ file: fileBlob, fileName, isNew: !fileBlob });
      
      // Clear the uploaded file from sessionStorage
      sessionStorage.removeItem('uploadedFile');
      removeLoading();
    } catch (error) {
      console.error('Error loading uploaded file:', error);
      removeLoading();
    }
  }
};

// Create and append the control panel with English text
const createControlPanel = () => {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 100%;
    background: linear-gradient(to right, #ffffff, #f8f9fa);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid #eaeaea;
  `;

  const controlPanel = document.createElement('div');
  controlPanel.id = 'control-panel';
  controlPanel.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px;
    z-index: 1000;
    max-width: 1200px;
    margin: 0 auto;
    align-items: center;
  `;

  // Title section with back button
  const titleSection = document.createElement('div');
  titleSection.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: auto;
  `;

  const backButton = document.createElement('button');
  backButton.innerHTML = '← Back to Home';
  backButton.style.cssText = `
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  `;
  backButton.addEventListener('mouseover', () => {
    backButton.style.background = '#e5e7eb';
  });
  backButton.addEventListener('mouseout', () => {
    backButton.style.background = '#f3f4f6';
  });
  backButton.addEventListener('click', () => {
    window.location.href = './index.html';
  });

  const logo = document.createElement('div');
  logo.style.cssText = `
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
  `;
  logo.textContent = 'O';

  const title = document.createElement('h1');
  title.textContent = 'OnlyOffice Web Editor';
  title.style.cssText = `
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  `;

  titleSection.appendChild(backButton);
  titleSection.appendChild(logo);
  titleSection.appendChild(title);

  // Action buttons section
  const actionsSection = document.createElement('div');
  actionsSection.style.cssText = `
    display: flex;
    gap: 12px;
    align-items: center;
  `;

  // Create New Document button
  const newDocButton = document.createElement('button');
  newDocButton.innerHTML = '📝 New Document';
  newDocButton.style.cssText = `
    background: #3b82f6;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  `;
  newDocButton.addEventListener('mouseover', () => {
    newDocButton.style.background = '#2563eb';
  });
  newDocButton.addEventListener('mouseout', () => {
    newDocButton.style.background = '#3b82f6';
  });
  newDocButton.addEventListener('click', () => onCreateNew('.docx'));

  // Open Document button
  const openButton = document.createElement('button');
  openButton.innerHTML = '📁 Open Document';
  openButton.style.cssText = `
    background: #10b981;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  `;
  openButton.addEventListener('mouseover', () => {
    openButton.style.background = '#059669';
  });
  openButton.addEventListener('mouseout', () => {
    openButton.style.background = '#10b981';
  });
  openButton.addEventListener('click', onOpenDocument);

  actionsSection.appendChild(newDocButton);
  actionsSection.appendChild(openButton);

  controlPanel.appendChild(titleSection);
  controlPanel.appendChild(actionsSection);
  container.appendChild(controlPanel);

  document.body.insertBefore(container, document.body.firstChild);
};

// Initialize the editor based on URL parameters
const initializeEditor = async () => {
  // Check if we're coming from the landing page with specific actions
  if (action === 'new' && type) {
    await onCreateNew(type);
  } else if (action === 'open') {
    await handleUploadedFile();
  } else {
    // Show the control panel for manual selection
    createControlPanel();
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeEditor);
