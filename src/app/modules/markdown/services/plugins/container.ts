import { Injectable } from '@angular/core';
import * as MarkdownIt from 'markdown-it';
import markdownContainer from 'markdown-it-container';

@Injectable()
export class ContainerPlugin {
    constructor(private markdown: MarkdownIt.MarkdownIt, name: string,
        private option?: (...params) => { validate: (params) => any, render: (tokens, idx) => string }) {
        this.option = this.option || this.DEFAULT_CONTAINER_FUNCTION;
        this.markdown.use(markdownContainer, name, option);
    }

    private DEFAULT_CONTAINER_FUNCTION = (name: string, cssClass?: string, showHeading?: boolean) => {
        const regex = new RegExp(`^${name}\s+(.*)$`);
        const me = this;
        return {
            validate: function (params) {
                return params.trim().match(regex);
            },

            render: function (tokens, idx) {
                const m = tokens[idx].info.trim().match(regex);
                if (tokens[idx].nesting === 1) {
                    return `<details class="${cssClass ? cssClass : name}">  <summary>
                    ${showHeading ? '<b>' + me.markdown.utils.escapeHtml(m[1]) + '</b>' : ''}\n`;
                } else {
                    return '</details>';
                }
            }
        };
    }
}


// console.log(md.render('::: spoiler click me\n*content*\n:::\n'));

// Output:
//
// <details><summary>click me</summary>
// <p><em>content</em></p>
// </details>

