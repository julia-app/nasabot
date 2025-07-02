// server.js (raiz do projeto Nasabot)
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3333; // Porta escolhida para evitar conflito com o bot do WhatsApp

// app.use(cors()); 
// Libera acesso CORS para o frontend
app.use(cors({
  origin: 'https://formnasa.netlify.app'
}));
app.use(express.json());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'nasabot_user',
    password: 'RedePesc@123',
    database: 'chatbot_db'
});

// Verifica conexão
db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar no banco de dados:', err);
    } else {
        console.log('✅ Conectado ao banco de dados MySQL com sucesso!');
    }
});

// Rota para validar o token
app.get('/validar-token', (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ valido: false, error: 'Token não fornecido.' });
    }

    db.query(
        'SELECT * FROM tokens WHERE token = ? AND usado = FALSE AND vinculado = TRUE AND (data_expiracao IS NULL OR data_expiracao > NOW())',
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

// Inicializa o servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor de validação rodando em http://0.0.0.0:${port}`);
});



// // server.js (raiz do projeto Nasabot)
// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');

// const app = express();
// const port = 3333; // Porta personalizada para evitar conflito com o bot

// app.use(cors());
// app.use(express.json());

// // Conexão com o banco de dados
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'nasabot_user',
//     password: 'RedePesc@123',
//     database: 'nasabot'
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
//         return res.status(400).json({ error: 'Token não fornecido.' });
//     }

//     db.query(
//         'SELECT * FROM usuarios WHERE token = ? AND usado = FALSE AND (data_expiracao IS NULL OR data_expiracao > NOW())',
//         [token],
//         (err, results) => {
//             if (err) {
//                 console.error('Erro ao consultar token:', err);
//                 return res.status(500).json({ error: 'Erro interno no servidor.' });
//             }

//             if (results.length > 0) {
//                 return res.json({ valido: true, usuario: results[0] });
//             } else {
//                 return res.status(403).json({ valido: false, error: 'Token inválido, expirado ou já utilizado.' });
//             }
//         }
//     );
// });

// app.listen(port, () => {
//     console.log(`🚀 Servidor de validação rodando em http://localhost:${port}`);
// });
