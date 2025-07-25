import 'ranui/loading';

export const showLoading = (message: string = 'Loading document...'): { removeLoading: () => void } => {
  const loading = document.createElement('r-loading');
  loading.setAttribute('name', 'circle');
  loading.setAttribute('size', 'large');
  loading.style.cssText = `
    color: #1890ff;
    font-size: 24px;
  `;

  const loadingText = document.createElement('div');
  loadingText.textContent = message;
  loadingText.style.cssText = `
    color: #ffffff;
    font-size: 16px;
    margin-top: 16px;
    font-weight: 500;
    text-align: center;
  `;

  const loadingContainer = document.createElement('div');
  loadingContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;
  loadingContainer.appendChild(loading);
  loadingContainer.appendChild(loadingText);

  const mask = document.createElement('div');
  mask.setAttribute('class', 'w-full h-full fixed top-0 left-0 bg-black/50 flex items-center justify-center z-[5]');
  mask.style.cssText = `
    backdrop-filter: blur(4px);
  `;
  mask.appendChild(loadingContainer);
  document.body.appendChild(mask);

  return {
    removeLoading: () => {
      if (document.body?.contains(mask)) {
        document.body?.removeChild(mask);
      }
    },
  };
};
