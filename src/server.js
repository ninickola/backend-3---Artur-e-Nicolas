const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Gere Elderly com Express e MySQL' });
});

app.get('/usuarios', async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, nome, email, criado_em FROM usuarios ORDER BY id DESC'
    );

    res.json(usuarios);
  } catch (error) {
    console.error('Erro MySQL (/usuarios):', error);
    res.status(500).json({
      message: 'Erro ao listar usuários',
      erro_real: error.message
    });
  }
});

app.get('/usuarios/busca/:nome', async (req, res) => {
  try {
    const { nome } = req.params;

    const [usuarios] = await db.query(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE nome LIKE ?',
      [`%${nome}%`]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: 'Nenhum usuário encontrado'
      });
    }

    res.json(usuarios);
  } catch (error) {
    console.error('Erro MySQL (/usuarios/busca):', error);
    res.status(500).json({
      message: 'Erro ao buscar usuários',
      erro_real: error.message
    });
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [usuarios] = await db.query(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Erro MySQL (/usuarios/:id):', error);
    res.status(500).json({
      message: 'Erro ao buscar usuário',
      erro_real: error.message
    });
  }
});

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    const [usuarioExistente] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({
        message: 'Este email já está cadastrado'
      });
    }

    const [resultado] = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    res.status(201).json({
      id: resultado.insertId,
      nome,
      email
    });
  } catch (error) {
    console.error('Erro MySQL (POST /usuarios):', error);
    res.status(500).json({
      message: 'Erro ao criar usuário',
      erro_real: error.message
    });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    const [usuarioExistente] = await db.query(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarioExistente.length === 0) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    const [emailExistente] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );

    if (emailExistente.length > 0) {
      return res.status(409).json({
        message: 'Este email já está cadastrado'
      });
    }

    await db.query(
      'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?',
      [nome, email, senha, id]
    );

    res.json({
      id,
      nome,
      email
    });
  } catch (error) {
    console.error('Erro MySQL (PUT /usuarios):', error);
    res.status(500).json({
      message: 'Erro ao atualizar usuário',
      erro_real: error.message
    });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro MySQL (DELETE /usuarios):', error);
    res.status(500).json({
      message: 'Erro ao remover usuário',
      erro_real: error.message
    });
  }
});

app.get('/comunidades', async (req, res) => {
  try {
    const [comunidades] = await db.query(
      'SELECT * FROM comunidades ORDER BY id DESC'
    );

    res.json(comunidades);
  } catch (error) {
    console.error('Erro MySQL (/comunidades):', error);
    res.status(500).json({
      message: 'Erro ao listar comunidades',
      erro_real: error.message
    });
  }
});

app.get('/comunidades/busca/:nome', async (req, res) => {
  try {
    const { nome } = req.params;

    const [comunidades] = await db.query(
      'SELECT * FROM comunidades WHERE nome LIKE ?',
      [`%${nome}%`]
    );

    if (comunidades.length === 0) {
      return res.status(404).json({
        message: 'Nenhuma comunidade encontrada'
      });
    }

    res.json(comunidades);
  } catch (error) {
    console.error('Erro MySQL (/comunidades/busca):', error);
    res.status(500).json({
      message: 'Erro ao buscar comunidades',
      erro_real: error.message
    });
  }
});

app.get('/comunidades/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [comunidades] = await db.query(
      'SELECT * FROM comunidades WHERE id = ?',
      [id]
    );

    if (comunidades.length === 0) {
      return res.status(404).json({
        message: 'Comunidade não encontrada'
      });
    }

    res.json(comunidades[0]);
  } catch (error) {
    console.error('Erro MySQL (/comunidades/:id):', error);
    res.status(500).json({
      message: 'Erro ao buscar comunidade',
      erro_real: error.message
    });
  }
});

app.post('/comunidades', async (req, res) => {
  try {
    const { nome, interesse } = req.body;

    if (!nome || !interesse) {
      return res.status(400).json({
        message: 'Nome e interesse são obrigatórios'
      });
    }

    const [resultado] = await db.query(
      'INSERT INTO comunidades (nome, interesse) VALUES (?, ?)',
      [nome, interesse]
    );

    res.status(201).json({
      id: resultado.insertId,
      nome,
      interesse
    });
  } catch (error) {
    console.error('Erro MySQL (POST /comunidades):', error);
    res.status(500).json({
      message: 'Erro ao criar comunidade',
      erro_real: error.message
    });
  }
});

app.put('/comunidades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, interesse } = req.body;

    if (!nome || !interesse) {
      return res.status(400).json({
        message: 'Nome e interesse são obrigatórios'
      });
    }

    const [resultado] = await db.query(
      'UPDATE comunidades SET nome = ?, interesse = ? WHERE id = ?',
      [nome, interesse, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Comunidade não encontrada'
      });
    }

    res.json({
      id,
      nome,
      interesse
    });
  } catch (error) {
    console.error('Erro MySQL (PUT /comunidades):', error);
    res.status(500).json({
      message: 'Erro ao atualizar comunidade',
      erro_real: error.message
    });
  }
});

app.delete('/comunidades/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(
      'DELETE FROM comunidades WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Comunidade não encontrada'
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro MySQL (DELETE /comunidades):', error);
    res.status(500).json({
      message: 'Erro ao remover comunidade',
      erro_real: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});