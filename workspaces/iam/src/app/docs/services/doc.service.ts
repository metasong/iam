import { Injectable, EventEmitter } from '@angular/core';
import { Document } from "../models/document";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { GithubStorage, UserInfo, EditIssueParams } from '../../storage/github/index';
import { Repository } from '../../storage/github/repository';
import { DocsModel } from '../models/docs.model';
import { DocMeta } from '../models/doc-meta';
import { Content } from '../../storage/github/model/content';

@Injectable()
export class DocService {
  static FolderName = 'documents';

  public docAdd$ = new EventEmitter();
  public docRemove$ = new EventEmitter();
  public docModify$ = new EventEmitter();
  public model: DocsModel;
  private docShow$ = new EventEmitter();
  private _repo: Repository;
  private _repoSub$: Observable<Repository>;
  private _storage = new GithubStorage(this._http, new UserInfo('metasong', 'metaseed@gmail.com', 'mssong179'));


  constructor(private _http: HttpClient) {
    this._repoSub$ = this._storage.repos('test2');
    this._repoSub$.subscribe(repo => this._repo = repo);
  }

  // store(todo: Document) {
  //   console.log('Storing' + todo);
  //   return this.http.post(TodoListService.baseUrl + '/todos', todo)
  //     .map(resp => resp.json())
  //     .catch(res => {
  //       console.error(res.toString());
  //       return Observable.throw(res.message || 'Server error')
  //     });
  // }

  deleteDoc(doc) {
    this._repo.issue.edit(doc.number, { state: 'closed' }).subscribe(
      a => console.log(a)
    );
  }
  newDoc() {
    let doc = {
      content: {
        content: btoa('# Title\n*summery*\n')
      }

    }
    this.model.currentDoc = null;
    this.docShow$.next(doc);
  }
  showDoc(doc: Document) {
    this._repo.getContents(`${DocService.FolderName}/${doc.metaData.title}_${doc.number}`).subscribe(
      (content: Content) => {
        doc.content = content;
        this.model.currentDoc = doc;
        this.docShow$.next(doc);
      }
    );
  }

  onShowDoc(fun: (doc: Document) => void) {
    this.docShow$.subscribe(doc => {
      fun(doc);
    });
  }

  getContentUrl(issueNum) {
    return `https://metaseed.github.io/iam/${issueNum}`;
  }

  saveNew = (content: string) => {
    let title = DocMeta.getTitle(content);
    if (!title) throw 'must have title';
    return this._repo.issue.create({ title }).flatMap((issue) => {
      let id = issue.number;
      return this._repo.newFile(`${DocService.FolderName}/${title}_${id}`, content).flatMap((file) => {
        let url = this.getContentUrl(id);
        return DocMeta.serializeContent(content, file.content.sha, url).flatMap(([metaString, metaData]) => {
          let data: EditIssueParams = { title: title, body: <string>metaString };
          return this._repo.issue.edit(id, data).map((doc: Document) => {
            doc.metaData = <DocMeta>metaData;
            this.model.docs.unshift(doc);
            return doc;
          });

        })
      })
    });

  }

  save(content) {
    if (this.model.currentDoc) {
      this.edit(content, this.model.currentDoc).subscribe(doc => {
        this.model.currentDoc = doc;
      });
    } else {
      this.saveNew(content).subscribe(doc => {
        this.model.currentDoc = doc;
      });
    }
  }

  edit = (content: string, doc: Document) => {
    let title = DocMeta.getTitle(content);
    if (!title) throw 'must have title';

    const changeTitle = title !== doc.metaData.title;
    return this._repo.updateFile(`${DocService.FolderName}/${title}_${doc.number}`, content, doc.metaData.contentId).flatMap(
      file => {
        let url = this.getContentUrl(doc.number);
        return DocMeta.serializeContent(content, file.content.sha, url).flatMap(
          ([metaString, metaData]) => {
            let data: EditIssueParams = { title: title, body: <string>metaString };
            return this._repo.issue.edit(doc.number, data).map(
              (a) => {
                if (changeTitle) {
                  this._repo.delFileViaSha(`${DocService.FolderName}/${doc.metaData.title}_${doc.number}`, doc.metaData.contentId).subscribe();
                }
                doc.metaData = <DocMeta>metaData;
                return doc;
              }
            );
          }
        );

      }
    );
  }
  x
  getAll() {
    return this._repoSub$.flatMap(repo => {
      return repo.issue.list('open');
    }).subscribe(
      (docs: Document[]) => {
        let docList = new Array<Document>();
        docs.forEach(d => {
          let meta = DocMeta.deSerialize(d.body);
          if (meta) {
            d.metaData = meta;
            docList.push(d);
          }
        });
        this.model = new DocsModel(docList);
      },
      (error) => {
        console.log(error);
      });;
  }

  // update(todo: Document) {
  //   console.log('Update');

  //   return this.http.put(TodoListService.baseUrl + '/todos/' + todo.id, todo)
  //     .catch(res => {
  //       console.error(res.toString());
  //       return Observable.throw(res.message || 'Server error')
  //     });
  // }
}
