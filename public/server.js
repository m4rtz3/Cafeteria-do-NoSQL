const express = require("express");
const path = require("path");
const { createClient } = require("redis");

const app = express();
const PORT = 3000;

// Conectar ao Redis na instância 1 (troque pelo IP da instância Redis)
const client = createClient({ url: "redis://192.168.0.24:6379" });

client.on("error", (err) => console.error("Erro no Redis", err));

(async () => {
  await client.connect();
})();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Registrar pedido
app.post("/pedido", async (req, res) => {
  const itens = req.body.itens;
  if (!itens || itens.length === 0) {
    return res.status(400).json({ erro: "Carrinho vazio" });
  }

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
  console.log(`Servidor rodando em http://192.168.0.23:${PORT}`);
});
