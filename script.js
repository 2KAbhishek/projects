const username = '2kabhishek';
const maxPages = 2;
const repoList = document.querySelector('.repo-list');
const reposSection = document.querySelector('.repos');
const filterInput = document.querySelector('.filter-repos');

let devicons = {
    'C#': '<i class="devicon-csharp-plain colored"></i> C#',
    'C++': '<i class="devicon-cplusplus-plain colored"></i> C++',
    C: '<i class="devicon-c-plain colored"></i> C',
    CSS: '<i class="devicon-css3-plain colored"></i> CSS',
    Dockerfile: '<i class="devicon-docker-plain colored"></i> Docker',
    Elixir: '<i class="devicon-elixir-plain colored"></i> Elixir',
    Go: '<i class="devicon-go-plain colored"></i> Go',
    HTML: '<i class="devicon-html5-plain colored"></i> HTML',
    Haskell: '<i class="devicon-haskell-plain colored"></i> Haskell',
    Java: '<i class="devicon-java-plain colored" style="color: #ffca2c"></i> Java',
    JavaScript: '<i class="devicon-javascript-plain colored"></i> JavaScript',
    'Jupyter Notebook': '<i class="devicon-jupyter-plain colored"></i> Jupyter',
    Kotlin: '<i class="devicon-kotlin-plain colored" style="color: #796bdc"></i> Kotlin',
    Lua: '<i class="devicon-lua-plain-wordmark colored" style="color: #0000d0"></i> Lua',
    Nim: '<i class="devicon-nixos-plain colored" style="color: #FFC200"></i> Nim',
    PHP: '<i class="devicon-php-plain colored"></i> PHP',
    PLSQL: '<i class="devicon-sqlite-plain colored"></i> PLSQL',
    Processing: '<i class="devicon-processing-plain colored" style="color: #0096D8"></i> Processing',
    Python: '<i class="devicon-python-plain colored" style="color: #3472a6"></i> Python',
    Ruby: '<i class="devicon-ruby-plain colored"></i> Ruby',
    Rust: '<i class="devicon-rust-plain colored" style="color: #DEA584"></i> Rust',
    Sass: '<i class="devicon-sass-original colored"></i> Sass',
    Scala: '<i class="devicon-scala-plain colored"></i> Scala',
    Shell: '<i class="devicon-bash-plain colored" style="color: #89E051"></i> Shell',
    Swift: '<i class="devicon-swift-plain colored"></i> Swift',
    TypeScript: '<i class="devicon-typescript-plain colored"></i> TypeScript',
    null: '<i class="devicon-markdown-original"></i> Markdown',
};

// get information from github profile
const getProfile = async function () {
    const res = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: 'token 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'
        }
    });
    const profile = await res.json();
    displayProfile(profile);
};
getProfile();

// display infomation from github profile
const displayProfile = function (profile) {
    const userInfo = document.querySelector('.user-info');
    userInfo.innerHTML = `
        <figure>
            <img alt="user avatar" src=${profile.avatar_url} />
        </figure>
        <div>
            <h2><a href=${profile.blog}><strong>${profile.name}</strong></a></h2>
            <p>${profile.bio}</p>
            <p>
                <strong>Location:</strong> ${profile.location}
                <strong>Company:</strong> ${profile.company}
            </p>
            <p>
                <strong>@${profile.login} </strong>
                Repos: ${profile.public_repos}
                Gists: ${profile.public_gists}
                Followers: ${profile.followers}
            </p>
        </div>
    `;
};

// get list of user's public repos
const getRepos = async function () {
    let repos = [];
    let res;
    for (let i = 1; i <= maxPages; i++) {
        res = await fetch(
            `https://api.github.com/users/${username}/repos?&sort=pushed&per_page=100&page=${i}`,
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization:
                        'token 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'
                }
            }
        );
        let data = await res.json();
        repos = repos.concat(data);
    }
    displayRepos(repos);
};
getRepos();

// display list of all user's public repos
const displayRepos = function (repos) {
    filterInput.classList.remove('hide');
    for (const repo of repos) {
        let listItem = document.createElement('li');
        listItem.classList.add('repo');
        listItem.innerHTML = `
            <h3>${repo.name}</h3>
            <span>${repo.description}</span> <br/><br/>
            <span>${devicons[repo.language]}</span> <br />
            <br />
            <a href=${repo.homepage}>View Project</a>`;
        repoList.append(listItem);
    }
};

// dynamic search
filterInput.addEventListener('input', function (e) {
    const search = e.target.value;
    const repos = document.querySelectorAll('.repo');
    const searchLowerText = search.toLowerCase();

    for (const repo of repos) {
        const lowerText = repo.innerText.toLowerCase();
        if (lowerText.includes(searchLowerText)) {
            repo.classList.remove('hide');
        } else {
            repo.classList.add('hide');
        }
    }
});
