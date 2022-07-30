const username = '2kabhishek';
const maxPages = 2;
const repoList = document.querySelector('.repo-list');
const reposSection = document.querySelector('.repos');
const filterInput = document.querySelector('.filter-repos');

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
            <p><strong>Name:</strong> ${profile.name}</p>
            <p><strong>Bio:</strong> ${profile.bio}</p>
            <p><strong>Location:</strong> ${profile.location}</p>
            <p><strong>Number of public repos:</strong> ${profile.public_repos}</p>
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
            <span>${repo.description}</span> <br/>
            <code>${repo.language}</code> <br />
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

