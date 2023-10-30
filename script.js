const username = '2KAbhishek';
const maxPages = 3;
const hideForks = true;
const repoList = document.querySelector('.repo-list');
const reposSection = document.querySelector('.repos');
const filterInput = document.querySelector('.filter-repos');

// get information from github profile
const getProfile = async () => {
    const res = await fetch(
        `https://api.github.com/users/${username}`
        // {
        //     headers: {
        //         Accept: 'application/vnd.github+json',
        //         Authorization: 'token your-personal-access-token-here'
        //     }
        // }
    );
    const profile = await res.json();
    displayProfile(profile);
};
getProfile();

// display infomation from github profile
const displayProfile = (profile) => {
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
            </p>
            <p>
                <strong>@${profile.login} </strong>
                Repos: ${profile.public_repos}
                Gists: ${profile.public_gists}
            </p>
        </div>
    `;
};

// get list of user's public repos
const getRepos = async () => {
    let repos = [];
    let res;
    for (let i = 1; i <= maxPages; i++) {
        res = await fetch(
            `https://api.github.com/users/${username}/repos?&sort=pushed&per_page=100&page=${i}`
            // {
            //     headers: {
            //         Accept: 'application/vnd.github+json',
            //         Authorization:
            //             'token your-personal-access-token-here'
            //     }
            // }
        );
        let data = await res.json();
        repos = repos.concat(data);
    }
    repos.sort((a, b) => b.forks_count - a.forks_count);
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    displayRepos(repos);
};
getRepos();

// display list of all user's public repos
const displayRepos = (repos) => {
    const userHome = `https://github.com/${username}`;
    filterInput.classList.remove('hide');
    for (const repo of repos) {
        if (repo.fork && hideForks) {
            continue;
        }

        const langUrl = `${userHome}?tab=repositories&q=&language=${repo.language}`;
        const starsUrl = `${userHome}/${repo.name}/stargazers`;
        const forksUrl = `${userHome}/${repo.name}/network/members`;

        let listItem = document.createElement('li');
        listItem.classList.add('repo');
        listItem.innerHTML = `
            <h3>${repo.name}</h3>
            <span>${repo.description}</span> <br/><br/>`;

        if (repo.stargazers_count > 0) {
            listItem.innerHTML += `<a href="${starsUrl}">
            <span>⭐ ${repo.stargazers_count}</span></a>`;
        }

        if (repo.language) {
            listItem.innerHTML += `<a href="${langUrl}">
            <span>${devicons[repo.language]}</span></a>`;
        }

        if (repo.forks_count > 0) {
            listItem.innerHTML += `<a href="${starsUrl}">
            <span>${devicons['Git']} ${repo.forks_count}</span></a>`;
        }

        if (repo.homepage && repo.homepage !== '') {
            listItem.innerHTML += `<br /> <br />
            <a class="link-btn" href=${repo.html_url}>Code ${devicons['Github']}</a>
            <a class="link-btn" href=${repo.homepage}>Live ${devicons['Chrome']}</a> <br />`;
        } else {
            listItem.innerHTML += `<br /> <br />
            <a class="link-btn" href=${repo.html_url}>View Project ${devicons['Github']}</a><br />`;
        }

        repoList.append(listItem);
    }
};

// dynamic search
filterInput.addEventListener('input', (e) => {
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

// for programming language icons
const devicons = {
    Git: '<i class="devicon-git-plain" style="color: #555"></i>',
    Github: '<i class="devicon-github-plain" style="color: #1688f0"></i>',
    Chrome: '<i class="devicon-chrome-plain" style="color: #1688f0"></i>',
    Assembly: '<i class="devicon-labview-plain colored"></i> Assembly',
    'C#': '<i class="devicon-csharp-plain colored"></i> C#',
    'C++': '<i class="devicon-cplusplus-plain colored"></i> C++',
    C: '<i class="devicon-c-plain colored"></i> C',
    Clojure: '<i class="devicon-clojure-plain colored"></i> C',
    CoffeeScript:
        '<i class="devicon-coffeescript-plain colored"></i> CoffeeScript',
    Crystal: '<i class="devicon-crystal-plain colored"></i> Crystal',
    CSS: '<i class="devicon-css3-plain colored"></i> CSS',
    Dart: '<i class="devicon-dart-plain colored"></i> Dart',
    Dockerfile: '<i class="devicon-docker-plain colored"></i> Docker',
    Elixir: '<i class="devicon-elixir-plain colored"></i> Elixir',
    Elm: '<i class="devicon-elm-plain colored"></i> Elm',
    Erlang: '<i class="devicon-erlang-plain colored"></i> Erlang',
    'F#': '<i class="devicon-fsharp-plain colored"></i> F#',
    Go: '<i class="devicon-go-plain colored"></i> Go',
    Groovy: '<i class="devicon-groovy-plain colored"></i> Groovy',
    HTML: '<i class="devicon-html5-plain colored"></i> HTML',
    Haskell: '<i class="devicon-haskell-plain colored"></i> Haskell',
    Java: '<i class="devicon-java-plain colored" style="color: #ffca2c"></i> Java',
    JavaScript: '<i class="devicon-javascript-plain colored"></i> JavaScript',
    Julia: '<i class="devicon-julia-plain colored"></i> Julia',
    'Jupyter Notebook': '<i class="devicon-jupyter-plain colored"></i> Jupyter',
    Kotlin: '<i class="devicon-kotlin-plain colored" style="color: #796bdc"></i> Kotlin',
    Latex: '<i class="devicon-latex-plain colored"></i> Latex',
    Lua: '<i class="devicon-lua-plain-wordmark colored" style="color: #0000d0"></i> Lua',
    Matlab: '<i class="devicon-matlab-plain colored"></i> Matlab',
    Nim: '<i class="devicon-nixos-plain colored" style="color: #FFC200"></i> Nim',
    Nix: '<i class="devicon-nixos-plain colored"></i> Nix',
    ObjectiveC: '<i class="devicon-objectivec-plain colored"></i> ObjectiveC',
    OCaml: '<i class="devicon-ocaml-plain colored"></i> OCaml',
    Perl: '<i class="devicon-perl-plain colored"></i> Perl',
    PHP: '<i class="devicon-php-plain colored"></i> PHP',
    PLSQL: '<i class="devicon-sqlite-plain colored"></i> PLSQL',
    Processing:
        '<i class="devicon-processing-plain colored" style="color: #0096D8"></i> Processing',
    Python: '<i class="devicon-python-plain colored" style="color: #3472a6"></i> Python',
    R: '<i class="devicon-r-plain colored"></i> R',
    Ruby: '<i class="devicon-ruby-plain colored"></i> Ruby',
    Rust: '<i class="devicon-rust-plain colored" style="color: #DEA584"></i> Rust',
    Sass: '<i class="devicon-sass-original colored"></i> Sass',
    Scala: '<i class="devicon-scala-plain colored"></i> Scala',
    Shell: '<i class="devicon-bash-plain colored" style="color: #89E051"></i> Shell',
    Solidity: '<i class="devicon-solidity-plain colored"></i> Solidity',
    Stylus: '<i class="devicon-stylus-plain colored"></i> Stylus',
    Svelte: '<i class="devicon-svelte-plain colored"></i> Svelte',
    Swift: '<i class="devicon-swift-plain colored"></i> Swift',
    Terraform: '<i class="devicon-terraform-plain colored"></i> Terraform',
    TypeScript: '<i class="devicon-typescript-plain colored"></i> TypeScript',
    'Vim Script': '<i class="devicon-vim-plain colored"></i> Vim Script',
    Vue: '<i class="devicon-vuejs-plain colored"></i> Vue'
};
