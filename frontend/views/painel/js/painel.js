const token = localStorage.getItem('token');
const API_URL = 'http://localhost:8000/api/v1';

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('name_user');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar_url');
    window.location.href = '../../index.php';
}

function user(){
    const name = localStorage.getItem('name_user');
    const username = localStorage.getItem('username');
    const avatar_url = localStorage.getItem('avatar_url');

    document.getElementById('name').textContent = name ?? "Não definido";
    document.getElementById('username').textContent = username ?? "Não definido";
    document.getElementById('avatar').src = avatar_url ?? "";
    
    const profileLink = `../user/user.php?u=${username}`;
    if (username) {
        const link = document.querySelector('.profileLink');
        if (link) link.href = profileLink;
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
            const profileLink = `../user/user.php?u=${username}`;

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

            // Evento de clique para comentar
            div.addEventListener("click", () => {
                openComments(kuest.id);
            });

            listDiv.appendChild(div);
        });

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
        listDiv.innerHTML = "Não foi possível carregar as kuests!";
    }
}

async function openComments(kuestId) {
    const modal = document.getElementById("comments-modal");
    const commentsList = document.getElementById("comments-list");
    const textarea = document.getElementById("new-comment");
    const sendBtn = document.getElementById("send-comment");

    modal.style.display = "flex";
    commentsList.innerHTML = "Carregando...";
    textarea.value = "";

try {
    const res = await fetch(`${API_URL}/kuests/${kuestId}/comment`, {
        headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();


    if (!res.ok || result.status === "error") {
        throw new Error(result.message || "Erro ao carregar comentários");
    }

    const comments = result.data;
    commentsList.innerHTML = comments.length === 0 ? "Nenhum comentário ainda." : "";
    comments.forEach(c => {
        const div = document.createElement("div");
        div.className = "comment-item";
        div.innerHTML = `
            <p><strong>@${c.user.username}</strong>: ${c.content}</p>
        `;
        commentsList.appendChild(div);
    });

} catch (err) {
    commentsList.innerHTML = "Erro ao carregar comentários.";
}

    sendBtn.onclick = async () => {
        const comment = textarea.value.trim();
        if (!comment) return;

        try {
            const res = await fetch(`${API_URL}/kuests/${kuestId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: comment }) // ⚠️ mudar para content
            });

            const data = await res.json();
            if (!res.ok || data.status === "error") throw new Error(data.message);

            textarea.value = "";
            openComments(kuestId); // Recarrega comentários
        } catch (err) {
            alert("Erro ao enviar comentário: " + err.message);
        }
    };

    document.getElementById("close-modal").onclick = () => {
        modal.style.display = "none";
    };
}

async function deleteComment(commentId, kuestId) {
    if (!confirm("Tem certeza que deseja excluir este comentário?")) return;

    try {
        const res = await fetch(`${API_URL}/kuests/${commentId}/comment`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error("Erro ao excluir comentário");
        openComments(kuestId); // Recarrega comentários
    } catch (err) {
        alert("Erro ao excluir comentário!");
    }
}

document.addEventListener("DOMContentLoaded", () => getKuests());
window.onload = user;