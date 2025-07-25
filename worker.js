// worker.js - Cloudflare Worker 脚本
// 为现有的 R2 对象动态添加正确的 Content-Encoding 头

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 处理 wasm 文件请求
    if (pathname.endsWith('.wasm.gz') || pathname.endsWith('.wasm.br')) {
      // 从 R2 获取原始对象
      const object = await env.WEBOFFICE_BUCKET.get(pathname.substring(1));

      if (!object) {
        return new Response('File not found', { status: 404 });
      }

      // 设置正确的响应头
      const headers = new Headers();
      headers.set('Content-Type', 'application/wasm');
      headers.set('Cache-Control', 'public, max-age=31536000');

      // 根据文件扩展名设置 Content-Encoding
      if (pathname.endsWith('.wasm.gz')) {
        headers.set('Content-Encoding', 'gzip');
      } else if (pathname.endsWith('.wasm.br')) {
        headers.set('Content-Encoding', 'br');
      }

      return new Response(object.body, {
        headers: headers
      });
    }

    // 对于其他请求，直接从 R2 返回
    const object = await env.WEBOFFICE_BUCKET.get(pathname.substring(1));
    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  }
};
