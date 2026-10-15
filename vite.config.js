import { cpSync, createReadStream, existsSync, rmSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = import.meta.dirname;
const artifactName = 'web-freestreaming';
const distRoot = resolve(root, 'dist');
const artifactDir = resolve(distRoot, artifactName);
const jsonDir = resolve(root, 'json');
const distJsonDir = resolve(artifactDir, 'json');
const blockedSource = /^\/(scripts|mock-api|node_modules)(\/|$)/;

function pathnameOf(url = '/') {
  const qIndex = url.indexOf('?');
  return qIndex >= 0 ? url.slice(0, qIndex) : url;
}

function appOnlyGuard(req, res, next) {
  const pathname = pathnameOf(req.url);

  if (pathname === '/json' || pathname === '/json/' || pathname === '/assets' || pathname === '/assets/') {
    res.statusCode = 404;
    res.end();
    return;
  }

  if (blockedSource.test(pathname)) {
    res.statusCode = 404;
    res.end();
    return;
  }

  next();
}

function attachGuard(server) {
  server.middlewares.stack.unshift({ route: '', handle: appOnlyGuard });
}

function catalogJsonPlugin() {
  return {
    name: 'catalog-json',
    configureServer(server) {
      attachGuard(server);
      server.middlewares.use((req, res, next) => {
        const pathname = pathnameOf(req.url);
        if (!pathname.startsWith('/json/')) return next();
        const file = resolve(jsonDir, decodeURIComponent(pathname.slice('/json/'.length)));
        if (!file.startsWith(jsonDir) || !existsSync(file) || !statSync(file).isFile()) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        createReadStream(file).pipe(res);
      });
    },
    configurePreviewServer(server) {
      attachGuard(server);
    },
    buildStart() {
      rmSync(distRoot, { recursive: true, force: true });
    },
    closeBundle() {
      cpSync(jsonDir, distJsonDir, { recursive: true });
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  base: './',
  publicDir: false,
  server: {
    port: 8080,
    strictPort: true,
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
  build: {
    outDir: artifactDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
      },
    },
  },
  plugins: [catalogJsonPlugin()],
});
