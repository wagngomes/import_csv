const express  = require('express')
const fs = require('fs')
const csv = require('csv')
const db = require('./db/models/index')
const upload = require('./services/uploadCsvServices')
const path = require('path')
const app = express()
app.use(express.json)
app.use(express.static(path.join(__dirname, "public")))

app.post("/", upload.single('arquivo'), (req, res)=> {

    if(!req.file){
        return res.send("Erro : Selecione arquivo CSV")
    }

    //caminho para o arquivo
    const arquivoCsv = './public/upload/csv/' + req.file.filename

    fs.createReadStream(arquivoCsv)
        .pipe(csv.parse({columns: true, delimiter:';'}))
        .on('data', async(dadosLinha) => {
            //cadastrar novo usuario no banco

            const user = await db.Users.findOne({
                //Quais colunas eu quero retornar
                attributes: [id],
                //Parametro da busca
                where: {
                    cpf: dadosLinha.cpf
                }
            })

            if(!user){
                //Se não encontrou o CPF segue com o upload
                await db.Users.create(dadosLinha)
            }           
        })
    return res.send("importação concluida")
})

app.listen(8080, ()=> {

    console.log("servidor rodando")
})