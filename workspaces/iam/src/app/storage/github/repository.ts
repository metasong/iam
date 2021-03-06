
import { Const } from './model/const';
import { UserInfo } from './user-info';
import { Requestable } from './requestable';
import { Injectable } from '@angular/core';
import { Content } from './model/content';
import { File } from './model/file';
import { HttpClient } from '@angular/common/http';
import { Issue } from './issues/issue';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class Repository extends Requestable {
    remoteRepo: any;
    public fullName: string;

    constructor(http: HttpClient, userInfo: UserInfo, private _name: string, private githubApi) {
        super(http, userInfo);
        this.fullName = `${this._userInfo.name}/${this._name}`;
        this.remoteRepo = githubApi.getRepo(userInfo.name, _name);
    }

    get issue() {
        return new Issue(this._http, this._name, this._userInfo);
    }

    renameFile(oldName: string, newName: string) {
        return Observable.fromPromise(this.remoteRepo.move('master', oldName, newName));
    }

    // https://developer.github.com/v3/repos/contents/
    file(path: string, contents: string, branch: string = 'master') {
        let getShaSuccess = false;
        return this.getSha(path, branch)
            .do(x => console.log('getSha' + x), e => console.log('getSha' + e))
            .flatMap(resp => {
                getShaSuccess = true;
                return this.updateFile(path, contents, resp['sha']);
            })
            .catch((error, ca) => {
                if (getShaSuccess) {
                    throw error;
                }
                const err = error;
                return this.newFile(path, contents);
            });
    }
    //https://developer.github.com/v3/repos/contents/#update-a-file
    updateFile(path, contents, sha, branch = 'master') {

        return this.request('PUT',
            `/repos/${this.fullName}/contents/${path}`,
            {
                'path': 'pp',
                'message': 'update file',
                'committer': {
                    'name': this._userInfo.name,
                    'email': this._userInfo.email
                },
                'content': btoa(contents),
                'sha': sha,
                branch
            })
            .do(x => console.log(x), e => console.log(e))
            .map(x => {
                return <File>x;
            });
    }

    //https://developer.github.com/v3/repos/contents/#create-a-file
    newFile(path: string, content: string) {
        return this.request('PUT', `/repos/${this.fullName}/contents/${path}`,
            {
                'message': 'create file',
                'committer': {
                    'name': this._userInfo.name,
                    'email': this._userInfo.email
                },
                'content': btoa(content)
            })
            .do(x => console.log('newFile' + x), e => console.log('newFile' + e))
            .map(x => {
                console.log(x);
                return <File>x;
            });
    }

    /**
     * https://developer.github.com/v3/repos/contents/#delete-a-file
     * @param path
     * @param branch
     */
    delFile(path: string, branch: string = 'master') {
        const filePath = path ? encodeURI(path) : '';
        return this.getSha(path, branch)
            .do(x => console.log(x), e => console.log(e))
            .flatMap(response => {
                return this.request('DELETE',
                    `/repos/${this.fullName}/contents/${filePath}`,
                    {
                        'message': 'delete file',
                        'committer': {
                            'name': this._userInfo.name,
                            'email': this._userInfo.email
                        },
                        'content': btoa('delete file'),
                        'sha': response['sha'],
                        branch
                    });
            })
            .do(x => console.log(x), e => console.log(e))
            .map(x => <File>x);
    }

    delFileViaSha(path: string, sha: string, branch: string = 'master') {
        const filePath = path ? encodeURI(path) : '';
        return this.request('DELETE',
            `/repos/${this.fullName}/contents/${filePath}`,
            {
                'message': 'delete file',
                'committer': {
                    'name': this._userInfo.name,
                    'email': this._userInfo.email
                },
                'sha': sha,
                branch
            })
            .do(x => console.log(x), e => console.log(e))
            .map(x => <File>x);
    }

    // https://developer.github.com/v3/repos/contents/#get-contents
    getContents(path: string, branch: string = 'master') {
        path = path ? encodeURI(path) : '';
        return this.request('GET', `/repos/${this.fullName}/contents/${path}`)
            .map(x => <Content | Array<Content>>x);
    }

    getReadme(branch: string = 'master') {
        return this.request('GET', `/repos/${this.fullName}/readme`)
            .map(x => <Content | Array<Content>>x);
    }

    /**
     * https://developer.github.com/v3/repos/contents/#get-contentdm
     */
    private getSha(path: string, branch: string = '') {
        branch = branch ? `?ref=${branch}` : '';
        return this.request('GET', `/repos/${this.fullName}/contents/${path}${branch}`, {
            ref: branch
        });
    }

}
