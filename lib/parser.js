/**
 * **Created on 04/07/16**
 *
 * <File Reference Aqui: parser>
 * @author André Timermann <andre@andregustvo.org>
 *
 */
'use strict';

const _ = require('lodash');
const inspect = require('eyes').inspector({maxLength: false});

class Parser {


    constructor() {

        let self = this;

        self._cache = {}
    }

    /**
     * Carrega todos os Atributos de um dado Objeto
     *
     * @param object
     * @returns {{}}
     */
    readPropertys(object) {

        let self = this;

        let resultObject = {};

        _.each(object, function (property) {

            let result = self.readProperty(property);

            resultObject[result.key] = result.value;

        });

        return resultObject;

    }

    /**
     * Carrega um Atributo de acordo com o Tipo
     * TODO: A medida que aparecer novos tipos ir implementando (gera exceção quando surgir um novo)
     *
     * @param property
     */
    readProperty(property) {

        let self = this;

        let result = {};

        result.key = property['$'].name;

        _.each(property, function (value, type) {

            switch (type) {

                case "$":
                    break;

                case "dia:string":

                    result.value = value[0].replace(/#/g, '');
                    return false;
                    break;

                case "dia:enum":
                    result.value = value[0]['$'].val;
                    return false;
                    break;

                case "dia:boolean":
                    result.value = value[0]['$'].val;
                    return false;
                    break;

                case "dia:composite":

                    result.value = [];
                    _.each(value, function (v) {
                        result.value.push(self.readPropertys(v['dia:attribute']));
                    });

                    return false;

                    break;

                default:

                    console.log(type);
                    inspect(value);
                    throw new Error(`Tipo '${type}' não implementado`);

            }

        });

        return result;

    }


    /**
     * Procura por 'name' em 'object' e retorna o elemento encontrado se encontrar
     * Undefined se não encontrar
     *
     * @param name
     * @param object
     * @returns {*}
     */
    find(name, object) {

        let self = this;

        let result;

        _.each(object, function (attribute) {


            if (attribute['$'].name === name){
                result = self.readProperty(attribute).value;
                return false;
            }

        });

        return result;

    }
}


module.exports = Parser;