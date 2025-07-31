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

  // Also set backup flag in sessionStorage for Cloudflare Pages compatibility
  if (action === 'new' && fileType) {
    sessionStorage.setItem('createNewDocument', fileType);
    console.log('Set createNewDocument flag in sessionStorage:', fileType);
  }

  window.location.href = url;
}

// Function to smoothly scroll to document type selection
function scrollToDocumentTypes() {
  const documentTypesSection = document.getElementById('document-types');
  if (documentTypesSection) {
    documentTypesSection.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // Add a subtle highlight effect to draw attention
    const cards = documentTypesSection.querySelectorAll('.bg-white.rounded-2xl');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-pulse');
        setTimeout(() => {
          card.classList.remove('animate-pulse');
        }, 1000);
      }, index * 200);
    });
  }
}

// Enhanced file upload with error handling
function handleFileUpload() {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();

    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file type
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/msword',
          'application/vnd.ms-excel',
          'application/vnd.ms-powerpoint'
        ];

        if (!allowedTypes.includes(file.type)) {
          showNotification('Please select a valid Office document (.docx, .xlsx, .pptx, .doc, .xls, .ppt)', 'error');
          return;
        }

        try {
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
          reader.onerror = () => {
            showNotification('Error reading file. Please try again.', 'error');
          };
          reader.readAsDataURL(file);
        } catch (error) {
          showNotification('Error processing file. Please try again.', 'error');
          console.error('File processing error:', error);
        }
      }
    };
  }
}

// Enhanced notification system
function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  notification.classList.add(bgColor, 'text-white');
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-lg">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ⓘ'}</span>
      <span>${message}</span>
      <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Function to create new document with error handling
function createNewDocument(type: string) {
  try {
    goToEditor('new', type);
  } catch (error) {
    showNotification('Error creating document. Please try again.', 'error');
    console.error('Document creation error:', error);
  }
}

// Performance optimization - Intersection Observer for animations
function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 延迟添加动画，避免页面加载时的布局影响
          setTimeout(() => {
            entry.target.classList.add('animate-fade-in');
          }, 100);
        }
      });
    },
    { threshold: 0.1 }
  );

  // 只在页面完全加载后才开始观察，避免初始加载时的滚动
  setTimeout(() => {
    const elementsToAnimate = document.querySelectorAll('.bg-gray-50, .bg-white.rounded-2xl');
    elementsToAnimate.forEach((el) => observer.observe(el));
  }, 500);
}

// Enhanced accessibility features
function enhanceAccessibility() {
  // Add skip links - but don't auto-scroll to target
  const skipLink = document.createElement('a');
  // 完全移除 href 属性，防止浏览器自动滚动到锚点
  // skipLink.href = '#document-types';
  skipLink.textContent = 'Skip to document selection';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
  skipLink.setAttribute('role', 'button');
  skipLink.setAttribute('tabindex', '0');

  // 使用事件处理器代替锚点链接
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('document-types');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // 添加键盘支持
  skipLink.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = document.getElementById('document-types');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add ARIA labels to buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.getAttribute('aria-label')) {
      const text = button.textContent?.trim();
      if (text) {
        button.setAttribute('aria-label', text);
      }
    }
  });

  // Add focus indicators
  const style = document.createElement('style');
  style.textContent = `
    .focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    .animate-fade-in {
      opacity: 0;
      transform: translateY(20px);
      animation: fadeIn 0.6s ease-out forwards;
    }
    
    @keyframes fadeIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    .focus\\:not-sr-only:focus {
      position: static;
      width: auto;
      height: auto;
      padding: 0.5rem 1rem;
      margin: 0;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `;
  document.head.appendChild(style);
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Start Editing buttons - scroll to document types
  const startEditingButtons = [
    document.getElementById('start-editing'),
    document.getElementById('start-editing-bottom'),
    document.getElementById('get-started-nav')
  ];

  startEditingButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', scrollToDocumentTypes);
    }
  });

  // Open Document buttons - trigger file upload
  const openDocumentButtons = [
    document.getElementById('open-document'),
    document.getElementById('open-document-bottom')
  ];

  openDocumentButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', handleFileUpload);
    }
  });

  // Create new document buttons with specific IDs
  const createDocxButton = document.getElementById('create-docx');
  if (createDocxButton) {
    createDocxButton.addEventListener('click', () => createNewDocument('.docx'));
  }

  const createXlsxButton = document.getElementById('create-xlsx');
  if (createXlsxButton) {
    createXlsxButton.addEventListener('click', () => createNewDocument('.xlsx'));
  }

  const createPptxButton = document.getElementById('create-pptx');
  if (createPptxButton) {
    createPptxButton.addEventListener('click', () => createNewDocument('.pptx'));
  }

  // Setup enhanced features
  setupIntersectionObserver();
  enhanceAccessibility();

  // Show welcome message
  setTimeout(() => {
    showNotification('Welcome to SecureOffice! Your documents stay 100% private.', 'info');
  }, 1000);
});

// Make functions available globally for inline onclick handlers (fallback)
(window as any).onCreateNew = createNewDocument;
(window as any).scrollToDocumentTypes = scrollToDocumentTypes;
(window as any).handleFileUpload = handleFileUpload;
(window as any).showNotification = showNotification;
