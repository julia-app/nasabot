const gerarNovoToken = (cnpj, callback) => {
  // Busca a validade em dias da clínica
  db.query(
    'SELECT validade_token_dias FROM clinicas WHERE cnpj = ?',
    [cnpj],
    (err, results) => {
      if (err) {
        console.error('Erro ao buscar validade do plano da clínica:', err);
        return callback(err);
      }

      if (results.length === 0) {
        return callback(new Error('Clínica não encontrada.'));
      }

      const diasValidade = results[0].validade_token_dias;
      const token = require('crypto').randomUUID(); // Gera token UUID

      // Insere o token com validade calculada
      db.query(
        `INSERT INTO tokens (token, clinica_cnpj, validade, vinculacao)
         VALUES (?, ?, NOW() + INTERVAL ? DAY, FALSE)`,
        [token, cnpj, diasValidade],
        (err2, insertResult) => {
          if (err2) {
            console.error('Erro ao inserir token:', err2);
            return callback(err2);
          }

          console.log('✅ Novo token criado:', token);
          return callback(null, token);
        }
      );
    }
  );
};
