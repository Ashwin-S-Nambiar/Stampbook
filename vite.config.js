import { createHash } from 'node:crypto';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createServer, defineConfig } from 'vite';

const documentShell = () => {
  let outDir;
  let devServer;
  return {
    name: 'document-shell',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      devServer = server;
    },
    async transformIndexHtml(html) {
      const server =
        devServer ||
        (await createServer({
          configFile: false,
          cacheDir: 'node_modules/.vite-shell',
          plugins: [react()],
          server: { middlewareMode: true },
          appType: 'custom',
          optimizeDeps: { noDiscovery: true, include: [] },
        }));
      try {
        const { renderShell, renderBootstrap } = await server.ssrLoadModule(
          '/scripts/render-shell.jsx',
        );
        const shell = renderShell();
        const version = createHash('sha256')
          .update(html)
          .update(shell)
          .update(renderBootstrap(''))
          .digest('hex')
          .slice(0, 16);
        return html.replace(
          '<div id="root"></div>',
          `<div id="root">${shell}</div><script>${renderBootstrap(version)}</script>`,
        );
      } finally {
        if (!devServer) await server.close();
      }
    },
    async closeBundle() {
      if (devServer) return;
      const path = resolve(outDir, 'index.html');
      let html = await readFile(path, 'utf8');
      const sheet = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
      if (sheet) {
        let css = await readFile(
          resolve(outDir, sheet[1].replace(/^\//, '')),
          'utf8',
        );
        for (const font of [
          'public-sans-latin',
          'barlow-condensed-600',
          'barlow-condensed-700',
          'red-hat-mono-latin',
        ]) {
          const file = `/fonts/${font}.woff2`;
          const data = await readFile(resolve(outDir, file.slice(1)));
          css = css.replaceAll(
            file,
            `data:font/woff2;base64,${data.toString('base64')}`,
          );
          html = html.replace(
            new RegExp(`<link\\b[^>]*href="${file}"[^>]*>`, 'g'),
            '',
          );
        }
        css = css.replace(/@font-face\{[^}]*data:font\/woff2[^}]*\}/g, (face) =>
          face.replace('font-display:swap', 'font-display:block'),
        );
        const paper = await readFile(resolve(outDir, 'paper.svg'), 'utf8');
        css = css.replaceAll(
          '/paper.svg',
          `data:image/svg+xml,${encodeURIComponent(paper)}`,
        );
        html = html.replace(sheet[0], `<style>${css}</style>`);
      }
      await writeFile(path, html);
      await copyFile(path, resolve(outDir, '404.html'));
    },
  };
};

const iconWeights = (keep) => ({
  name: 'icon-weights',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('@phosphor-icons/react/dist/defs/')) return;
    return code.replace(
      /\n {2}\[\n {4}"(\w+)",[\s\S]*?\n {2}\],?/g,
      (entry, weight) => (keep.includes(weight) ? entry : ''),
    );
  },
});

export default defineConfig({
  worker: { format: 'es' },
  plugins: [
    react(),
    tailwindcss(),
    documentShell(),
    iconWeights(['regular', 'bold', 'fill']),
  ],
});
