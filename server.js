// // server.js (raiz do projeto Nasabot)
// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');

// const app = express();
// const port = 3333; // Porta escolhida para evitar conflito com o bot do WhatsApp

// // app.use(cors()); 
// // Libera acesso CORS para o frontend
// app.use(cors({
//   origin: 'https://formnasa.netlify.app'
// }));
// app.use(express.json());

// // Conexão com o banco de dados MySQL
// const db = mysql.createConnection({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'nasabot_user',
//   password: process.env.DB_PASSWORD || 'RedePesc@123',
//   database: process.env.DB_NAME || 'chatbot_db',
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
// });


// // Verifica conexão
// db.connect((err) => {
//     if (err) {
//         console.error('❌ Erro ao conectar no banco de dados:', err);
//     } else {
//         console.log('✅ Conectado ao banco de dados MySQL com sucesso!');
//     }
// });

// // Rota para validar o token
// app.get('/validar-token', (req, res) => {
//     const token = req.query.token;

//     if (!token) {
//         return res.status(400).json({ valido: false, error: 'Token não fornecido.' });
//     }

//     db.query(
//         'SELECT * FROM tokens WHERE token = ? AND vinculacao = TRUE AND (validade IS NULL OR validade > NOW())',
//         [token],
//         (err, results) => {
//             if (err) {
//                 console.error('Erro ao consultar token:', err);
//                 return res.status(500).json({ valido: false, error: 'Erro interno no servidor.' });
//             }

//             if (results.length > 0) {
//                 return res.json({ valido: true, usuario: results[0] });
//             } else {
//                 return res.status(403).json({ valido: false, error: 'Token inválido, expirado ou já utilizado.' });
//             }
//         }
//     );
// });

// // Inicializa o servidor
// app.listen(port, '0.0.0.0', () => {
//     console.log(`🚀 Servidor de validação rodando em http://0.0.0.0:${port}`);
// });

// server.js (raiz do projeto Nasabot)
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3333; // Porta escolhida para evitar conflito com o bot do WhatsApp

// Libera acesso CORS para os frontends
app.use(cors({
  origin: [
    'https://formnasa.netlify.app',
    'https://nasaclientes.netlify.app', // novo frontend de cadastro de clínica
    'https://nasatokens.netlify.app',
    'https://nasaportal.netlify.app'
  ]
}));
app.use(express.json());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'nasabot_user',
  password: process.env.DB_PASSWORD || 'RedePesc@123',
  database: process.env.DB_NAME || 'chatbot_db',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
});

// Verifica conexão
db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco de dados:', err);
  } else {
    console.log('✅ Conectado ao banco de dados MySQL com sucesso!');
  }
});

// 🧪 Rota de validação de token
app.get('/validar-token', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ valido: false, error: 'Token não fornecido.' });
  }

  db.query(
    'SELECT * FROM tokens WHERE token = ? AND vinculacao = TRUE AND (validade IS NULL OR validade > NOW())',
    [token],
    (err, results) => {
      if (err) {
        console.error('Erro ao consultar token:', err);
        return res.status(500).json({ valido: false, error: 'Erro interno no servidor.' });
      }

      if (results.length > 0) {
        return res.json({ valido: true, usuario: results[0] });
      } else {
        return res.status(403).json({ valido: false, error: 'Token inválido, expirado ou já utilizado.' });
      }
    }
  );
});

// ✅ Rota para cadastro de clínica
app.post('/api/clinicas', (req, res) => {
  const {
    cnpj,
    razao_social,
    nome_fantasia,
    responsavel,
    email,
    telefone,
    cidade,
    estado,
    cep,
    numero,
    plano,
    observacoes,
    validade_token_dias
  } = req.body;

  const sql = `
    INSERT INTO clinicas 
    (cnpj, razao_social, nome_fantasia, responsavel, email, telefone, cidade, estado, cep, numero, plano, observacoes, validade_token_dias)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    cnpj, razao_social, nome_fantasia, responsavel, email, telefone,
    cidade, estado, cep, numero, plano, observacoes || null, validade_token_dias
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Erro ao cadastrar clínica:', err);
      return res.status(500).json({ message: 'Erro ao cadastrar clínica.' });
    }

    return res.status(201).json({ message: 'Clínica cadastrada com sucesso!', id: result.insertId });
  });
});

// Inicializa o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor de validação rodando em http://0.0.0.0:${port}`);
});
