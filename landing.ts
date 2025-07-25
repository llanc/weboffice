// Landing page functionality
import './styles/base.css';

// Function to redirect to editor with optional parameters
function goToEditor(action?: string, fileType?: string) {
  let url = './editor.html';
  const params = new URLSearchParams();
  
  if (action) params.set('action', action);
  if (fileType) params.set('type', fileType);
  
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  window.location.href = url;
}

// Function to handle file upload
function handleFileUpload() {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Store file in sessionStorage for the editor page
        const reader = new FileReader();
        reader.onload = () => {
          sessionStorage.setItem('uploadedFile', JSON.stringify({
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result
          }));
          goToEditor('open');
        };
        reader.readAsDataURL(file);
      }
    };
  }
}

// Function to create new document
function createNewDocument(type: string) {
  goToEditor('new', type);
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Get Started button
  const getStartedNav = document.getElementById('get-started-nav');
  if (getStartedNav) {
    getStartedNav.addEventListener('click', () => goToEditor());
  }

  // Hero section buttons
  const startEditingBtn = document.getElementById('start-editing');
  if (startEditingBtn) {
    startEditingBtn.addEventListener('click', () => goToEditor());
  }

  const openDocumentBtn = document.getElementById('open-document');
  if (openDocumentBtn) {
    openDocumentBtn.addEventListener('click', handleFileUpload);
  }

  // Bottom CTA buttons
  const startEditingBottomBtn = document.getElementById('start-editing-bottom');
  if (startEditingBottomBtn) {
    startEditingBottomBtn.addEventListener('click', () => goToEditor());
  }

  const openDocumentBottomBtn = document.getElementById('open-document-bottom');
  if (openDocumentBottomBtn) {
    openDocumentBottomBtn.addEventListener('click', handleFileUpload);
  }

  // Document format buttons (these are handled by onclick attributes in HTML)
  // But we can also add them here for consistency
  const docxBtn = document.querySelector('button[onclick*=".docx"]');
  const xlsxBtn = document.querySelector('button[onclick*=".xlsx"]');
  const pptxBtn = document.querySelector('button[onclick*=".pptx"]');

  if (docxBtn) {
    docxBtn.addEventListener('click', (e) => {
      e.preventDefault();
      createNewDocument('.docx');
    });
  }

  if (xlsxBtn) {
    xlsxBtn.addEventListener('click', (e) => {
      e.preventDefault();
      createNewDocument('.xlsx');
    });
  }

  if (pptxBtn) {
    pptxBtn.addEventListener('click', (e) => {
      e.preventDefault();
      createNewDocument('.pptx');
    });
  }
});

// Make functions available globally for onclick handlers
declare global {
  interface Window {
    onCreateNew: (ext: string) => void;
    goToEditor: typeof goToEditor;
    handleFileUpload: typeof handleFileUpload;
  }
}

window.onCreateNew = createNewDocument;
window.goToEditor = goToEditor;
window.handleFileUpload = handleFileUpload;
