const token = localStorage.getItem('token');
const API_URL = 'http://localhost:8000/api/v1';

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../../index.php';
}

function user(){
    const name = localStorage.getItem('name_user');
    const username = localStorage.getItem('username');
    const avatar_url = localStorage.getItem('avatar_url');

    document.getElementById('name').textContent = name ?? "Não definido";
    document.getElementById('username').textContent = username ?? "Não definido";
    document.getElementById('avatar').src = avatar_url ?? "";
    
    if (username) {
      document.getElementById('profileLink').href = `user/${username}`;
    }
}

async function kuest() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const errorDiv = document.getElementById('kuest-error');

    errorDiv.textContent = '';

    // Validação simples antes de enviar
    if (!title || !description) {
        errorDiv.textContent = "Preencha todos os campos!";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/kuests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });

        if (!res.ok) {
            throw new Error(`Erro na requisição: ${res.status}`);
        }

        const data = await res.json();

        if (!data.error) {
            window.location.href = 'index.php';
        } else {
            errorDiv.textContent = data.message || "Erro ao fazer kuest!";
        }
    } catch (err) {
        console.error(err);
        errorDiv.textContent = "Não foi possível conectar ao servidor!";
    }
}

async function getKuests(page = 1) {
    const listDiv = document.getElementById("kuests-list");
    listDiv.innerHTML = "Carregando...";

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/kuests?page=${page}`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            }
        });

        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }

        const data = await res.json();
        listDiv.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            listDiv.innerHTML = "Nenhuma kuest encontrada.";
            return;
        }

        data.data.forEach(kuest => {
            const div = document.createElement("div");
            div.className = "kuest-item";

            const username = kuest.username || 'anonimo';
            const profileLink = `user/${username}`;

            div.innerHTML = `
              <div class="containerUserKuest">
                  <img src="${kuest.avatar || 'default-avatar.png'}" alt="Avatar" class="kuest-avatar" />
                  <div class="kuest-content">
                      <h3>${kuest.title || 'Sem título'}</h3>
                      <p>${kuest.description || ''}</p>
                      <a class="profileLink" href="${profileLink}">
                        <small>@${username}</small>
                      </a>
                      <small>${kuest.created_at_human || ''}</small>
                  </div>
              </div>
            `;
            listDiv.appendChild(div);
        });

        // Paginação
        const paginationExists = data.links && (data.links.prev || data.links.next);
        if (paginationExists) {
            const pagination = document.createElement("div");
            pagination.className = "pagination";

            if (data.links.prev) {
                const prevBtn = document.createElement("button");
                prevBtn.textContent = "Anterior";
                prevBtn.disabled = page === 1;
                prevBtn.onclick = () => getKuests(page - 1);
                pagination.appendChild(prevBtn);
            }

            if (data.links.next) {
                const nextBtn = document.createElement("button");
                nextBtn.textContent = "Próxima";
                nextBtn.onclick = () => getKuests(page + 1);
                pagination.appendChild(nextBtn);
            }

            listDiv.appendChild(pagination);
        }

    } catch (err) {
        console.error("Erro ao buscar kuests:", err);
        listDiv.innerHTML = "Não foi possível carregar as kuests!";
    }
}


document.addEventListener("DOMContentLoaded", () => getKuests());
window.onload = user;