const container = document.getElementById('container');
const button = document.getElementById('load');

const projects = await fetch("./data/trending.json");
const data = await projects.json();

function addProject(project) {
    container.insertAdjacentHTML("beforeend", `
            <a href="https://scratch.mit.edu/projects/${project.id}/" class="card" target="_blank" rel="noopener noreferrer">
                <div class='background' style="background-image: linear-gradient(180deg,rgba(255, 255, 255, 0) 0%, rgb(0, 0, 0) 100%), url(${project.banner})"></div>
                <img class="card-image" src="${project.banner}">
                <div class="profile">
                    <img class="profile-picture" src="${project.avatar}">
                    <div class="profile-text">
                        <h2 class="card-header">${DOMPurify.sanitize(project.title)}</h2>
                        <p class="card-author">${project.username}</p>
                    </div>
                </div>
            </a>
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
