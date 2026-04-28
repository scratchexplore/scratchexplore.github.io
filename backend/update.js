const fs = require('fs');
const path = require("path")

// If you are on this list and you would rather not be, you can contact me on scratch @Penthusiast
const CURATORS = require('./curators.json')
const LIMIT = 350;

let savedProjects = {};

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
    const age = (now - shared) / (1000 * 60 * 60 * 24 * 40);
    const ageWeight = 2 / (age + 1);
    const curatorsWeight = project.count; 
    return (curatorsWeight * ageWeight);
}

(async () => {
    for (const curator of CURATORS) {
        const favorites = await getFavorites(curator);
        for (const project of favorites) {
            if (savedProjects[project.id]) {
                savedProjects[project.id].count++;
            } else {
                if (project.is_published) {
                    savedProjects[project.id] = {
                        count: 1,
                        id: project.id,
                        title: project.title,
                        shared: project.history.shared,
                        banner: project.image,
                        avatar: project.author.profile.images['32x32'],
                        loves: project.stats.loves,
                        favorites: project.stats.favorites,
                        views: project.stats.views
                    }
                }
            }
        }

        await sleep(100);
    }

    console.log('Finished discovering projects, processing')

    let projects = Object.values(savedProjects);

    // Since scratch just doesn't return usernames we have to fetch 
    // per project to get the username lol
    
    projects = projects.map(project => {
        project.weight = weight(project);
        return project;
    }).sort((a, b) => b.weight - a.weight).slice(0, LIMIT);

    console.log(`Resolving usernames for ${projects.length} projects`);

    for (const project of projects) {
        const username = await getUsername(project.id);
        project.username = username;
        await sleep(20);
    }

    fs.writeFileSync(path.join(__dirname, "../data/trending.json"), JSON.stringify(projects, null, 2))
})();
