const API_URL = 'http://localhost:8000/api/v1';
const token = localStorage.getItem('token');

// Pega o username da URL (?u=monari)
function getUsernameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('u');
}

// Busca dados do usuário na API
async function getUserData(username) {
  if (!username) return null;

  try {
    const res = await fetch(`${API_URL}/user/username/${username}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar usuário');

    const json = await res.json();

    if (json.status !== 'success') throw new Error('API retornou erro');

    const data = json.data;

    return {
      id: data.id, // importante para comparar ao deletar comentários
      name: data.name,
      username: data.username,
      avatar_url: data.avatar || data.avatar_url || "https://via.placeholder.com/150",
      kuest_count: data.stats?.kuest_count || 0,
      kuests: data.kuests || []
    };

  } catch (error) {
    alert("Erro ao carregar dados do usuário");
    return null;
  }
}

async function loadUser() {
  const username = getUsernameFromURL();
  if (!username) {
    alert("Usuário não encontrado na URL (?u=...)");
    return;
  }

  const user = await getUserData(username);
  if (!user) return;

  // Atualiza info do usuário
  document.getElementById('name').textContent = user.name;
  document.getElementById('usernameSpan').textContent = user.username;
  document.getElementById('kuest_count').textContent = user.kuest_count;
  document.getElementById('avatar').src = user.avatar_url;
  document.title = `@${user.username}`;
  localStorage.setItem('user_id', user.id); // salva id para verificar dono de comentários

  // Lista de kuests
  const kuestsList = document.getElementById('kuests-list');
  kuestsList.innerHTML = '';
  if (user.kuests.length === 0) {
    kuestsList.innerHTML = '<p>Este usuário não criou kuests.</p>';
  } else {
    user.kuests.forEach(k => {
      const kuestDiv = document.createElement('div');
      kuestDiv.className = 'kuest-item';
      kuestDiv.innerHTML = `
        <h3>${k.title}</h3>
        <p>${k.description}</p>
        <p><small>@${k.username} | ${k.created_at_human} </small></p>
      `;

      kuestDiv.addEventListener('click', () => openComments(k.id));

      kuestsList.appendChild(kuestDiv);
    });
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
      const username = c.user ? c.user.username : 'anonimo';
      const avatar = c.user && c.user.avatar ? c.user.avatar : 'https://via.placeholder.com/150';

      const div = document.createElement("div");
      div.className = "comment-item";
      div.innerHTML = `
        <p><strong>@${username}</strong>: ${c.content}</p>
        ${c.user && c.user.id == localStorage.getItem('user_id') ? `<button onclick="deleteComment(${c.id}, ${kuestId})">Excluir</button>` : ""}
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
        body: JSON.stringify({ content: comment })
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") throw new Error(data.message);

      textarea.value = "";
      openComments(kuestId);
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

    const data = await res.json();
    if (!res.ok || data.status === "error") throw new Error(data.message);

    openComments(kuestId);
  } catch (err) {
    alert("Erro ao excluir comentário: " + err.message);
  }
}

document.addEventListener('DOMContentLoaded', loadUser);
