const fs = require('fs');
const path = require("path")

let savedProjects = {};

// Will add more.
const curators = [
    'Penthusiast',
    'man-o-valor',
    'Chrome_Cat',
    'theChAOTiC',
    'BamBozzle',
    'awesome-llama',
    'Will_Wam',
    'rat-violi',
    'kevin_eleven_1234',
    '--Loot--',
    'RememberNovember',
    'HollowGoblin',
    'yoshihome',
    'MathematicProjects',
    'FaceOs',
    '-KingMidas-',
    'Robostew',
    'SpinningCube',
    'alexandretherrien',
    's_federici',
    'axolotan',
    '1BellaPup',
    'ChessProking-tm',
    'samkov',
    'ChuckSploder',
    'Derble',
    'finnagin5',
    'oh261401',
    'piano_miles',
    'MathMathMath',
    'alps88',
    'skyset',
    'alphabetica',
    'ggenije',
    'Hobson-TV',
    'dillyd',
    'Dinosu',
    'nembence',
    '52525rr',
    'PullJosh',
    'MonkeyBean2',
    'IguanaLover',
    'Mr-Mathmatical',
    'leszpio',
    'adeoguntechno',
    'integrated',
    'Haudio',
    'vubi',
    'PlXELS',
    'viimo',
    'PokeNinjaGuy',
    'shock59',
    'DevIog'
]

async function getFavorites(user) {
    const url = `https://api.scratch.mit.edu/users/${user}/favorites`;
    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const json = await response.json();
        return json;
    } catch (error) {
        return [];
    }
}

async function getUsername(id) {
    const url = `https://api.scratch.mit.edu/projects/${id}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return "unknown_user";
        const json = await response.json();
        return json.author.username;
    } catch (error) {
        return "unknown_user";
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function weight(project) {
    const shared = new Date(project.shared);
    const now = new Date();

    const age = (now - shared) / (1000 * 60 * 60 * 24 * 30);
    const ageWeight = 2 / (Math.sqrt(age) + 1);

    const viewToLoveWeight = 1 + project.loves / Math.max(project.views, 20);

    const curatorsWeight = Math.sqrt(project.count);
    
    return (curatorsWeight * viewToLoveWeight * ageWeight);
}

(async () => {
    for (const curator of curators) {
        const favorites = await getFavorites(curator);
        console.log(`Fetched favorites from ${curator}`);

        for (const project of favorites) {
            if (savedProjects[project.id]) {
                savedProjects[project.id].count++;
            } else {
                // Have had an issue with people loving projects and
                // them being unshared later. Still persists in the api
                // and it causes a fetch error.
                if (project.is_published) {
                    savedProjects[project.id] = {
                        count: 1,
                        id: project.id,
                        title: project.title,
                        shared: project.history.shared,
                        banner: project.image,
                        avatar: project.author.profile.images['32x32'],
                        // My biggest possible beef with the api is perhaps the fact that
                        // while it includes all sorts of information about the user
                        // it doesn't include the username, which might be the most
                        // important part. 
                        loves: project.stats.loves,
                        favorites: project.stats.favorites,
                        views: project.stats.views
                    }
                }
            }
        }

        // Since this script runs once per day, we can afford to let the servers
        // have some peace. Might have to rethink if we really add a ton more curators.
        // Either way scratch is ratelimiting now and I would prefer to be safe.
        await sleep(1000);
    }

    let projects = Object.values(savedProjects);

    // Since scratch just doesn't return usernames we have to fetch 
    // per project to get the username lol
    console.log('Resolving usernames');

    for (const project of projects) {
        project.weight = weight(project);
        const username = await getUsername(project.id);
        project.username = username;
        await sleep(200);
    }

    projects.sort((a, b) => b.weight - a.weight);

    fs.writeFileSync(path.join(__dirname, "../data/trending.json"), JSON.stringify(projects, null, 2))
})();
