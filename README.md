# ☕ Carrinho de Compras — Redis + Node.js (Play with Docker)

Uma aplicação simples de **carrinho de compras** para uma cafeteria:

* **Frontend**: HTML + CSS (catálogo de cafés)
* **Backend**: Node.js + Express (registro de pedidos)
* **Banco**: Redis (armazenamento dos pedidos)

---

## 🚀 Passo 1 — Subindo o Redis (Instância 1)

No Play with Docker, abra a primeira instância e rode:

```bash
apk update
apk add redis
redis-server --protected-mode no &
redis-cli
ping
```

Se retornar `PONG`, o Redis está ativo. ✅

---

## 🛠️ Passo 2 — Configurando o Node.js (Instância 2)

Na segunda instância:

```bash
apk add nodejs npm
mkdir app && cd app
mkdir public
touch public/index.html server.js
npm init -y
npm install express path
```

Após isso rode:
```
node server.js
```

E abre a porta 3000.

---

## 📂 Estrutura do Projeto

```
app/
 ├── public/
 │    ├── index.html
 │    ├── style.css
 │    ├── super_coffee.png
 │    ├── mocha_delicious.png
 │    └── latte_love.png
 └── server.js
```

---

## 💻 Backend (`server.js`)

```js
const express = require("express");
const path = require("path");
const { createClient } = require("redis");

const app = express();
const PORT = 3000;

// Conectar ao Redis (substitua pelo IP da instância Redis)
const client = createClient({ url: "redis://<IP_INSTANCIA_REDIS>:6379" });

client.on("error", (err) => console.error("Erro no Redis", err));
(async () => await client.connect())();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Registrar pedido
app.post("/pedido", async (req, res) => {
  const itens = req.body.itens;
  if (!itens?.length) return res.status(400).json({ erro: "Carrinho vazio" });

  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const pedidoId = `pedido:${Date.now()}`;

  await client.hSet(pedidoId, {
    itens: JSON.stringify(itens),
    total: total.toFixed(2),
    criadoEm: new Date().toISOString(),
  });

  res.json({ mensagem: "Pedido registrado com sucesso!", pedidoId, total });
});

// Listar pedidos
app.get("/pedidos", async (req, res) => {
  const keys = await client.keys("pedido:*");
  const pedidos = [];
  for (const key of keys) {
    const p = await client.hGetAll(key);
    pedidos.push({ id: key, ...p, itens: JSON.parse(p.itens) });
  }
  res.json(pedidos);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
```

---

## ▶️ Rodando o Backend

Na **instância 2**:

```bash
apk add nodejs npm
mkdir app
cd app
mkdir public
touch public/index.html
touch server.js
npm init -y
npm install --save express path
```

---

## 🔍 Testando

1. Abra o navegador no Play with Docker e clique na porta **3000**.
2. A página do catálogo de cafés será exibida.
3. Selecione os produtos e clique em **Confirmar Compra**.
4. Para listar pedidos já feitos, acesse:

```
http://<IP_INSTANCIA_NODE>:3000/pedidos
```

---

☕ Agora você tem o **Redis (Instância 1)** e o **Node.js (Instância 2)** trabalhando juntos.
