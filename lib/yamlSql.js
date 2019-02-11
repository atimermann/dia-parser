/**
 * **Created on 04/07/16**
 *
 * Gera Schema Yaml para uso em Modelos de Banco de dados
 *
 * Realiza Validação do Modelo
 *
 * lib/yamlSql.js
 * @author André Timermann <andre@andregustvo.org>
 *
 */
'use strict';

const _ = require('lodash');
const yaml = require('js-yaml');

const Promise = require('bluebird');

const fs = require('fs');
Promise.promisifyAll(fs);

const path = require('path');

class YamlSql {

    constructor(output = "output") {

        // Diretório de destino
        this.output = output;

    }

    build(object) {

        // TODO: No futuro quando suportar mais objetos do DIA (ex: banco de dados) juntar aqui
        let classes = object['UML - Class'];
        let relations = object['UML - Association'];

        let idReference = {};
        let idReferenceName = {};
        let yamlFile = {};

        /////////////////////////////////////////////////////////////
        // Colunas
        /////////////////////////////////////////////////////////////
        _.each(classes, function (item) {

            /////////////////////////////////////////////////////////////
            // Atributos
            /////////////////////////////////////////////////////////////

            let yaml = {
                description: item.comment,
                columns: {},
                relations: {},
                indexes: {},
                primaryKey: []
            };

            _.each(item.attribute, function (attr, name) {


                let re = /NOT NULL/;

                let notNull = re.test(attr.value);

                let def = attr.value.replace(re, '').trim();

                // Se visibilidade for igual a 2 (ou seja protected no dia), então é chave primária
                if (attr.visibility == 2) {
                    yaml.primaryKey.push(name);
                }


                yaml.columns[name] = {
                    type: attr.type,
                    notNull: notNull,
                    default: def,
                    comment: attr.comment
                }

            });

            /////////////////////////////////////////////////////////////
            // Indices
            /////////////////////////////////////////////////////////////

            _.each(item.operation, function (attr, name) {

                yaml.indexes[name] = {
                    type: attr.type,
                    columns: attr.parameters
                }

            });

            /////////////////////////////////////////////////////////////
            // Grava
            /////////////////////////////////////////////////////////////

            yamlFile[item.name] = yaml;
            idReference[item.id] = yaml;
            idReferenceName[item.id] = item.name;


        });

        /////////////////////////////////////////////////////////////
        // Refêrencia
        /////////////////////////////////////////////////////////////
        _.each(relations, function (relation, relationName) {

            if (!relation.connectionA || !relation.connectionB) {
                throw new Error(`Relacionamento '${relationName}' não está conectado corretamente a uma entidade!`);
            }

            let localTable = idReference[relation.connectionA];
            let remoteTable = idReference[relation.connectionB];

            let referencaTableNameA = idReferenceName[relation.connectionA];
            let referencaTableNameB = idReferenceName[relation.connectionB];

            if (!localTable.columns[relation.sideA]) {
                throw new Error(`Relacionamento '${relationName}' referencia a coluna '${relation.sideA}', porém a coluna não existe na tabela '${referencaTableNameA}'!`);
            }


            if (localTable.columns[relation.sideA].type !== 'PRIMARY') {
                throw new Error(`Relacionamento '${relationName}' referencia a coluna '${relation.sideA}', na tabela '${referencaTableNameA}'. Está coluna deve ser do tipo PRIMARY!`);
            }

            if (!remoteTable.columns[relation.sideB]) {
                throw new Error(`Relacionamento '${relationName}' referencia a coluna '${relation.sideB}', porém a coluna não existe na tabela '${referencaTableNameB}'!`);
            }

            if (remoteTable.columns[relation.sideB].type !== 'PRIMARY') {
                throw new Error(`Relacionamento '${relationName}' referencia a coluna '${relation.sideB}', na tabela '${referencaTableNameB}'. Está coluna deve ser do tipo PRIMARY!`);
            }

            let onDelete = relation.multipicityA.match(/ON DELETE ([a-zA-Z]*)?/);
            let onUpdate = relation.multipicityA.match(/ON UPDATE ([a-zA-Z]*)?/);

            if (relation.multipicityB) {
                throw new Error(`No relacionamento '${relationName}' ON DELETE e ON UPDATE devem ser definidos no 'sideA'!`);
            }

            localTable.relations[relationName] = {
                foreignKey: relation.sideA,
                referenceKey: relation.sideB,
                referenceTable: referencaTableNameB,
                onDelete: onDelete ? onDelete[1] : onDelete,
                onUpdate: onUpdate ? onUpdate[1] : onUpdate
            };


        });


        ////////////////////////////////////////////////////////////////////////
        // GRAVA ARQUIVO
        ////////////////////////////////////////////////////////////////////////

        _.each(yamlFile, (yamlData, fileName) => {

            let nameFile = path.join(this.output, fileName + '.yaml');
            let content = yaml.safeDump(yamlData);


            fs.writeFileAsync(nameFile, content)
                .then(() => console.log(`Arquivo '${nameFile}' criado com sucesso!`));


        });


    }
}


module.exports = YamlSql;