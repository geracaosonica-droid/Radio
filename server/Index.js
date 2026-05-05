const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Dados dos estabelecimentos de Ribeirão Preto
const estabelecimentos = [
  {
    id: '1',
    nome: 'Restaurante Le Coq',
    categoria: 'alto_padrao',
    regiao: 'alto_da_boa_vista',
    tipo: 'restaurante',
    descricao: 'Gastronomia francesa premium',
    cardapio: [
      { nome: 'Foie Gras', preco: 'R$ 89,00' },
      { nome: 'Magret de Canard', preco: 'R$ 120,00' },
      { nome: 'Crème Brûlée', preco: 'R$ 35,00' }
    ],
    instagram: '@lecoqrp',
    live_url: '',
    imagem: 'https://via.placeholder.com/400x200/1A1A2E/FF6B00?text=Le+Coq'
  },
  {
    id: '2',
    nome: 'Bar do Zé',
    categoria: 'popular',
    regiao: 'zona_norte',
    tipo: 'bar',
    descricao: 'Tradicional bar raiz, melhor PF da cidade',
    cardapio: [
      { nome: 'PF Completo', preco: 'R$ 18,00' },
      { nome: 'Porção de Torresmo', preco: 'R$ 25,00' },
      { nome: 'Cerveja 600ml', preco: 'R$ 8,00' }
    ],
    instagram: '@bardoze',
    live_url: '',
    imagem: 'https://via.placeholder.com/400x200/1A1A2E/FF6B00?text=Bar+do+Ze'
  },
  {
    id: '3',
    nome: 'Sushi Premium',
    categoria: 'alto_padrao',
    regiao: 'nova_alianca',
    tipo: 'restaurante',
    descricao: 'Melhor sushi de Ribeirão Preto',
    cardapio: [
      { nome: 'Combinado Premium', preco: 'R$ 149,00' },
      { nome: 'Temaki Salmão', preco: 'R$ 35,00' },
      { nome: 'Sashimi Atum', preco: 'R$ 55,00' }
    ],
    instagram: '@sushipremiumrp',
    live_url: '',
    imagem: 'https://via.placeholder.com/400x200/1A1A2E/FF6B00?text=Sushi+Premium'
  },
  {
    id: '4',
    nome: 'Café da Esquina',
    categoria: 'classe_media',
    regiao: 'centro',
    tipo: 'cafeteria',
    descricao: 'Cafés especiais e brunch',
    cardapio: [
      { nome: 'Café Espresso', preco: 'R$ 6,00' },
      { nome: 'Bolo de Cenoura', preco: 'R$ 12,00' },
      { nome: 'Sanduíche Natural', preco: 'R$ 18,00' }
    ],
    instagram: '@cafedaesquina',
    live_url: '',
    imagem: 'https://via.placeholder.com/400x200/1A1A2E/FF6B00?text=Cafe+da+Esquina'
  },
  {
    id: '5',
    nome: 'Villa Roxa',
    categoria: 'alto_padrao',
    regiao: 'jardim_paulista',
    tipo: 'casa_noturna',
    descricao: 'Balada premium com música ao vivo',
    cardapio: [
      { nome: 'Combo VIP', preco: 'R$ 500,00' },
      { nome: 'Drink Premium', preco: 'R$ 45,00' },
      { nome: 'Área Vip', preco: 'R$ 200,00' }
    ],
    instagram: '@villaroxa',
    live_url: 'https://www.instagram.com/villaroxa/live',
    imagem: 'https://via.placeholder.com/400x200/1A1A2E/FF6B00?text=Villa+Roxa'
  }
];

// Endpoints da API
app.get('/api/estabelecimentos', (req, res) => {
  const { categoria, regiao, tipo } = req.query;
  let resultado = estabelecimentos;
  
  if (categoria) resultado = resultado.filter(e => e.categoria === categoria);
  if (regiao) resultado = resultado.filter(e => e.regiao === regiao);
  if (tipo) resultado = resultado.filter(e => e.tipo === tipo);
  
  res.json(resultado);
});

app.get('/api/estabelecimentos/:id', (req, res) => {
  const est = estabelecimentos.find(e => e.id === req.params.id);
  if (est) res.json(est);
  else res.status(404).json({ erro: 'Não encontrado' });
});

app.get('/api/categorias', (req, res) => {
  res.json([
    { id: 'alto_padrao', nome: 'Alto Padrão', icone: 'diamond' },
    { id: 'classe_media', nome: 'Classe Média', icone: 'star' },
    { id: 'popular', nome: 'Popular', icone: 'home' }
  ]);
});

app.get('/api/regioes', (req, res) => {
  res.json([
    { id: 'alto_da_boa_vista', nome: 'Alto da Boa Vista' },
    { id: 'nova_alianca', nome: 'Nova Aliança' },
    { id: 'jardim_paulista', nome: 'Jardim Paulista' },
    { id: 'centro', nome: 'Centro' },
    { id: 'zona_norte', nome: 'Zona Norte' },
    { id: 'zona_sul', nome: 'Zona Sul' }
  ]);
});

app.get('/', (req, res) => {
  res.json({
    plataforma: 'Geração Sônica',
    cidade: 'Ribeirão Preto',
    total_estabelecimentos: estabelecimentos.length,
    versao: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`Plataforma Geração Sônica rodando na porta ${PORT}`);
});