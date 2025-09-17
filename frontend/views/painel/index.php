<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kuests</title>
  <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <div class="navbar-logo">
        <a href="index.php">
          <img src="../../i/logo.png" alt="Logo"> Kuests
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
    <div class="container">
      <div class="esquerda">
        <?php include 'partials/esquerda.php'; ?>
      </div>
      <div class="meio">
        <?php include 'partials/meio.php';?>
      </div>
    </div>
  </main>
  <?php include 'footer.php';?>
  <script>
    const menuToggle = document.getElementById("menuToggle");
    const navbarLinks = document.querySelector(".navbar-links");

    menuToggle.addEventListener("click", () => {
      navbarLinks.classList.toggle("active");
    });

    document.getElementById("kuest").addEventListener("submit", function(e) {
        e.preventDefault();
        kuest();
    });

  </script>
  <script src="js/painel.js"></script>
</body>
</html>
