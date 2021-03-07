import tp from 'tedious-promises';
import dbConfig from './config.js';

export const connect = () => {
    tp.setConnectionConfig(dbConfig);
}

export const insertCode = (table, fields, values) => {
    return new Promise((resolve, reject) => {
        let sql = `
            INSERT INTO 
                ${table} 
                (${fields}) 
            VALUES 
                ('${values[0]}', '${values[1]}')
        `;
        tp.sql(sql)
        .execute()
        .then(() => resolve(true))
        .catch(error => reject(error));
    });
}

export const getSum = (table, code) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT 
                soma
            FROM 
                ${table} 
            WHERE 
            cod = ${code}
        `;
        tp.sql(sql)
        .execute()
        .then(result => resolve(Number(result[0].soma)))
        .catch(error => reject(error));
    })
}

export const getDataByTotalSum = total => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT 
                a.animal, c.cor, p.pais
            FROM
                tbs_cores as c
            LEFT JOIN
                tbs_cores_excluidas as c_e
            ON
                c.total = c_e.total
            INNER JOIN
                tbs_animais as a
            ON
                c.total = a.total
            INNER JOIN
                tbs_paises as p
            ON
                p.total = a.total
            WHERE
                c.total = ${total}
            AND
                c.cor != c_e.cor
        `;
        tp.sql(sql)
        .execute()
        .then(response => resolve(response))
        .catch(error => reject(error));
    })
} 