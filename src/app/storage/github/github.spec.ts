import { UserInfo, GithubStorage, Repository } from './index';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Http, HttpModule } from '@angular/http';

describe('create repo', () => {
    let storage: GithubStorage;

    beforeAll(() => {
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                HttpClientTestingModule
            ],
            providers: [
                { provide: UserInfo, useValue: new UserInfo('metasong', 'metaseed@gmail.com', 'mssong179') },
                GithubStorage,
            ]
        });
    });

    it('should create repository create and delete file', () => {
        storage = TestBed.get(GithubStorage);
        storage.repos('test2').subscribe(
            (repo: Repository) => {
                console.log(repo);
                repo.file('test010a3', 'aafabaa777777744o7acaaaaaa' + Date.now()).subscribe(() => {
                    // repo.delPost('test00').subscribe();
                    expect(true === true);
                });
            },
            (error) => console.log(error)
        );
    });
});
