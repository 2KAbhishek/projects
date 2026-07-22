const username = '2KAbhishek';
const maxPages = 3;
const hideForks = true;
const repoList = document.querySelector('.repo-list');
const reposSection = document.querySelector('.repos');
const filterInput = document.querySelector('.filter-repos');

let totalStars = 0;

// get information from github profile
const getProfile = async () => {
    try {
        const res = await fetch(
            `https://api.github.com/users/${username}`
            // {
            //     headers: {
            //         Accept: 'application/vnd.github+json',
            //         Authorization: 'token your-personal-access-token-here'
            //     }
            // }
        );
        if (!res.ok) {
            throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        }
        const profile = await res.json();
        displayProfile(profile);
    } catch (err) {
        console.error('Failed to load profile:', err);
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.innerHTML = `<p>Failed to load profile. ${err.message}</p>`;
        }
    }
};

// display information from github profile
const displayProfile = (profile) => {
    const userInfo = document.querySelector('.user-info');
    userInfo.innerHTML = `
        <figure>
            <img alt="user avatar" src=${profile.avatar_url} />
        </figure>
        <div>
            <h2><a href=${profile.blog}><strong>${profile.name} - ${profile.login}</strong></a></h2>
            <p>${profile.bio}</p>
            <p>
                Stars: <strong class="total-stars">${totalStars}</strong>
                Followers: <strong>${profile.followers}</strong>
                Repos: <strong>${profile.public_repos}</strong>
                Gists: <strong>${profile.public_gists}</strong>
            </p>
            <p>
                Work: ${profile.company}
                Location: ${profile.location}
            </p>
        </div>
    `;
};

// get list of user's public repos
const getRepos = async () => {
    let repos = [];
    try {
        for (let i = 1; i <= maxPages; i++) {
            const res = await fetch(
                `https://api.github.com/users/${username}/repos?&sort=pushed&per_page=100&page=${i}`
                // {
                //     headers: {
                //         Accept: 'application/vnd.github+json',
                //         Authorization:
                //             'token your-personal-access-token-here'
                //     }
                // }
            );
            if (!res.ok) {
                throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                repos = repos.concat(data);
                // stop early if this page wasn't full - no more pages to fetch
                if (data.length < 100) {
                    break;
                }
            } else {
                break;
            }
        }
    } catch (err) {
        console.error('Failed to load repos:', err);
        repoList.innerHTML = `<p>Failed to load repositories. ${err.message}</p>`;
        return;
    }

    repos.sort((a, b) => b.forks_count - a.forks_count);
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

    totalStars = repos
        .filter((repo) => repo && !repo.fork)
        .reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

    const totalStarsElement = document.querySelector('.total-stars');
    if (totalStarsElement) {
        totalStarsElement.textContent = totalStars;
    }

    displayRepos(repos);
};

// Fetch repos first so star totals are ready before/alongside the profile render,
// then fetch the profile. Both still run, but this avoids the profile card
// briefly showing a stale "0" for stars in the common case.
(async () => {
    await Promise.all([getRepos(), getProfile()]);
})();

// display list of all user's public repos
const displayRepos = (repos) => {
    const userHome = `https://github.com/${username}`;
    filterInput.classList.remove('hide');
    repoList.innerHTML = '';
    for (const repo of repos) {
        if (repo.fork && hideForks) {
            continue;
        }

        const langUrl = `${userHome}?tab=repositories&q=&language=${repo.language}`;
        const starsUrl = `${userHome}/${repo.name}/stargazers`;
        const forksUrl = `${userHome}/${repo.name}/network/members`;

        let listItem = document.createElement('li');
        listItem.classList.add('repo');

        const starsHtml = repo.stargazers_count > 0
            ? `<a href="${starsUrl}"><span class="repo-badge">⭐ ${repo.stargazers_count}</span></a>`
            : '';

        // Guard against languages missing from the devicons map so we never
        // render the literal string "undefined" as a badge.
        let langHtml = '';
        if (repo.language) {
            const icon = devicons[repo.language];
            langHtml = icon
                ? `<a href="${langUrl}"><span class="repo-badge">${icon}</span></a>`
                : `<a href="${langUrl}"><span class="repo-badge">${repo.language}</span></a>`;
        }

        const forksHtml = repo.forks_count > 0
            ? `<a href="${forksUrl}"><span class="repo-badge">${devicons['Git']} ${repo.forks_count}</span></a>`
            : '';

        const statsHtml = (starsHtml || langHtml || forksHtml)
            ? `<div class="repo-stats">${starsHtml}${langHtml}${forksHtml}</div>`
            : '';

        const homepageHtml = repo.homepage && repo.homepage !== ''
            ? `<a class="link-btn" href=${repo.homepage}>${devicons['Chrome']} Live</a>`
            : '';

        listItem.innerHTML = `
            <div class="repo-header">
                <h3 class='repo-name'>${repo.name}</h3>
                <span class='repo-description'>${repo.description || 'No description provided.'}</span>
            </div>
            ${statsHtml}
            <div class="repo-actions">
                <a class="link-btn" href=${repo.html_url}>${devicons['Github']} Code</a>
                ${homepageHtml}
            </div>
        `;

        repoList.append(listItem);
    }
};

// dynamic search
filterInput.addEventListener('input', (e) => {
    const search = e.target.value;
    const repos = document.querySelectorAll('.repo');
    const searchLowerText = search.toLowerCase();
    let visibleCount = 0;

    for (const repo of repos) {
        const lowerText = repo.innerText.toLowerCase();
        if (lowerText.includes(searchLowerText)) {
            repo.classList.remove('hide');
            visibleCount++;
        } else {
            repo.classList.add('hide');
        }
    }

    let noResultsMsg = document.querySelector('.no-results');
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('p');
            noResultsMsg.classList.add('no-results');
            repoList.appendChild(noResultsMsg);
        }
        noResultsMsg.textContent = `No projects found matching "${search}"`;
    } else {
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
});

// for programming language icons
const devicons = {
    Git: '<i class="devicon-git-plain" style="color: #555"></i>',
    Github: '<i class="devicon-github-plain"></i>',
    Chrome: '<i class="devicon-chrome-plain"></i>',
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
    'Objective-C': '<i class="devicon-objectivec-plain colored"></i> Objective-C',
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
    SCSS: '<i class="devicon-sass-original colored"></i> SCSS',
    Scala: '<i class="devicon-scala-plain colored"></i> Scala',
    Shell: '<i class="devicon-bash-plain colored" style="color: #89E051"></i> Shell',
    Solidity: '<i class="devicon-solidity-plain colored"></i> Solidity',
    Stylus: '<i class="devicon-stylus-plain colored"></i> Stylus',
    Svelte: '<i class="devicon-svelte-plain colored"></i> Svelte',
    Swift: '<i class="devicon-swift-plain colored"></i> Swift',
    Terraform: '<i class="devicon-terraform-plain colored"></i> Terraform',
    TypeScript: '<i class="devicon-typescript-plain colored"></i> TypeScript',
    'Vim script': '<i class="devicon-vim-plain colored"></i> Vim Script',
    Vue: '<i class="devicon-vuejs-plain colored"></i> Vue'
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== filterInput) {
        e.preventDefault();
        filterInput.focus();
    }
    if (e.key === 'Escape') {
        filterInput.value = '';
        filterInput.dispatchEvent(new Event('input'));
        filterInput.blur();
    }
});
