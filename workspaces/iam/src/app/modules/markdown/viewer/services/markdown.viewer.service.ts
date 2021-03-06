import { Injectable, Optional } from '@angular/core';
// import highlightjs from 'highlight.js/lib/highlight';
import prismjs from 'prismjs';
import * as MarkdownIt from 'markdown-it';
import markdownVideoPlugin from 'markdown-it-video';
import tasklists from 'markdown-it-task-lists';
import emoji from 'markdown-it-emoji/light';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import footnote from 'markdown-it-footnote';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import imsize from 'markdown-it-imsize';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import { ContainerPlugin } from './plugins/container';
import { MarkdownConfig } from '../markdown.config';
import latex from 'markdown-it-latex';
import { mergeConf } from '../../../core/index';
//import latex from 'markdown-it-katex';
@Injectable()
export class MarkdownViewerService {
  private defaultConfig: MarkdownConfig = {
    markdownIt: {
      html: true,
      xhtmlOut: false,
      breaks: false,
      langPrefix: 'langPrefix-',
      linkify: true,
      typographer: true
    }
  };

  private markdown: MarkdownIt.MarkdownIt;
  private containerPlugin: ContainerPlugin;
  constructor( @Optional() config?: MarkdownConfig) {
    config = config || mergeConf(this.defaultConfig, config);

    if (!config.markdownIt.highlight) {
      config.markdownIt.highlight = this.DEFAULT_HIGHLIGHT_FUNCTION;
    }

    this.markdown = new MarkdownIt(config.markdownIt);
    this.markdown
      .use(markdownVideoPlugin, {
        youtube: { width: 640, height: 390 }
      })
      .use(tasklists, { enabled: false })
      .use(emoji)
      .use(sub)
      .use(sup)
      .use(ins)
      .use(mark)
      .use(footnote)
      .use(deflist)
      .use(abbr)
      .use(anchor)
      .use(toc)
      .use(latex)
      .use(imsize, { autofill: true });

    this.containerPlugin = new ContainerPlugin(this.markdown, 'warning');
    // Beautify output of parser for html content
    this.markdown.renderer.rules.table_open = function () {
      return '<table class="table table-striped">\n';
    };
    this.markdown.renderer.rules.blockquote_open = function () {
      return '<blockquote class="blockquote">\n';
    };

  }

  public render(raw: string): string {
    return `${this.markdown.render(raw)}`;
  }

  private DEFAULT_HIGHLIGHT_FUNCTION = (str, lang) => {
    let language = prismjs.languages[lang];
    if (lang && language) {
      try {
        return `<pre class="language-${lang}"><code> ${prismjs.highlight(str, language)} </code></pre>`;
      } catch (__) { }
    }
    return '<pre class="highlight"><code>' + this.markdown.utils.escapeHtml(str) + '</code></pre>';
  }
  // private DEFAULT_HIGHLIGHT_FUNCTION = (str, lang) => {
  //   if (lang && highlightjs.getLanguage(lang)) {
  //     try {
  //       return '<pre class="hljs"><code>' + highlightjs.highlight(lang, str, true).value + '</code></pre>';
  //     } catch (__) { }
  //   }
  //   return '<pre class="hljs"><code>' + this.markdown.utils.escapeHtml(str) + '</code></pre>';
  // }

}
