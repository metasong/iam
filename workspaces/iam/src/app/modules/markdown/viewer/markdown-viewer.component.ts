import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownViewerService } from './services/markdown.viewer.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'markdown-viewer',
  templateUrl: 'markdown-viewer.component.html',
  styleUrls: [
    './markdown-viewer.component.scss'
  ]
})
export class MarkdownViewerComponent {
  @Input()
  set model(value: string) {
    if (value) {
      this.parsedModel = this.sanitized.bypassSecurityTrustHtml(this.service.render(value));
    } else {
      this.parsedModel = '';
    }
  }

  parsedModel: any;

  constructor(private sanitized: DomSanitizer, private service: MarkdownViewerService) {
  }

}
