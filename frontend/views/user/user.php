<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Perfil do Usuário</title>
  <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <div class="navbar-logo">
        <a href="../painel/index.php">
          <img src="../../i/logo.png" alt="Logo"> kopa
        </a>
      </div>
      <div class="navbar-actions">
        <ul class="navbar-links">
          <button class="logout-btn" onclick="logout()">Sair</button>
        </ul>
      </div>
      <div class="menu-toggle" id="menuToggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  </header>
  
  <main>
    <div class="containerUser">
      <img id="avatar" src="" alt="Avatar do usuário">
      <div class="user-info">
        <p><span id="name"></span></p>
        <p>@<span id="usernameSpan"></span></p>
        <p><span id="kuest_count"></span> kuests</p>
      </div>
    </div>

    <section id="kuestsSection">
      <div id="kuests-list"></div>
      <div id="comments-modal" class="modal" style="display:none;">
        <div class="modal-content">
            <span id="close-modal" style="cursor:pointer;">&times;</span>
            <h3>Comentários</h3>
            <div id="comments-list"></div>
            <textarea id="new-comment" placeholder="Escreva seu comentário..."></textarea>
            <button id="send-comment">Comentar</button>
        </div>
      </div>
    </section>
  </main>

  <script>
    const menuToggle = document.getElementById("menuToggle");
    const navbarLinks = document.querySelector(".navbar-links");

    menuToggle.addEventListener("click", () => {
      navbarLinks.classList.toggle("active");
    });
    
    function updateTitle(username) {
      const usernameTitle = document.getElementById('usernameSpan');
      if (usernameTitle) usernameTitle.textContent = username;
      document.title = `@${username}`;
    }
  </script>
  <script src="user.js"></script>
</body>
</html>