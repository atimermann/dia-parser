/**
 * **Created on 04/07/16**
 *
 * parser/umlAssociation.js
 * @author André Timermann <andre@andregustvo.org>
 *
 */
'use strict';

const _ = require('lodash');
const inspect = require('eyes').inspector({maxLength: false});
const Parser = require('../lib/parser');

class UmlAssociation extends Parser {


    parse(attributes, connections) {

        let self = this;


        return {
            name: self.find('name', attributes),
            sideA: self.find('role_a', attributes),
            sideB: self.find('role_b', attributes),
            multipicityA: self.find('multipicity_a', attributes),
            multipicityB: self.find('multipicity_b', attributes),
            connectionA: connections[0]['dia:connection'][0] ? connections[0]['dia:connection'][0]['$'].to : undefined,
            connectionB: connections[0]['dia:connection'][1] ? connections[0]['dia:connection'][1]['$'].to : undefined
        };


    }

}


module.exports = UmlAssociation;