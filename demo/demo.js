/**
 * Created by André Timermann on 27/11/16.
 *
 * Script para Demonstrar o funcionamento do dia-parser
 *
 */
'use strict';

const DiaParser = require('../index.js');

let diaParser = new DiaParser();

////////////////////////////////////////////////////////////////////
// Converte Dia => YAML
////////////////////////////////////////////////////////////////////
diaParser.loadDia(__dirname + '/teste.dia')

    .then(data => {

        console.log(data);

        // Realiza Validação dos Modelos, e grava resoltado na pasta output
        diaParser.build('yamlSql', data);

    });


////////////////////////////////////////////////////////////////////
// Converte YAML => DIA
////////////////////////////////////////////////////////////////////
