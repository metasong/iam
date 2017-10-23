import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownViewService } from '../services/markdown.view.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'markdown-viewer',
  templateUrl: 'markdown-viewer.component.html'
})
export class MarkdownViewerComponent {
  @Input()
  set model(value: string) {
    if (value) {
      this.parsedModel = this.sanitized.bypassSecurityTrustHtml(this.markdown.render(value));
    } else {
      this.parsedModel = '';
    }
  }

  private parsedModel: any;

  constructor(private sanitized: DomSanitizer, service: MarkdownViewService) {
  }

}
