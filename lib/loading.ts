import 'ranui/loading';

// Enhanced loading functionality with user-friendly messages
export interface LoadingOptions {
  message: string;
  submessage?: string;
  showProgress?: boolean;
  duration?: number;
}

let currentLoadingElement: HTMLElement | null = null;
let loadingProgress = 0;
let progressInterval: NodeJS.Timeout | null = null;

export function showLoading(options: string | LoadingOptions) {
  // Handle backward compatibility
  const config: LoadingOptions = typeof options === 'string'
    ? { message: options }
    : options;

  // Remove existing loading if any
  if (currentLoadingElement) {
    removeLoading();
  }

  // Create loading overlay
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div class="loading-content">
        <h3 class="loading-message">${config.message}</h3>
        ${config.submessage ? `<p class="loading-submessage">${config.submessage}</p>` : ''}
        ${config.showProgress ? `
          <div class="loading-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%"></div>
            </div>
            <span class="progress-text">0%</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    }
    
    .loading-container {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .loading-spinner {
      margin-bottom: 1.5rem;
    }
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-message {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }
    
    .loading-submessage {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }
    
    .loading-progress {
      margin-top: 1rem;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
  currentLoadingElement = overlay;

  // Start progress simulation if enabled
  if (config.showProgress) {
    startProgressSimulation();
  }

  return {
    removeLoading: () => removeLoading(),
    updateProgress: (progress: number) => updateProgress(progress),
    updateMessage: (message: string, submessage?: string) => updateMessage(message, submessage)
  };
}

export function removeLoading() {
  if (currentLoadingElement) {
    currentLoadingElement.remove();
    currentLoadingElement = null;
  }

  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }

  loadingProgress = 0;

  // Remove style elements
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    if (style.textContent?.includes('.loading-overlay')) {
      style.remove();
    }
  });
}

function startProgressSimulation() {
  loadingProgress = 0;
  progressInterval = setInterval(() => {
    loadingProgress += Math.random() * 15;
    if (loadingProgress > 95) {
      loadingProgress = 95;
    }
    updateProgress(loadingProgress);
  }, 500);
}

function updateProgress(progress: number) {
  if (!currentLoadingElement) return;

  const progressFill = currentLoadingElement.querySelector('.progress-fill') as HTMLElement;
  const progressText = currentLoadingElement.querySelector('.progress-text') as HTMLElement;

  if (progressFill && progressText) {
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
  }
}

function updateMessage(message: string, submessage?: string) {
  if (!currentLoadingElement) return;

  const messageEl = currentLoadingElement.querySelector('.loading-message');
  const submessageEl = currentLoadingElement.querySelector('.loading-submessage');

  if (messageEl) {
    messageEl.textContent = message;
  }

  if (submessageEl && submessage) {
    submessageEl.textContent = submessage;
  }
}
