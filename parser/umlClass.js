/**
 * **Created on 04/07/16**
 *
 * <File Reference Aqui: umlClass>
 * @author André Timermann <andre@andregustvo.org>
 *
 */
'use strict';

const _ = require('lodash');
const inspect = require('eyes').inspector({maxLength: false});
const Parser = require('../lib/parser');

class UmlClass extends Parser {


    constructor() {

        super();


        this.parsed = {};
        this.parsed.attribute = {};
        this.parsed.operation = {};

    }

    parse(attributes) {

        let self = this;


        _.each(attributes, function (attr) {

            switch (attr['$'].name) {

                case 'name':
                    self.parsed.name = attr['dia:string'][0].replace(/#/g, '');
                    break;

                case 'comment':
                    self.parsed.comment = attr['dia:string'][0].replace(/#/g, '');
                    break;

                case 'attributes':

                    self.parseAttributes(attr['dia:composite']);
                    break;

                case 'operations':

                    self.parseOperations(attr['dia:composite']);
                    break;


                default:
                //console.log(attr['$'].name)
                //inspect(attr)
            }


        });


        return self.parsed;

    }

    parseAttributes(elements) {

        let self = this;

        _.each(elements, function (element) {

            let result = self.parseAttribute(element['dia:attribute']);

            self.parsed.attribute[result.name] = result;

        });


    }

    /**
     * Carrega Atributo
     *
     * @param element
     * @returns {{}}
     */
    parseAttribute(element) {

        let self = this;

        return self.readPropertys(element);

    }

    /**
     * Carrega Operações
     * @param operations
     */
    parseOperations(operations) {

        let self = this;

        _.each(operations, function (operation) {



            let result = self.readPropertys(operation['dia:attribute'])


            self.parsed.operation[result.name] = {
                type: result.type,
                parameters: _.map(result.parameters, 'name')
            };


        });


    }


}


module.exports = UmlClass;