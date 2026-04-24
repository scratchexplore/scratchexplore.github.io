const container = document.getElementById('container');
const button = document.getElementById('load');

const projects = await fetch("./data/trending.json");
const data = await projects.json();

function addProject(project) {
    const projectUrl = `https://scratch.mit.edu/projects/${project.id}/`;
    const userUrl = `https://scratch.mit.edu/users/${project.username}/`;
    container.insertAdjacentHTML("beforeend", `
            <div class="card">
                <div class='background' style="background-image: linear-gradient(180deg,rgba(255, 255, 255, 0) 0%, rgb(0, 0, 0) 100%), url(${project.banner})"></div>
                <a class="link" href="${projectUrl}" target="_blank" rel="noopener noreferrer">
                    <img class="card-image" src="${project.banner}">
                </a>
                <div class="profile">
                    <a class="link" href="${userUrl}" target="_blank" rel="noopener noreferrer">
                        <img class="profile-picture" src="${project.avatar}">
                    </a>
                    <div class="profile-text">
                        <a href="${projectUrl}" target="_blank" rel="noopener noreferrer">
                            <h2 class="card-header">${DOMPurify.sanitize(project.title)}</h2>
                        </a>
                        <a href="${userUrl}" target="_blank" rel="noopener noreferrer">
                            <p class="card-author">${project.username}</p>
                        </a>
                    </div>
                </div>
            </div>
        `);
}

let offset = 0;
const limit = 30;

function loadProjects() {
    const end = Math.min(offset + limit, data.length);

    for (let i = offset; i < end; i++) {
        addProject(data[i]);
    }

    offset = end;
}

button.addEventListener("click", loadProjects);

loadProjects();
