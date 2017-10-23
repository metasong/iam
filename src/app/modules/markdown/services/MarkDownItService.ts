import { Injectable } from '@angular/core';

import { MarkdownItConfig } from '../MarkdownItConfig';
import * as  MarkdownIt from 'markdown-it';
import mdContainer from 'markdown-it-container';





@Injectable()
export class MarkdownItService {

  private markdown;
  private plugins = [];

  constructor(private config: MarkdownItConfig) {
    if (config) {
      this.markdown = new MarkdownIt({
        html: this.setProperty(this.config.html, false),
        xhtmlOut: this.setProperty(this.config.xhtmlOut, false),
        breaks: this.setProperty(this.config.breaks, false),
        langPrefix: this.setProperty(this.config.langPrefix, 'langPrefix-'),
        linkify: this.setProperty(this.config.linkify, false),
        typographer: this.setProperty(this.config.typographer, false),
        highlight: this.setProperty(this.config.highlight, DEFAULT_HIGHLIGHT_FUNCTION),
      });
      if (this.config.containers) {
        this.config.containers.forEach(container => {
          this.markdown.use(
            mdContainer,
            container.name,
            this.setProperty(container.options, DEFAULT_CONTAINER_FUNCTION(
              container.name,
              container.class,
              this.setProperty(container.showHeading, true)
            ))
          );
        });
      }
    } else {
      this.markdown = new MarkdownIt({
        html: false,
        xhtmlOut: false,
        breaks: false,
        langPrefix: 'language-',
        linkify: false,
        typographer: false,
        highlight: DEFAULT_HIGHLIGHT_FUNCTION
      });
    }
  }


  /**
   * The method will take a string as an input and convert it to markdown.
   * @param raw String that you want to render using markdown
   */
  public render(raw: string): string {
    return `${this.markdown.render(raw)}`;
  }

  private setProperty(value: any, defaultValue: any): any {
    if (value) {
      return value;
    } else {
      return defaultValue;
    }

  }
}