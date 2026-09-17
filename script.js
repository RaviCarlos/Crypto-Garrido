class TreeNode {
  constructor(char, value, id) {
    this.id = id;
    this.char = char;
    this.value = value;
    this.height = 1;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

// Funções Auxiliares da Árvore AVL
function getAltura(node) {
  return node ? node.height : 0;
}

function getFatorBalanceamento(node) {
  return node ? getAltura(node.left) - getAltura(node.right) : 0;
}

function atualizarAltura(node) {
  if (node) {
    node.height = 1 + Math.max(getAltura(node.left), getAltura(node.right));
  }
}

function rotacionarDireita(y) {
  const x = y.left;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  atualizarAltura(y);
  atualizarAltura(x);

  return x;
}

function rotacionarEsquerda(x) {
  const y = x.right;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  atualizarAltura(x);
  atualizarAltura(y);

  return y;
}

function inserirAVL(node, char, value, id) {
  if (!node) {
    return new TreeNode(char, value, id);
  }

  if (value < node.value) {
    node.left = inserirAVL(node.left, char, value, id);
  } else {
    node.right = inserirAVL(node.right, char, value, id);
  }

  atualizarAltura(node);
  const fb = getFatorBalanceamento(node);

  if (fb > 1 && value < node.left.value) {
    return rotacionarDireita(node);
  }

  if (fb < -1 && value >= node.right.value) {
    return rotacionarEsquerda(node);
  }

  if (fb > 1 && value >= node.left.value) {
    node.left = rotacionarEsquerda(node.left);
    return rotacionarDireita(node);
  }

  if (fb < -1 && value < node.right.value) {
    node.right = rotacionarDireita(node.right);
    return rotacionarEsquerda(node);
  }

  return node;
}

let currentSteps = [];
let stepIndex = 0;
let autoPlayInterval = null;
let currentMode = "encrypt";

// Variáveis para Pan & Zoom no SVG
let zoomScale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Alternância Estilizada de Modo (Criptografar / Descriptografar)
  const modeButtons = document.querySelectorAll(".btn-mode");
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      currentMode = e.target.getAttribute("data-mode");
    });
  });

  document.getElementById("btn-start").addEventListener("click", (e) => {
    e.preventDefault();
    iniciarSimulacao();
  });

  // BOTÃO DE PROCESSAMENTO INSTANTÂNEO
  document.getElementById("btn-instant").addEventListener("click", (e) => {
    e.preventDefault();
    executarInstantaneo();
  });

  document.getElementById("btn-next").addEventListener("click", (e) => {
    e.preventDefault();
    proximoPasso();
  });

  document.getElementById("btn-prev").addEventListener("click", (e) => {
    e.preventDefault();
    passoAnterior();
  });

  document.getElementById("btn-auto").addEventListener("click", (e) => {
    e.preventDefault();
    alternarAutoPlay();
  });

  document.getElementById("btn-reset").addEventListener("click", (e) => {
    e.preventDefault();
    reiniciar();
  });

  // BOTÃO COLAR
  document.getElementById("btn-paste").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        document.getElementById("input-text").value = text;
      }
    } catch (err) {
      alert("Permissão para acessar a área de transferência negada pelo navegador.");
    }
  });

  // Botões de Selecionar / Copiar Texto
  document.getElementById("btn-select-all").addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("input-text");
    input.focus();
    input.select();
  });

  document.getElementById("btn-copy-result").addEventListener("click", (e) => {
    e.preventDefault();
    selecionarECopiarResultado();
  });

  // Botões de Exportação
  document.getElementById("btn-download-file").addEventListener("click", baixarArquivoFisico);
  document.getElementById("btn-share-whatsapp").addEventListener("click", compartilharWhatsApp);
  document.getElementById("btn-share-email").addEventListener("click", compartilharEmail);

  // Ferramentas de Zoom
  document.getElementById("btn-zoom-in").addEventListener("click", () => aplicarZoom(1.2));
  document.getElementById("btn-zoom-out").addEventListener("click", () => aplicarZoom(0.8));
  document.getElementById("btn-zoom-reset").addEventListener("click", resetarView);

  configurarPanAndZoom();
});

// ALGORITMO CRIPTOGRÁFICO DE DUPLA VIA
function processarMensagemPython(input_text, mode = "encrypt") {
  if (!input_text) return "";

  const seed_key = 2026;
  
  if (mode === "encrypt") {
    const length = input_text.length;
    let root = null;
    
    for (let idx = 0; idx < length; idx++) {
      const node_key = (idx * 31 + seed_key) % 10007;
      root = inserirAVL(root, input_text[idx], node_key, idx + 1);
    }

    const pre_seq = [];
    const post_seq = [];
    obterPreOrdemChaves(root, pre_seq);
    obterPosOrdemChaves(root, post_seq);

    const encrypted_chars = [];
    for (let i = 0; i < length; i++) {
      const orig_char = input_text[i];
      const pre_k = pre_seq[i % pre_seq.length];
      const post_k = post_seq[i % post_seq.length];

      const shift = (pre_k + post_k) % 256;
      const encrypted_char = String.fromCharCode((orig_char.charCodeAt(0) + shift) % 1114112);
      encrypted_chars.push(encrypted_char);
    }

    const raw_cipher = encrypted_chars.join("");
    const encoder = new TextEncoder();
    const byteArray = encoder.encode(raw_cipher);

    let binaryString = "";
    for (let i = 0; i < byteArray.length; i++) {
      binaryString += String.fromCharCode(byteArray[i]);
    }

    return btoa(binaryString);
  } else {
    try {
      const binaryString = atob(input_text);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder("utf-8");
      const raw_cipher = decoder.decode(bytes);
      const length = raw_cipher.length;

      let root = null;
      for (let idx = 0; idx < length; idx++) {
        const node_key = (idx * 31 + seed_key) % 10007;
        root = inserirAVL(root, "?", node_key, idx + 1);
      }

      const pre_seq = [];
      const post_seq = [];
      obterPreOrdemChaves(root, pre_seq);
      obterPosOrdemChaves(root, post_seq);

      const decrypted_chars = [];
      for (let i = 0; i < length; i++) {
        const cipher_char = raw_cipher[i];
        const pre_k = pre_seq[i % pre_seq.length];
        const post_k = post_seq[i % post_seq.length];

        const shift = (pre_k + post_k) % 256;
        let orig_code = (cipher_char.charCodeAt(0) - shift) % 1114112;
        if (orig_code < 0) orig_code += 1114112;

        decrypted_chars.push(String.fromCharCode(orig_code));
      }

      return decrypted_chars.join("");
    } catch (e) {
      return "Erro: Código cifrado inválido!";
    }
  }
}

function obterPreOrdemChaves(node, list) {
  if (!node) return;
  list.push(node.value);
  obterPreOrdemChaves(node.left, list);
  obterPreOrdemChaves(node.right, list);
}

function obterPosOrdemChaves(node, list) {
  if (!node) return;
  obterPosOrdemChaves(node.left, list);
  obterPosOrdemChaves(node.right, list);
  list.push(node.value);
}

function iniciarSimulacao() {
  const text = document.getElementById("input-text").value;
  if (!text.trim()) return;

  pararAutoPlay();
  
  gerarPassosSimulacao(text, currentMode);
  renderizarTracker(text);

  stepIndex = 0;
  habilitarBotoes(true);
  resetarView();
  renderizarPassoAtual(false);
}

// PROCESSAMENTO INSTANTÂNEO COM ROLAGEM AUTOMÁTICA
function executarInstantaneo() {
  const text = document.getElementById("input-text").value;
  if (!text.trim()) return;

  pararAutoPlay();
  gerarPassosSimulacao(text, currentMode);
  renderizarTracker(text);

  // Define o estado no último passo
  stepIndex = currentSteps.length - 1;
  habilitarBotoes(true);
  resetarView();
  renderizarPassoAtual(false);

  // Rola suavemente até o resultado final
  document.getElementById("section-result").scrollIntoView({ behavior: "smooth", block: "center" });
}

function gerarPassosSimulacao(text, mode) {
  currentSteps = [];
  let root = null;
  const seed_key = 2026;

  const finalOutput = processarMensagemPython(text, mode);
  document.getElementById("result-label").innerText = mode === "encrypt" ? "Texto Cifrado Resultante:" : "Texto Original Descriptografado:";

  if (mode === "encrypt") {
    let treeForKeys = null;
    for (let idx = 0; idx < text.length; idx++) {
      const node_key = (idx * 31 + seed_key) % 10007;
      treeForKeys = inserirAVL(treeForKeys, text[idx], node_key, idx + 1);
    }

    const preChaves = [];
    const posChaves = [];
    obterPreOrdemChaves(treeForKeys, preChaves);
    obterPosOrdemChaves(treeForKeys, posChaves);

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const ascii = char.charCodeAt(0);

      root = inserirAVL(root, char, ascii, i + 1);

      const inOrderList = [];
      const preOrderList = [];
      obterEmOrdem(root, inOrderList);
      obterPreOrdem(root, preOrderList);

      const preK = preChaves[i % preChaves.length];
      const posK = posChaves[i % posChaves.length];
      const shift = (preK + posK) % 256;

      const progressChars = Math.ceil(((i + 1) / text.length) * finalOutput.length);
      const prevProgressChars = Math.ceil((i / text.length) * finalOutput.length);
      
      const stepOutputText = finalOutput.substring(0, progressChars);
      const addedChunk = finalOutput.substring(prevProgressChars, progressChars);

      const targetCode = (ascii + shift) % 1114112;
      const rawChar = String.fromCharCode(targetCode);

      const mathDetailText = 
        `• Caractere Original: '<strong>${char === " " ? "Espaço" : char}</strong>' (ASCII <strong>${ascii}</strong>)<br>` +
        `• Chave AVL Pré-Ordem (K_pre): <strong>${preK}</strong> | Chave Pós-Ordem (K_post): <strong>${posK}</strong><br>` +
        `• Deslocamento Criptográfico: Shift = (${preK} + ${posK}) mod 256 = <strong>${shift}</strong><br>` +
        `• Caractere Transformado (AVL): ASCII ${ascii} + ${shift} = Código <strong>${targetCode}</strong> ('<strong>${rawChar}</strong>')<br>` +
        `• Bloco Cifrado Gerado no Passo: '<strong>${addedChunk}</strong>'`;

      currentSteps.push({
        stepNumber: i + 1,
        currentChar: char,
        charIndex: i,
        ascii: ascii,
        treeRoot: cloneTree(root),
        inOrder: inOrderList.map(n => n.char === " " ? "[Espaço]" : n.char).join(" • "),
        preOrder: preOrderList.map(n => n.char === " " ? "[Espaço]" : n.char).join(" • "),
        mathDetails: mathDetailText,
        cipherResult: stepOutputText,
        explanation: `Criptografando caractere #${i + 1}: '<strong>${char === " " ? "Espaço" : char}</strong>' (ASCII ${ascii}). Árvore AVL rebalanceada.`
      });
    }
  } else {
    let treeForKeys = null;
    for (let idx = 0; idx < text.length; idx++) {
      const node_key = (idx * 31 + seed_key) % 10007;
      treeForKeys = inserirAVL(treeForKeys, "?", node_key, idx + 1);
    }

    const preChaves = [];
    const posChaves = [];
    obterPreOrdemChaves(treeForKeys, preChaves);
    obterPosOrdemChaves(treeForKeys, posChaves);

    let lastDecryptedLength = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const ascii = char.charCodeAt(0);

      root = inserirAVL(root, char, ascii, i + 1);

      const inOrderList = [];
      const preOrderList = [];
      obterEmOrdem(root, inOrderList);
      obterPreOrdem(root, preOrderList);

      const preK = preChaves[i % preChaves.length];
      const posK = posChaves[i % posChaves.length];
      const shift = (preK + posK) % 256;

      const currentInputSlice = text.substring(0, i + 1);
      const currentDecryptedText = processarMensagemPython(currentInputSlice, "decrypt");

      let newlyReconstructedChar = "";
      if (currentDecryptedText.length > lastDecryptedLength) {
        newlyReconstructedChar = currentDecryptedText.substring(lastDecryptedLength);
        lastDecryptedLength = currentDecryptedText.length;
      }

      const displayReconstructed = newlyReconstructedChar
        ? `'<strong>${newlyReconstructedChar === " " ? "Espaço" : newlyReconstructedChar}</strong>'`
        : `<em>(Aguardando término do bloco Base64)</em>`;

      const mathDetailText = 
        `• Bloco Processado (Base64): '<strong>${char}</strong>'<br>` +
        `• Chave AVL Pré-Ordem (K_pre): <strong>${preK}</strong> | Chave Pós-Ordem (K_post): <strong>${posK}</strong><br>` +
        `• Deslocamento Inverso: Shift = (${preK} + ${posK}) mod 256 = <strong>${shift}</strong><br>` +
        `• Caractere Reconstruído no Passo: ${displayReconstructed}`;

      currentSteps.push({
        stepNumber: i + 1,
        currentChar: char,
        charIndex: i,
        ascii: ascii,
        treeRoot: cloneTree(root),
        inOrder: inOrderList.map(n => n.char === " " ? "[Espaço]" : n.char).join(" • "),
        preOrder: preOrderList.map(n => n.char === " " ? "[Espaço]" : n.char).join(" • "),
        mathDetails: mathDetailText,
        cipherResult: currentDecryptedText,
        explanation: `Descriptografando caractere #${i + 1}: '<strong>${char}</strong>' (ASCII ${ascii}). Árvore AVL rebalanceada.`
      });
    }
  }
}

function obterEmOrdem(node, list) {
  if (!node) return;
  obterEmOrdem(node.left, list);
  list.push(node);
  obterEmOrdem(node.right, list);
}

function obterPreOrdem(node, list) {
  if (!node) return;
  list.push(node);
  obterPreOrdem(node.left, list);
  obterPreOrdem(node.right, list);
}

function cloneTree(node) {
  if (!node) return null;
  const clone = new TreeNode(node.char, node.value, node.id);
  clone.height = node.height;
  clone.left = cloneTree(node.left);
  clone.right = cloneTree(node.right);
  return clone;
}

function renderizarTracker(text) {
  const container = document.getElementById("char-tracker");
  container.innerHTML = "";

  for (let i = 0; i < text.length; i++) {
    const box = document.createElement("div");
    box.className = "char-box";
    box.id = `char-box-${i}`;
    box.textContent = text[i] === " " ? "␣" : text[i];
    container.appendChild(box);
  }
}

function atualizarTrackerVisual(activeIndex) {
  const boxes = document.querySelectorAll(".char-box");
  boxes.forEach((box, idx) => {
    box.classList.remove("active", "processed");
    if (idx < activeIndex) box.classList.add("processed");
    else if (idx === activeIndex) box.classList.add("active");
  });

  const activeBox = document.getElementById(`char-box-${activeIndex}`);
  const container = document.getElementById("char-tracker");

  if (activeBox && container) {
    const boxOffset = activeBox.offsetLeft - container.offsetLeft;
    container.scrollTo({
      left: boxOffset - container.clientWidth / 2 + activeBox.clientWidth / 2,
      behavior: "smooth"
    });
  }
}

function renderizarPassoAtual(shouldScroll = false) {
  const step = currentSteps[stepIndex];
  const total = currentSteps.length;

  document.getElementById("step-counter").innerText = `Passo ${step.stepNumber} de ${total}`;
  document.getElementById("explanation-text").innerHTML = step.explanation;
  document.getElementById("math-details").innerHTML = step.mathDetails;
  document.getElementById("inorder-output").innerText = step.inOrder;
  document.getElementById("preorder-output").innerText = step.preOrder;
  document.getElementById("cipher-output").innerText = step.cipherResult;

  atualizarTrackerVisual(step.charIndex);
  desenharSVG(step.treeRoot, step.currentChar);

  document.getElementById("btn-prev").disabled = stepIndex === 0;
  document.getElementById("btn-next").disabled = stepIndex === total - 1;

  if (shouldScroll) {
    document.getElementById("section-tree").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function proximoPasso() {
  if (stepIndex < currentSteps.length - 1) {
    stepIndex++;
    renderizarPassoAtual(false);
  } else {
    pararAutoPlay();
  }
}

function passoAnterior() {
  if (stepIndex > 0) {
    stepIndex--;
    renderizarPassoAtual(false);
  }
}

function alternarAutoPlay() {
  const btn = document.getElementById("btn-auto");
  if (autoPlayInterval) {
    pararAutoPlay();
  } else {
    btn.innerText = "⏸ Pausar";
    autoPlayInterval = setInterval(() => {
      if (stepIndex < currentSteps.length - 1) {
        stepIndex++;
        renderizarPassoAtual(false);
      } else {
        pararAutoPlay();
      }
    }, 700);
  }
}

function pararAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
    document.getElementById("btn-auto").innerText = "▶ Execução Automática";
  }
}

function reiniciar() {
  pararAutoPlay();
  stepIndex = 0;
  renderizarPassoAtual(false);
}

function habilitarBotoes(status) {
  document.getElementById("btn-next").disabled = !status;
  document.getElementById("btn-prev").disabled = !status;
  document.getElementById("btn-auto").disabled = !status;
  document.getElementById("btn-reset").disabled = !status;

  document.getElementById("btn-copy-result").disabled = !status;
  document.getElementById("btn-download-file").disabled = !status;
  document.getElementById("btn-share-whatsapp").disabled = !status;
  document.getElementById("btn-share-email").disabled = !status;
}

function selecionarECopiarResultado() {
  const cipherDiv = document.getElementById("cipher-output");
  const range = document.createRange();
  range.selectNodeContents(cipherDiv);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  navigator.clipboard.writeText(cipherDiv.innerText).then(() => {
    const btn = document.getElementById("btn-copy-result");
    const origText = btn.innerText;
    btn.innerText = "✅ Copiado!";
    setTimeout(() => btn.innerText = origText, 2000);
  });
}

function baixarArquivoFisico() {
  const resultText = document.getElementById("cipher-output").innerText;
  if (!resultText || resultText === "---") return;

  const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "mensagem_criptografada_avl.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

function obterDataHoraAtual() {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `${data} às ${hora}`;
}

function compartilharWhatsApp() {
  const resultText = document.getElementById("cipher-output").innerText;
  if (!resultText || resultText === "---") return;

  const isDecrypt = currentMode === "decrypt";
  const tipoOp = isDecrypt ? "DESCRIPTOGRAFIA" : "CRIPTOGRAFIA";
  const dataHora = obterDataHoraAtual();

  const message = 
`🔒 *SECURECORE ENTERPRISE - NOTIFICAÇÃO DE SEGURANÇA*
--------------------------------------------------
📌 *Operação:* ${tipoOp}
📅 *Data/Hora:* ${dataHora}
🔑 *Algoritmo:* Árvore Auto-Balanceada (AVL)

📄 *CONTEÚDO DA MENSAGEM:*
\`\`\`${resultText}\`\`\`
--------------------------------------------------
*SecureCore Cryptographic Protocol v2026*`;

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function compartilharEmail() {
  const resultText = document.getElementById("cipher-output").innerText;
  if (!resultText || resultText === "---") return;

  const isDecrypt = currentMode === "decrypt";
  const tipoOp = isDecrypt ? "DESCRIPTOGRAFIA" : "CRIPTOGRAFIA";
  const subject = `[SecureCore Enterprise] Relatório de Processamento - ${tipoOp}`;
  const dataHora = obterDataHoraAtual();

  const body = 
`==================================================
        SECURECORE ENTERPRISE SYSTEM
      Notificação Oficial de Segurança AVL
==================================================

Prezado(a),

Informamos que um processo de ${tipoOp.toLowerCase()} foi realizado com sucesso através do nosso simulador de segurança.

--------------------------------------------------
DETALHES DA OPERAÇÃO:
- Data e Hora: ${dataHora}
- Modo: ${tipoOp}
- Estrutura de Dados: Árvore Auto-Balanceada (AVL)
- Semente Criptográfica: SEED-2026
--------------------------------------------------

CONTEÚDO PROCESSADO:
--------------------------------------------------
${resultText}
--------------------------------------------------

Aviso de Confidencialidade: Esta mensagem e quaisquer arquivos transmitidos com ela são confidenciais e destinados exclusivamente ao uso do indivíduo ou entidade a quem foram endereçados.

Atenciosamente,
Equipe de Segurança da Informação
SecureCore Enterprise Solutions`;

  // 1. Método Nativo e Simplificado (Web Share API)
  if (navigator.share) {
    navigator.share({
      title: subject,
      text: body
    }).catch(() => {
      // Caso o usuário cancele a janela de compartilhamento
    });
  } else {
    // 2. Fallback simples para navegadores antigos
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  }
}

// LÓGICA DE PAN & ZOOM NO SVG
function configurarPanAndZoom() {
  const container = document.getElementById("tree-container");

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    atualizarTransformacaoSVG();
  });

  window.addEventListener("mouseup", () => isDragging = false);

  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    aplicarZoom(factor);
  });
}

function aplicarZoom(factor) {
  zoomScale *= factor;
  zoomScale = Math.min(Math.max(0.3, zoomScale), 3);
  atualizarTransformacaoSVG();
}

function resetarView() {
  zoomScale = 1;
  translateX = 0;
  translateY = 0;
  atualizarTransformacaoSVG();
}

function atualizarTransformacaoSVG() {
  const group = document.getElementById("tree-group");
  if (group) {
    group.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${zoomScale})`);
  }
}

// DESENHO TIPO NÓ NA TELA
function desenharSVG(root, activeChar) {
  const svg = document.getElementById("tree-svg");
  svg.innerHTML = "";

  if (!root) return;

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.id = "tree-group";
  svg.appendChild(group);

  const containerWidth = svg.clientWidth || 800;
  const treeDepth = getAltura(root);
  const initialGap = Math.max(containerWidth / 3.5, treeDepth * 40);

  posicionarNosDinamico(root, containerWidth / 2, 50, initialGap, 1);
  desenharElementos(group, root, activeChar, root.id);

  atualizarTransformacaoSVG();
}

function posicionarNosDinamico(node, x, y, gap, level) {
  if (!node) return;
  node.x = x;
  node.y = y;

  const minGap = 35;
  const nextGap = Math.max(gap / 1.8, minGap);

  if (node.left) posicionarNosDinamico(node.left, x - gap, y + 70, nextGap, level + 1);
  if (node.right) posicionarNosDinamico(node.right, x + gap, y + 70, nextGap, level + 1);
}

function desenharElementos(group, node, activeChar, rootId) {
  if (!node) return;

  if (node.left) {
    desenharLinha(group, node.x, node.y, node.left.x, node.left.y);
    desenharElementos(group, node.left, activeChar, rootId);
  }
  if (node.right) {
    desenharLinha(group, node.x, node.y, node.right.x, node.right.y);
    desenharElementos(group, node.right, activeChar, rootId);
  }

  const isActive = node.char === activeChar;
  const isRoot = node.id === rootId;
  desenharNo(group, node.x, node.y, node.char === " " ? "␣" : node.char, isActive, isRoot);
}

function desenharLinha(group, x1, y1, x2, y2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "#334155");
  line.setAttribute("stroke-width", "2");
  group.appendChild(line);
}

function desenharNo(group, x, y, char, isActive, isRoot) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", "16");

  let color = "#0284c7";
  if (isRoot) color = "#a855f7";
  if (isActive) color = "#22c55e";

  circle.setAttribute("fill", color);
  circle.setAttribute("stroke", "#ffffff");
  circle.setAttribute("stroke-width", isActive ? "3" : "1");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y + 5);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#ffffff");
  text.setAttribute("font-weight", "bold");
  text.setAttribute("font-size", "12px");
  text.textContent = char;

  g.appendChild(circle);
  g.appendChild(text);
  group.appendChild(g);
}