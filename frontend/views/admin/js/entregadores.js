const token = localStorage.getItem('token');
const API_URL = 'http://localhost:8000/api/v1';

const modal = document.getElementById("entregadorModal");
const adicionarModal = document.getElementById("adicionarEntregadorModal");

async function carregarEntregadores() {
  try {
    const tabelaEl = document.getElementById('todos_entregadores');
    if (!tabelaEl) return console.error('Elemento #todos_entregadores não encontrado!');
    if (!token) return console.error("Token não encontrado!");

    const res = await fetch(`${API_URL}/admin/entregadores/todos`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
    const dados = await res.json();

    const usuarios = dados.users?.data || [];
    let tabela = tabelaEl.querySelector('tbody');
    if (!tabela) tabela = tabelaEl.appendChild(document.createElement('tbody'));
    tabela.innerHTML = '';

    if (usuarios.length > 0) {
      usuarios.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="display:none;">${user.id}</td>
          <td>${user.nome}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.telefone}</td>
          <td>
            <select class="role-select" data-id="${user.id}">
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="entregador" ${user.role === 'entregador' ? 'selected' : ''}>Entregador</option>
              <option value="cliente" ${user.role === 'cliente' ? 'selected' : ''}>Cliente</option>
            </select>
            <button class="delete-btn" data-id="${user.id}">Deletar</button>
          </td>
        `;
        tabela.appendChild(tr);
      });

      // Event listeners depois de criar os elementos
      document.querySelectorAll('.role-select').forEach(select => {
        select.onchange = async (e) => {
          const id = e.target.dataset.id;
          const novaRole = e.target.value;

          // Impede alterar a própria role
          const tbody = e.target.closest('tbody');
          const logadoId = parseInt(localStorage.getItem('user_id')); // ou pegue do token/variável global
          if (parseInt(id) === logadoId) {
            alert("Você não pode alterar a sua própria role!");
            carregarEntregadores();
            return;
          }

          if (!confirm(`Alterar role do usuário para "${novaRole}"?`)) return;

          try {
            const res = await fetch(`${API_URL}/admin/admins/atualizar/role/${id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ role: novaRole })
            });

            if (!res.ok) throw new Error(`Erro ${res.status}`);
            alert('Role atualizado com sucesso!');
            carregarEntregadores();
          } catch (erro) {
            console.error('Erro ao atualizar role:', erro);
            alert('Erro ao atualizar role!');
          }
        };
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async (e) => {
          const id = e.target.dataset.id;

          // Impede deletar a si mesmo
          const logadoId = parseInt(localStorage.getItem('user_id'));
          if (parseInt(id) === logadoId) {
            alert("Você não pode deletar a si mesmo!");
            return;
          }

          if (!confirm('Deseja deletar este usuário?')) return;

          try {
            const res = await fetch(`${API_URL}/admin/admins/deletar/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`Erro ${res.status}`);
            alert('Usuário deletado com sucesso!');
            carregarEntregadores();
          } catch (erro) {
            console.error('Erro ao deletar usuário:', erro);
            alert('Erro ao deletar usuário!');
          }
        };
      });
    } else {
      tabela.innerHTML = `<tr><td colspan="7">Nenhum usuário encontrado</td></tr>`;
    }
  } catch (erro) {
    console.error('Erro ao carregar usuários:', erro);
  }
}

function adicionarEntregador() {
  const content = adicionarModal.querySelector(".modal-content-adicionar");
  content.innerHTML = `
    <span class="close" id="fecharModalAdicionar">&times;</span>
    <h3>Adicionar Entregador</h3>
    <form id="adicionarForm" enctype="multipart/form-data">
        <label for="name">Nome completo:</label>
        <input type="text" id="name" name="name" placeholder="Seu nome completo" required>

        <label for="username">Username:</label>
        <input type="text" id="username" name="username" placeholder="Seu username" required>

        <label for="email">E-mail:</label>
        <input type="email" id="email" name="email" placeholder="Seu e-mail" required>

        <label for="telefone">Telefone:</label>
        <input type="text" id="telefone" name="telefone" placeholder="Seu telefone" required>

        <input type="hidden" id="role" name="role" value="entregador">

        <label for="password">Senha:</label>
        <input type="password" id="reg-password" name="password" placeholder="Sua senha" required>

        <label for="password_confirmation">Confirme sua senha:</label>
        <input type="password" id="password_confirmation" name="password_confirmation" placeholder="Confirme sua senha" required>

        <button type="submit">Registrar</button>
    </form>
  `;

  // Evento de fechar modal
  content.querySelector("#fecharModalAdicionar").onclick = fecharModalAdicionar;

  // Envio do formulário
  const form = document.getElementById("adicionarForm");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const texto = await res.text();
        console.error(`Erro da API (status ${res.status}):`, texto);
        return alert(`Erro ao adicionar entregador (status ${res.status})`);
      }

      alert("Entregador adicionado com sucesso!");
      fecharModalAdicionar();
      carregarEntregadores();
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Erro ao adicionar entregador!");
    }
  };
}

function fecharModalAdicionar() {
  adicionarModal.style.display = "none";
}

document.getElementById("adicionarBtn").onclick = () => {
  adicionarModal.style.display = "block";
  adicionarEntregador();
};

window.addEventListener('DOMContentLoaded', carregarEntregadores);
