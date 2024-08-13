/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import template from './home.js';

export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url);
    const PREFIX = env.PREFIX ?? '/';
    const JSDELIVR_CDN = env.JSDELIVR_CDN;
    const ALLOWED_REPO_PATTERNS = (env.ALLOWED_REPO_PATTERNS ?? ['.*/.*']).map(repo => new RegExp(repo, 'i'));
    const BLOCKED_REPO_PATTERNS = (env.BLOCKED_REPO_PATTERNS ?? []).map(repo => new RegExp(repo, 'i'));


    const urlPatterns = {
      // https://github.com/cloudflare/wrangler-action/archive/refs/tags/v3.7.0.zip
      releasePattern: /^(?:https?:\/\/)?github\.com\/(?<repo>.+?\/.+?)\/(?:releases|archive)\/.*$/i,
      infoPattern: /^(?:https?:\/\/)?github\.com\/(?<repo>.+?\/.+?)\/(?:info|git-).*$/i,
      gitstPattern: /^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/(?<repo>.+?\/.+?)\/.+$/i,
      tagPattern: /^(?:https?:\/\/)?github\.com\/(?<repo>.+?\/.+?)\/tags.*$/i,

      // https://github.com/cloudflare/wrangler-action/blob/main/README.md
      // https://github.com/cloudflare/wrangler-action/raw/main/README.md
      filePattern: /^(?:https?:\/\/)?github\.com\/(?<repo>.+?\/.+?)\/(?:blob|raw)\/.*$/i,
      // https://raw.githubusercontent.com/cloudflare/wrangler-action/main/README.md
      rawPattern: /^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/(?<repo>.+?\/.+?)\/.+?\/.+$/i,

      // 是否应该代理此访问？
      // oauthExp: /^(?:https?:\/\/)?github\.com\/login\/oauth\/.*$/i,
      // api.github.com 似乎可以访问
      // apiPattern: /^(?:https?:\/\/)?api\.github\.com\/.*$/i,
    };


    let githubHref = url.href.slice(url.origin.length + PREFIX.length).replace(/^https?:\/+/, 'https://');

    for (const [patternName, pattern] of Object.entries(urlPatterns)) {
      const match = githubHref.match(pattern);
      if (match) {
        console.log(`github 链接 ${githubHref} 确实可以和 ${pattern} 匹配(${patternName})`)
        const repo = match.groups.repo;
        if (BLOCKED_REPO_PATTERNS.some(repoPattern => repo.match(repoPattern)) || ALLOWED_REPO_PATTERNS.every(repoPattern => !repo.match(repoPattern))) {
          // blocked
          console.log(`${githubHref} is blocked by reponame(${repo}); ALLOW_REPO_PATTERNS(${ALLOWED_REPO_PATTERNS})/BLOCK_REPO_PATTERNS(${BLOCKED_REPO_PATTERNS})`);
          const responseInit = { status: 403, statusText: 'repo is not allowed or blocked' };
          return new Response(JSON.stringify(responseInit), responseInit);
        }

        // 有两个特殊的情况，可能会使用 JSDelivr 来代理
        if (pattern === urlPatterns.filePattern) {
          githubHref = githubHref.replace('/blob/', '/raw/');
          if (JSDELIVR_CDN) {
            const jsdelivrURL = githubHref.replace('/raw/', '@').replace(/^(?:https?:\/\/)?github\.com/, JSDELIVR_CDN);
            return Response.redirect(jsdelivrURL, 302);
          }
        } else if (pattern === urlPatterns.rawPattern) {
          if (JSDELIVR_CDN) {
            const jsdelivrURL = githubHref
              .replace(/(?<=com\/.+?\/.+?)\/(.+?\/)/, '@$1')
              .replace(/^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com/, JSDELIVR_CDN);
            return Response.redirect(jsdelivrURL, 302);
          }
        }

        // preflight
        if (request.method === 'OPTIONS' && requestHeaders.has('access-control-request-headers')) {
          return new Response(null, PREFLIGHT_INIT);
        }
        if (githubHref.search(/^https?:\/\//) !== 0) {
          githubHref = 'https://' + githubHref;
        }

        let upstreamResponse = await fetch(githubHref, {
          body: request.body,
          cache: request.cache,
          credentials: request.credentials,
          headers: request.headers,
          integrity: request.integrity,
          method: request.method,
          mode: request.mode,
          redirect: 'follow',
          referrer: request.referrer,
          referrerPolicy: request.referrerPolicy,
        });

        const responseHeaders = new Headers(upstreamResponse.headers);
        responseHeaders.set('access-control-expose-headers', '*');
        responseHeaders.set('access-control-allow-origin', '*');

        responseHeaders.delete('content-security-policy');
        responseHeaders.delete('content-security-policy-report-only');
        responseHeaders.delete('clear-site-data');

        return new Response(upstreamResponse.body, {
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          headers: responseHeaders,
        });

      }
    }

    if (url.pathname === PREFIX) {
      return new Response(template, {
        headers: { 'content-type': 'text/html' },
      });
    } else {
      // 此链接不在被代理的白名单内
      console.log(`github link ${githubHref} is not allowed`);
      const responseInit = { status: 403, statusText: `github link(${githubHref}) is not allowed` };
      return new Response(JSON.stringify(responseInit), responseInit);
    }
  },
};


/** @type {ResponseInit} */
const PREFLIGHT_INIT = {
  status: 204,
  headers: new Headers({
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
    'access-control-max-age': '1728000',
  }),
};