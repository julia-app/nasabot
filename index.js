

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const mysql = require('mysql2');

// Conexão com MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'nasabot_user',
    password: 'RedePesc@123',
    database: 'chatbot_db'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
    } else {
        console.log('✅ Conectado ao MySQL!');
    }
});

// Estado da conversa
const conversationState = {};

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🤖 NASABOT pronta para uso!');
});

client.on('message', async (message) => {
    const user = message.from;
    const userState = conversationState[user] || {};

    try {
        if (!userState.step) {
            await message.reply(
                'Olá! Seja bem-vindo ao Chatbot NASA. Como posso te ajudar hoje?\n\n1 - Consulta pré-anestésica\n2 - Dúvidas frequentes'
            );
            userState.step = 'menuInicial';
        } else if (userState.step === 'menuInicial') {
            if (message.body === '1') {
                await message.reply('Como você gostaria de realizar a sua consulta?\n\n1 - Presencial\n2 - Online');
                userState.step = 'consultaInicial';
            } else if (message.body === '2') {
                await message.reply('Entendi! Clique no link abaixo para conhecer as nossas dúvidas frequentes:\n\nhttps://nasabot.com.br/faq');
                userState.step = 'finalizado';
            } else {
                await message.reply('Opção inválida. Por favor, escolha uma das opções: 1 ou 2.');
            }
        } else if (userState.step === 'consultaInicial') {
            if (message.body === '1') {
                await message.reply('Para agendar sua consulta presencial, entre em contato pelo número 71 3330-6100 ou via WhatsApp 71 9...');
                userState.step = 'finalizado';
            } else if (message.body === '2') {
                await message.reply(
                    'Você escolheu a consulta online. Selecione uma das opções abaixo:\n\n1 - Síncrona\n2 - Assíncrona (via formulário)'
                );
                userState.step = 'consultaOnline';
            } else {
                await message.reply('Opção inválida. Por favor, escolha 1 ou 2.');
            }
        } else if (userState.step === 'consultaOnline') {
            if (message.body === '1') {
                await message.reply('Para agendar uma consulta online ao vivo, ligue 71 3330-6100 ou WhatsApp 71 9...');
                userState.step = 'finalizado';
            } else if (message.body === '2') {
                await message.reply('Digite seu CPF (apenas números, 11 dígitos):');
                userState.step = 'cpf';
            } else {
                await message.reply('Opção inválida. Por favor, escolha 1 ou 2.');
            }
        } else if (userState.step === 'cpf') {
            const cpf = message.body.trim();
            if (!/^\d{11}$/.test(cpf)) {
                await message.reply('CPF inválido. Digite novamente (11 números).');
                return;
            }

            db.query(
                    `SELECT p.nome, p.token
                    FROM pacientes p
                    JOIN tokens t ON p.token = t.token
                    WHERE p.cpf = ? AND t.vinculacao = TRUE AND (t.validade IS NULL OR t.validade > NOW())`,
                    [cpf],
                    async (err, results) => {
                        if (err) {
                            console.error('Erro na consulta:', err);
                            await message.reply('❌ Erro ao consultar CPF. Tente novamente mais tarde.');
                            return;
                        }

                        if (Array.isArray(results) && results.length > 0 && results[0].nome && results[0].token) {
                            const { nome, token } = results[0];
                            const url = `https://formnasa.netlify.app/?token=${token}`;

                            await message.reply(`✅ Olá, ${nome}! Cadastro localizado com sucesso. Acesse o formulário abaixo:\n\n${url}`);
                            userState.step = 'finalizado';
                        } else {
                            await message.reply(
                                'Ops! Não encontrei seu cadastro ativo. Verifique com a clínica se o CPF foi corretamente registrado. Deseja:\n\n1 - Tentar novamente\n2 - Encerrar conversa'
                             );
                            userState.step = 'cpfNaoEncontrado';
                        }

                        // Atualiza o estado do usuário mesmo dentro da query
                        conversationState[user] = userState;
                    }
                );

        } else if (userState.step === 'cpfNaoEncontrado') {
            if (message.body === '1') {
                await message.reply('Digite seu CPF (11 números):');
                userState.step = 'cpf';
            } else if (message.body === '2') {
                await message.reply('Obrigado por nos contatar. Até breve!');
                userState.step = 'finalizado';
            } else {
                await message.reply('Opção inválida. Escolha 1 ou 2.');
            }
        } else if (userState.step === 'finalizado') {
            if (!userState.finalizadoAvisado) {
                await message.reply('Conversa finalizada. Se precisar de algo, estou aqui!');
                userState.finalizadoAvisado = true;
            } else {
                await message.reply(
                    '👋 Vamos iniciar uma nova conversa!\n\n1 - Consulta pré-anestésica\n2 - Dúvidas frequentes'
                );
                userState.step = 'menuInicial';
                userState.finalizadoAvisado = false;
            }
        }

        conversationState[user] = userState;
    } catch (error) {
        console.error(`Erro ao processar mensagem de ${user}:`, error);
        await message.reply('Ocorreu um erro interno. Tente novamente mais tarde.');
    }
});

client.initialize();
