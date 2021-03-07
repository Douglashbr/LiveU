import express from 'express';
import bodyParser from 'body-parser';
import { connect, insertCode, getSum, getDataByTotalSum } from './db.js';
import axios from 'axios';

const app = express();

const totalSum = (nome, sobrenome, email) => {
    let nomeTotal = nome[1] + nome[2];
    let sobrenomeTotal = sobrenome[1] + sobrenome[2];
    let emailTotal = email[1] + email[2];

    return nomeTotal + sobrenomeTotal + emailTotal;
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('assets'));

app.listen('3000', () => {
    connect();
    console.log('Server Listening on PORT 3000!');
});

app.get('/', (req, res) => {
    res.render('index', { data: null });
});

app.post('/', (req, res) => {
    const { nome, sobrenome, email } = req.body;

    const data = new URLSearchParams();
    data.append('nome', nome);
    data.append('sobrenome', sobrenome);
    data.append('email', email);

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    axios.post('http://138.68.29.250:8082/', data, config)
    .then(async response => {
        response.data = response.data.split('#');
        let codigoNome = Number(response.data.slice(0, 2)[1]);
        let codigoSobrenome = Number(response.data.slice(2, 4)[1]);
        let codigoEmail = Number(response.data.slice(4, 6)[1]);

        let nomeArray = [nome, codigoNome];
        let sobrenomeArray = [sobrenome, codigoSobrenome];
        let emailArray = [email, codigoEmail];

        try {
            await insertCode('tbs_nome', ['nome', 'cod'], nomeArray);
            await insertCode('tbs_sobrenome', ['sobrenome', 'cod'], sobrenomeArray);
            await insertCode('tbs_email', ['email', 'cod'], emailArray);
    
            nomeArray.push(await getSum('tbs_cod_nome', codigoNome));
            sobrenomeArray.push(await getSum('tbs_cod_sobrenome', codigoSobrenome));
            emailArray.push(await getSum('tbs_cod_email', codigoEmail));

            let total = totalSum(nomeArray, sobrenomeArray, emailArray);

            let dataToUser = await getDataByTotalSum(total);

            res.render('index', { data: dataToUser });
        } catch (error) {
            res.render('index', { data: null });
            console.log(error);
        }

    })
    .catch(error => console.log(error.data))

});