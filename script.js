const username = '2KAbhishek';
const maxPages = 3;
const hideForks = true;
const repoList = document.querySelector('.repo-list');
const filterInput = document.querySelector('.filter-repos');

const fetchProfile = async () => {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) {
        if (res.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
};

const displayProfile = (profile, totalStars) => {
    const userInfo = document.querySelector('.user-info');
    if (!userInfo) return;

    const blogUrl = profile.blog
        ? (profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`)
        : `https://github.com/${profile.login}`;

    const companyHtml = profile.company ? `Work: <strong>${profile.company}</strong>` : '';
    const locationHtml = profile.location ? `Location: <strong>${profile.location}</strong>` : '';
    const extraInfoHtml = (companyHtml || locationHtml)
        ? `<p>${companyHtml}${companyHtml && locationHtml ? ' &nbsp;|&nbsp; ' : ''}${locationHtml}</p>`
        : '';

    userInfo.innerHTML = `
        <figure>
            <img alt="user avatar" src="${profile.avatar_url}" />
        </figure>
        <div>
            <h2><a href="${blogUrl}"><strong>${profile.name || profile.login}</strong></a></h2>
            ${profile.bio ? `<p>${profile.bio}</p>` : ''}
            <p>
                Stars: <strong class="total-stars">${totalStars !== null ? totalStars : '--'}</strong>
                Followers: <strong>${profile.followers ?? 0}</strong>
                Repos: <strong>${profile.public_repos ?? 0}</strong>
                Gists: <strong>${profile.public_gists ?? 0}</strong>
            </p>
            ${extraInfoHtml}
        </div>
    `;
};

const fetchRepos = async () => {
    let repos = [];
    for (let i = 1; i <= maxPages; i++) {
        const res = await fetch(
            `https://api.github.com/users/${username}/repos?&sort=pushed&per_page=100&page=${i}`
        );
        if (!res.ok) {
            if (res.status === 403) {
                throw new Error('GitHub API rate limit exceeded. Please try again later.');
            }
            throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
            repos = repos.concat(data);
            if (data.length < 100) {
                break;
            }
        } else {
            break;
        }
    }
    return repos;
};

const displayRepos = (repos) => {
    const userHome = `https://github.com/${username}`;
    filterInput.classList.remove('hide');
    repoList.innerHTML = '';
    for (const repo of repos) {
        if (repo.fork && hideForks) {
            continue;
        }

        const langUrl = `${userHome}?tab=repositories&q=&language=${encodeURIComponent(repo.language || '')}`;
        const starsUrl = `${userHome}/${repo.name}/stargazers`;
        const forksUrl = `${userHome}/${repo.name}/network/members`;

        let listItem = document.createElement('li');
        listItem.classList.add('repo');

        const starsHtml = repo.stargazers_count > 0
            ? `<a href="${starsUrl}"><span class="repo-badge">⭐ ${repo.stargazers_count}</span></a>`
            : '';

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

        const homepageHtml = repo.homepage
            ? `<a class="link-btn" href="${repo.homepage}">${devicons['Chrome']} Live</a>`
            : '';

        listItem.innerHTML = `
            <div class="repo-header">
                <h3 class="repo-name">${repo.name}</h3>
                <span class="repo-description">${repo.description || 'No description provided.'}</span>
            </div>
            ${statsHtml}
            <div class="repo-actions">
                <a class="link-btn" href="${repo.html_url}">${devicons['Github']} Code</a>
                ${homepageHtml}
            </div>
        `;

        repoList.append(listItem);
    }
};

(async () => {
    const profilePromise = fetchProfile().catch((err) => {
        console.error('Failed to load profile:', err);
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.innerHTML = `<p class="error-msg">Failed to load profile: ${err.message}</p>`;
        }
        return null;
    });

    const reposPromise = fetchRepos().catch((err) => {
        console.error('Failed to load repos:', err);
        repoList.innerHTML = `<p class="error-msg">Failed to load repositories: ${err.message}</p>`;
        return null;
    });

    const [profileData, reposData] = await Promise.all([profilePromise, reposPromise]);

    let totalStars = null;

    if (reposData) {
        reposData.sort((a, b) => b.forks_count - a.forks_count);
        reposData.sort((a, b) => b.stargazers_count - a.stargazers_count);

        totalStars = reposData
            .filter((repo) => repo && !repo.fork)
            .reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

        displayRepos(reposData);
    }

    if (profileData) {
        displayProfile(profileData, totalStars);
    }
})();

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
