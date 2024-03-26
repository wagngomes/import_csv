// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Incluir a biblioteca para ler o conteúdo do arquivo CSV
const csv = require('csv');
// Permite interagir com o sistema de arquivos
const fs = require('fs');
// Incluir o módulo para gerenciar diretórios e caminhos
const path = require('path');
// Incluir o arquivo com a função de upload
const upload = require('./services/uploadCsvServices');
// Incluir a conexão com banco de dados
const db = require('./db/models');
// Chamar a função express
const app = express();

// Criar o middleware para receber os dados no corpo da requisição
app.use(express.json());

// Local dos arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Criar a rota importar CSV
app.post("/", upload.single('arquivo'), (req, res) => {

    // Acessa o IF quando a extensão da imagem é inválida
    if (!req.file) {
        return res.send("Erro: Selecione arquivo CSV!");
    }

    // Caminho para o arquivo CSV
    const arquivoCSV = './public/upload/csv/' + req.file.filename;

    // Ler o arquivo CSV
    fs.createReadStream(arquivoCSV)

        // pipe - conectar fluxos de leitura e escrita, sem armazenar os dados intermediários em memória
        // columns: true - Primeira linha do arquivo CSV seja tratada como cabeçalho, o nome do cabeçalho corresponde o nome da coluna no banco de dados
        // Delimitador é ; (ponto e vírgula)
        .pipe(csv.parse({ columns: true, delimiter: ';' }))

        // Acionar o evento data quando ler uma linha e executar a função enviando os dados como parâmetro
        .on('data', async (dadosLinha) => {
            //console.log(dadosLinha);
            //console.log(dadosLinha[0]);

            // Recuperar o registro do banco de dados
            const user = await db.Users.findOne({

                // Indicar quais colunas recuperar
                attributes: ['id'],

                // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
                where: { cpf: dadosLinha.cpf }
            });

            // Acessa o IF quando o usuário não está cadastrado no banco de dados
            if (!user) {
                // Cadastrar o usuário no banco de dados
                await db.Users.create(dadosLinha);
            }

        });

        // Salvar o nome do arquivo no banco de dados
        /*db.Arquivos.create({arquivo: req.file.filename})
        .then(() => {
            return res.send("Importação concluída.");
        }).catch(() => {
            return res.send("Erro: Nome do arquivo não foi salvo banco de dados!");
        });*/

});

// Iniciar o servidor na porta 8080, criar a função utilizando modelo Arrow function para retornar a mensagem de sucesso
app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});