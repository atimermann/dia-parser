"use strict";


const xml2js = require('xml2js');
const util = require('util');

const Promise = require('bluebird');

const fs = require('fs');
Promise.promisifyAll(fs);

const zlib = require('zlib');
Promise.promisifyAll(zlib);

const xmlParser = new xml2js.Parser();
Promise.promisifyAll(xmlParser);

const inspect = require('eyes').inspector({maxLength: false});

const _ = require('lodash');


class DiaParser {



    /**
     * Carrega Arquivo DIA
     *
     * @param file
     * @returns {Promise.<{}>}
     */
    loadDia(file) {




        ///////////////////////////////////////////////////////////////
        // Abre Arquivo
        ///////////////////////////////////////////////////////////////
        console.log(`Carregando: '${file}`);
        return fs
            .readFileAsync(file)

            ///////////////////////////////////////////////////////////////
            // Descompacta arquivo gzip
            ///////////////////////////////////////////////////////////////
            .then(buffer => this._gunzip(buffer))

            ///////////////////////////////////////////////////////////////
            // Converte XML para Objeto
            ///////////////////////////////////////////////////////////////
            .then(buffer => xmlParser.parseStringAsync(buffer))

            ///////////////////////////////////////////////////////////////
            // Processa Objeto para formato interno de facil utilização
            ///////////////////////////////////////////////////////////////
            .then(xmlObject => this._parseObjects(xmlObject));

            ///////////////////////////////////////////////////////////////
            // Aplica Plugin de conversão: No caso unico arquivo para gerar Modelo de base de dados
            ///////////////////////////////////////////////////////////////
            // .then(resultObject => resultObject);


    }


    /**
     * Diagramas Dia, são gravados compactado em formato GZIP, aqui verificamos se já está descompactado, se tiver retorna
     * buffer descompactado, caso contrário descompata e retorna buffer resultante
     *
     * @param {buffer}  buffer  Arquivo carregado do sistema de arquivos
     *
     * @returns {Promise.<buffer>}  Arquivo dia descompactado
     */
    _gunzip(buffer) {

        return zlib.gunzipAsync(buffer)
            .catch(err => {

                if (err.errno === zlib.Z_DATA_ERROR) {
                    return buffer;
                } else {
                    throw  err;
                }

            });

    }

    /**
     * Processa todos os tipos de objetos
     *
     * @param xmlObject
     * @returns {{}}
     */
    _parseObjects(xmlObject) {

        // Vamos ignorar a informação de camada, irrelevante para caso atual (extrair DER)
        let resultObject = {};

        let layers = xmlObject['dia:diagram']['dia:layer'];

        _.each(layers, layer => {

            let diaObjects = layer['dia:object'];

            _.each(diaObjects, object => {

                let type = object['$'].type;
                let id = object['$'].id;

                let result = this._parseObject(object);

                if (result) {

                    if (!resultObject[type]) {
                        resultObject[type] = {};
                    }

                    resultObject[type][result.name] = result;
                    resultObject[type][result.name].id = id;


                }


            })
        });

        return resultObject;


    }

    /**
     * Processa Objeto de acordo com seu Tipo
     *
     * @param object
     * @returns {*}
     * @private
     */
    _parseObject(object) {

        let self = this;

        let type = object['$'].type;
        let version = object['$'].version;


        let parser;

        console.log('Object:', type);

        switch (type) {

            case 'UML - Class':

                parser = new (require('./parser/umlClass'))();
                return parser.parse(object['dia:attribute']);

                break;

            case 'UML - Association':

                parser = new (require('./parser/umlAssociation'))();
                return parser.parse(object['dia:attribute'], object['dia:connections']);

                break;

            default:
                console.log(`Tipo '${type}' não suportado!`);

        }

    }

    /**
     * Constrói destino
     *
     * @param adaptor
     * @param data
     */
    build(adaptor, data, output) {

        let self = this;

        if (adaptor === 'yamlSql') {

            let adaptor = new (require('./lib/yamlSql'))(output);
            adaptor.build(data);

        }


    }


}

module.exports = DiaParser;