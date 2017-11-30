/*
    This is the implementation for xml encryption OT type.

    Since the server has no keys to decrypt the document it is only
    possible to add, delete or replace entire blocks.

    xml-enc is only block (element) based and it's not possible to delete,
    modify or add any data within an xml element!

    pos = block position within the xml document
    {pos: 0, op: a, data: xmlElement}
    {pos: 0, op: d}
    {pos: 0, op: r, data: xmlElement}
 */

var xmlDom = require('xmldom');
var xmlParser = new xmlDom.DOMParser();
var xmlSerializer = new xmlDom.XMLSerializer();

module.exports = {
    name: 'xml-enc',
    uri: 'http://sharejs.org/types/xml-enc',

    create: function (initial) {
        var xmlDoc = xmlParser.parseFromString(initial, "application/xml");
        console.log(xmlSerializer.serializeToString(xmlDoc));

        return xmlSerializer.serializeToString(xmlDoc);
    },

    apply: function (snapshot, op) {
        if(!Array.isArray(op)) throw new Error('Op musst be an array!');
        var xmlDoc = xmlParser.parseFromString(snapshot, "application/xml");
        var documentElement = xmlDoc.documentElement.getElementsByTagName("document").item(0);
        for(var i = 0; i < op.length; i++){
            var currentOp = op[i];
            switch (currentOp.op){
                case 'a':
                    addBlock(documentElement, currentOp.pos, currentOp.data);
                    console.log("Add something!");
                    break;
                case 'd':
                    deleteBlock(documentElement, currentOp.pos);
                    console.log("delete something!");
                    break;
                case "r":
                    replaceBlock(documentElement, currentOp.pos, currentOp.data);
                    console.log("replace something!");
                    break;
            }
        }
        return xmlSerializer.serializeToString(xmlDoc);
    },

    transform: function (op1, op2, side) {

        return op1;
    },

    compose: function (op1, op2) {
        return op;
    }
};

/**
 * Adds the block to the xmlDocument
 * @param xmlDoc - <document> part of the entire xml document
 * @param pos - position where the data shall be inserted
 * @param data - xml string of one block
 */
var addBlock = function(xmlDoc, pos, data){

    if(xmlDoc.childNodes.length < pos){
        throw new Error("Block position is out of range!");
    }

    var xmlElement = xmlParser.parseFromString(data, "application/xml").getElementById(0);
    xmlDoc.insertBefore(xmlElement, xmlDoc.childNodes[pos]);
};

/**
 *
 * @param xmlDoc - <document> part of the entire xml document
 * @param pos - position where the data shall be deleted
 */
var deleteBlock = function (xmlDoc, pos) {
    if(xmlDoc.childNodes.length <= pos){
        throw new Error("Block position is out of range!");
    }

    xmlDoc.removeChild(xmlDoc.childNodes[pos]);
};

/**
 *
 * @param xmlDoc - <document> part of the entire xml document
 * @param pos - position where the data shall be replaces
 * @param data- xml string of one block
 */
var replaceBlock = function (xmlDoc, pos, data) {
    if(xmlDoc.childNodes.length <= pos){
        throw new Error("Block position is out of range!");
    }

    var xmlElement = xmlParser.parseFromString(data, "application/xml").getElementById(0);
    xmlDoc.replaceChild(xmlElement, xmlDoc.childNodes[pos]);
};
