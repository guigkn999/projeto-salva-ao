const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());

const ARQUIVO = "usuarios.json";
const ARQUIVO_CARRINHO = "carrinho.json";

function carregarUsuarios() {
    if (!fs.existsSync(ARQUIVO)) fs.writeFileSync(ARQUIVO, "[]");
    return JSON.parse(fs.readFileSync(ARQUIVO));
}
function carregarCarrinho() {
    if (!fs.existsSync(ARQUIVO_CARRINHO)) fs.writeFileSync(ARQUIVO_CARRINHO, "[]");
    return JSON.parse(fs.readFileSync(ARQUIVO_CARRINHO));
}
function salvarCarrinho(lista) {
    fs.writeFileSync(ARQUIVO_CARRINHO, JSON.stringify(lista, null, 2));
}
function salvarUsuarios(lista) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(lista, null, 2));
}

let usuarios = carregarUsuarios();
let carrinho = carregarCarrinho();
let tokens = [];

function hashSenha(senha) {
    return crypto.createHash("sha256").update(senha).digest("hex");
}

// ===== ROTAS DA API PRIMEIRO =====

app.post("/registro", (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.json({ mensagem: "Preencha todos os campos!" });
    const existe = usuarios.find(u => u.email === email);
    if (existe) return res.json({ mensagem: "Email já cadastrado!" });
    usuarios.push({ nome, email, senha: hashSenha(senha) });
    salvarUsuarios(usuarios);
    res.json({ mensagem: "Cadastro realizado com sucesso!" });
});

app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    const user = usuarios.find(u => u.email === email);
    if (!user || user.senha !== hashSenha(senha)) return res.json({ mensagem: "Email ou senha inválidos!" });
    res.json({ mensagem: `Bem-vindo, ${user.nome}!` });
});

app.post("/esqueci", (req, res) => {
    const { email } = req.body;
    const user = usuarios.find(u => u.email === email);
    if (!user) return res.json({ mensagem: "Email não encontrado!" });
    const token = crypto.randomBytes(20).toString("hex");
    tokens.push({ email, token });
    console.log("🔑 TOKEN:", token);
    res.json({ mensagem: "Token gerado! Veja no terminal." });
});

app.post("/resetar", (req, res) => {
    const { token, novaSenha } = req.body;
    const registro = tokens.find(t => t.token === token);
    if (!registro) return res.json({ mensagem: "Token inválido!" });
    const user = usuarios.find(u => u.email === registro.email);
    if (!user) return res.json({ mensagem: "Usuário não encontrado!" });
    user.senha = hashSenha(novaSenha);
    tokens = tokens.filter(t => t.token !== token);
    salvarUsuarios(usuarios);
    res.json({ mensagem: "Senha atualizada com sucesso!" });
});

app.get("/carrinho/itens", (req, res) => {
    res.json(carrinho);
});

app.post("/carrinho/adicionar", (req, res) => {
    const { nome, preco, img } = req.body;
    carrinho.push({ id: Date.now(), nome, preco, img });
    salvarCarrinho(carrinho);
    res.json({ mensagem: "Produto adicionado ao carrinho!" });
});

// ===== STATIC E LISTEN POR ÚLTIMO =====

app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
    console.log("🚀 http://localhost:3000");
});
// ================= FUNÇÕES =================
function carregarUsuarios() {
    if (!fs.existsSync(ARQUIVO)) {
        fs.writeFileSync(ARQUIVO, "[]");
    }
    return JSON.parse(fs.readFileSync(ARQUIVO));
}
function carregarCarrinho() {
    if (!fs.existsSync(ARQUIVO_CARRINHO)) {
        fs.writeFileSync(ARQUIVO_CARRINHO, "[]");
    }

    return JSON.parse(
        fs.readFileSync(ARQUIVO_CARRINHO)
    );
}

function salvarCarrinho(lista) {
    fs.writeFileSync(
        ARQUIVO_CARRINHO,
        JSON.stringify(lista, null, 2)
    );
}

function salvarUsuarios(lista) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(lista, null, 2));
}

// ================= "BANCO" =================
let usuarios = carregarUsuarios();
let carrinho = carregarCarrinho();
let tokens = [];

// ================= HASH SIMPLES =================
function hashSenha(senha) {
    return crypto.createHash("sha256").update(senha).digest("hex");
}

// ================= REGISTRO =================
app.post("/registro", (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.json({ mensagem: "Preencha todos os campos!" });
    }

    const existe = usuarios.find(u => u.email === email);
    if (existe) {
        return res.json({ mensagem: "Email já cadastrado!" });
    }

    usuarios.push({
        nome,
        email,
        senha: hashSenha(senha)
    });

    salvarUsuarios(usuarios);

    res.json({ mensagem: "Cadastro realizado com sucesso!" });
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    const user = usuarios.find(u => u.email === email);

    if (!user || user.senha !== hashSenha(senha)) {
        return res.json({ mensagem: "Email ou senha inválidos!" });
    }

    res.json({ mensagem: `Bem-vindo, ${user.nome}!` });
});

// ================= ESQUECI =================
app.post("/esqueci", (req, res) => {
    const { email } = req.body;

    const user = usuarios.find(u => u.email === email);

    if (!user) {
        return res.json({ mensagem: "Email não encontrado!" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    tokens.push({ email, token });

    console.log("🔑 TOKEN:", token);

    res.json({ mensagem: "Token gerado! Veja no terminal." });
});

// ================= RESET =================
app.post("/resetar", (req, res) => {
    const { token, novaSenha } = req.body;

    const registro = tokens.find(t => t.token === token);

    if (!registro) {
        return res.json({ mensagem: "Token inválido!" });
    }

    const user = usuarios.find(u => u.email === registro.email);

    if (!user) {
        return res.json({ mensagem: "Usuário não encontrado!" });
    }

    user.senha = hashSenha(novaSenha);

    tokens = tokens.filter(t => t.token !== token);

    salvarUsuarios(usuarios);

    res.json({ mensagem: "Senha atualizada com sucesso!" });
});

// ================= SERVER =================
// LISTAR CARRINHO
app.get("/carrinho", (req, res) => {
    res.json(carrinho);
});

// ADICIONAR PRODUTO
app.post("/carrinho/adicionar", (req, res) => {

    const { nome, preco, img } = req.body;

    carrinho.push({
        id: Date.now(),
        nome,
        preco,
        img
    });

    salvarCarrinho(carrinho);

    res.json({
        mensagem: "Produto adicionado ao carrinho!"
    });
});
app.listen(3000, () => {
    console.log("🚀 http://localhost:3000");
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});