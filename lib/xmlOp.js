
export default class XmlOp{
    constructor(op){
        this.op = op;
        this.currentIndex = 0;
    }

    next () {
        if(this.currentIndex < this.op.length){
            return this.op[this.currentIndex++];
        }
        return null;
    }

    hasNext() {
        if (this.currentIndex < this.op.length){
            return true;
        }
        return false;
    }

    pos(){
        if(this.currentIndex >= this.op.length){
            return Infinity;
        }else{
            return this.op[this.currentIndex].p;
        }
    }

    operation(){
        return this.op[this.currentIndex].op;
    }
}