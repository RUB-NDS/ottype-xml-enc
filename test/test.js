'use strict'

var xmlEncType = require('../lib/type');
var assert = require('assert');

describe('fuzzer xmlenc', function () {
    describe('create document', function () {
        it('should return xml document', function () {
            xmlEncType.create('<root></root>');
        });
    });

    describe('apply data to the document', function () {
       it('should apply data to the document', function () {
           var doc = xmlEncType.create('<root><crypto></crypto><document></document></root>');
           doc = xmlEncType.apply(doc, [{pos: 0, op: 'a', data: '<data len="29">This is my block</data>'}]);
           doc = xmlEncType.apply(doc, [{pos: 1, op: 'a', data: '<data>Block 2</data>'}]);
           doc = xmlEncType.apply(doc, [{pos: 2, op: 'a', data: '<data>Block 3</data>'}]);
           doc = xmlEncType.apply(doc, [{pos: 2, op: 'a', data: '<data>between 2 - 3 </data>'}]);
           doc = xmlEncType.apply(doc, [{pos: 0, op: 'd', data: '<data>This is my block</data>'}]);
           doc = xmlEncType.apply(doc, [{pos: 0, op: 'r', data: '<data>This is my block</data>'}]);
       })
    });


});