/*
    This is the implementation for xml encryption OT type.

    Since the server has no keys to decrypt the document it is only
    possible to add, delete or replace entire blocks.

    xml-enc is only block (element) based and it's not possible to delete,
    modify or add any data within an xml element!

    pos = block position within the xml document
    {p: 0, op: a, data: xmlElement}
    {p: 0, op: d}
    {p: 0, op: r, data: xmlElement}
 */

var xmlDom = require('xmldom');
var xmlParser = new xmlDom.DOMParser();
var xmlSerializer = new xmlDom.XMLSerializer();
import xmlOp from './xmlOp';

module.exports = {
    name: 'xml-enc',
    uri: 'http://sharejs.org/types/xml-enc',

    create: function (initial) {
        if(initial == null){
            initial = '<root></root>'
        }
        var xmlDoc = xmlParser.parseFromString(initial, "application/xml");
        console.log(xmlSerializer.serializeToString(xmlDoc));

        return xmlSerializer.serializeToString(xmlDoc);
    },

    apply: function (snapshot, op) {
        if(!Array.isArray(op)) throw new Error('Op must be an array!');
        var xmlDoc = xmlParser.parseFromString(snapshot, "application/xml");
        var documentElement = xmlDoc.documentElement.getElementsByTagName("document").item(0);
        for(var i = 0; i < op.length; i++){
            var currentOp = op[i];
            switch (currentOp.op){
                case 'a':
                    addBlock(documentElement, currentOp.p, currentOp.data);
                    break;
                case 'd':
                    deleteBlock(documentElement, currentOp.p);
                    break;
                case "r":
                    replaceBlock(documentElement, currentOp.p, currentOp.data);
                    break;
            }
        }
        return xmlSerializer.serializeToString(xmlDoc);
    },

    transform: function (op1, op2, side) {
        if(side != 'left' && side != 'right'){
            throw new Error('Side value: ' + side + ' is incorrect. Side must be "left" or "right"!');
        }

        checkOp(op1);
        checkOp(op2);

        checkTransformationCompatibility(op1, op2);

        var executedOp = null;
        var pendingOp = null;
        var offset = 0;

        if(side === 'right'){
            executedOp = new xmlOp(op2);
            pendingOp = new xmlOp(op1);
        }else{
            executedOp = new xmlOp(op1);
            pendingOp = new xmlOp(op2);
        }

        var opResult = [];

        while(pendingOp.hasNext()){
            if(pendingOp.pos() < executedOp.pos() && offset == 0){
                opResult.push(pendingOp.next());
            }else if(pendingOp.pos() > executedOp.pos()){
                offset = calculateOffset(executedOp, pendingOp, offset);
            }else {
                var newOp = adjustOp(pendingOp.next(), offset);
                opResult.push(newOp);
            }
        }
    }
    // compose: function () {
    //     console.log('compose');
    // }
    // //TODO add compose function (optional)
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
    if(pos == xmlDoc.childNodes.length)
        xmlDoc.appendChild(xmlElement);
    else
        xmlDoc.insertBefore(xmlElement, xmlDoc.childNodes[pos]);
};

/**
 * Deletes the pos at the given position
 * @param xmlDoc - <document> part of the entire xml document
 * @param pos - position where the data shall be deleted
 */
var deleteBlock = function (xmlDoc, pos) {
    if(xmlDoc.childNodes.length <= pos){
        throw new Error("Block position is out of range!");
    }

    var x = xmlDoc.getElementsByTagName('block')[0];
    x.parentNode.removeChild(x);
};

/**
 * Replaces the data at the given position.
 * @param xmlDoc - <document> part of the entire xml document
 * @param pos - position where the data shall be replaces
 * @param data- xml string of one block
 */
var replaceBlock = function (xmlDoc, pos, data) {
    if(xmlDoc.childNodes.length <= pos){
        throw new Error("Block position is out of range!");
    }

    var xmlElement = xmlParser.parseFromString(data, "application/xml").getElementById(0);
    var x = xmlDoc.childNodes[pos];
    x.parentNode.replaceChild(xmlElement,x);
};

/**
 * Verifies if the two input blocks can be transformed.
 * Changes on the same block cannot be executed. The input blocks must be sorted by position.
 * @param op1 op input
 * @param op2 op input
 */
var checkTransformationCompatibility = function(op1, op2){
    var xmlop1 = new xmlOp(op1);
    var xmlop2 = new xmlOp(op2);
    while(xmlop1.hasNext() && xmlop2.hasNext()){
        if(xmlop1.pos() === xmlop2.pos()){
            throw new Error("Two operations has been executed on the same block. " +
                "Operations can only be executed on two different blocks!")
            break;
        }
        if(xmlop1.pos < xmlop2.pos){
            xmlop1.next();
        }else{
            xmlop2.next();
        }
    }
};

/**
 * Calculates the offset of the given operation. This is necessary to
 * change the pending op's position to ensure that every document is
 * the same after the merging process.
 * @param executedOp operation that already has been executed
 * @param pendingOp operation that is still pending
 * @param offset current offset
 * @returns {*} new offset
 */
var calculateOffset = function (executedOp, pendingOp, offset){
    while(executedOp.hasNext() && executedOp.pos() < pendingOp.pos() ){
        if(executedOp.operation() === 'd'){
            console.log('delete detected!');
            offset--;
        }else if (executedOp.operation() === 'a'){
            console.log('inserted');
            offset++;
        }
        executedOp.next();
    }
    return offset;
};

/**
 * Adjusts the given operation by the given offset
 * @param op operation that shall be adjusted
 * @param offset of the block position
 * @returns {*} new operation with the new block position
 */
var adjustOp = function (op, offset) {
    var result = clone(op);
    result.p += offset;
    return result
};

/**
 * Creates a op clone of the given op
 * @param op that shall be cloned (deep copy)
 * @returns {op} deep copy of the given op
 */
var clone = function (op) {
    return JSON.parse(JSON.stringify(op));
}

var checkOp = function(op){

};