var dynaOfHeap = {
	COLOR_OF_ORIGIN: '#beeb9f',
	COLOR_OF_SELECT: '#00a388',
	COLOR_OF_EXCHANGE: '#00a388',
	COLOR_OF_COMPARE: '#fec515',
	COLOR_OF_SORTED: '#e8670c',

	widthOfSVG: 1000,
    widthOfElement: 36,
    baseline: 54,
    gapOfX: 6,
    capacity: 32,
    centerOfTree: 500,
    gapOfY: 80,
    current: 0,
    animInterval: null,
    transitionTime: 2000,

    location: function(capacity, locsOfHeap, locsOfList) {
    	var centers = new Array(this.capacity),
    		locsOfY = new Array(this.capacity),
    		half = (capacity - 1) >> 1,
    		halfWidthOfSVG = this.widthOfSVG / 2,
            halfOfElement = this.widthOfElement / 2,
            halfOfGap = this.gapOfX / 2,
            totalWidth = this.widthOfElement + this.gapOfX;

    	locsOfY[1] = this.gapOfY;
    	centers[1] = this.centerOfTree;
    	for (var level = 1, i = 2; level < 5; ++level) {
    		var levelFirst = (1 << level),
    			levelNodes = (1 << level),
    			parent = Math.floor(levelFirst >> 1);
    		locsOfY[i] = locsOfY[parent] + this.gapOfY;
    		centers[i++] = centers[parent] / 2;
    		for (var j = 1; j < levelNodes; ++j, ++i) {
    			locsOfY[i] = locsOfY[parent] + this.gapOfY;
    			centers[i] = centers[i - 1] + centers[parent];
    		}
    	}

    	for (var i = 1; i < this.capacity; ++i) {
    		var X = centers[i],
    			Y = locsOfY[i];
    		locsOfHeap[i] = new Location(X, Y);
    	}

    	if(capacity % 2) locsOfList[1] = halfWidthOfSVG - halfOfElement - totalWidth * half;
        else locsOfList[1] = halfWidthOfSVG + halfOfGap - totalWidth * half;
        
        for (var i = 2; i < capacity; ++i)
            locsOfList[i] = locsOfList[i - 1] + totalWidth;
    },

    drawErrors: function(cont) {
        var svg = document.getElementById('dynaContent');
        while (svg.lastChild) svg.removeChild(svg.lastChild);
        svg.appendChild(this.htmlAddMark(cont));
    },

    drawCurrentState: function(state) {
        var XML = 'http://www.w3.org/2000/svg',
            R = 18,
            widthOfOutStroke = 3,
            gOfEdge = document.createElementNS(XML, 'g'),
            gOfCircle = document.createElementNS(XML, 'g'),
            gOfTxt = document.createElementNS(XML, 'g');

        var svg = document.getElementById('dynaContent');
        while (svg.lastChild) svg.removeChild(svg.lastChild);

        var len = state.content[0],
            capa = state.location.length;
        for (var i = len; i > 0; --i) {
            var loc = state.location[i];
            var color = state.color[i];
            var content = state.content[i];
            if (i > 1) {
                var locOfParent = state.location[Math.floor(i / 2)];
                gOfEdge.appendChild(this.htmlAddEdge(loc, locOfParent));
            }

            gOfCircle.appendChild(this.htmlAddCircle(loc, color, R, widthOfOutStroke));
            gOfTxt.appendChild(this.htmlAddTxt(loc, content));
        }

        svg.appendChild(gOfEdge);
        svg.appendChild(gOfCircle);
        svg.appendChild(gOfTxt);

        for (var i = len + 1; i < capa; ++i) {
            var loc = state.location[i];
            var color = state.color[i];
            var content = state.content[i];
            svg.appendChild(this.htmlAddElem(loc, color, content));
        }

        svg = document.getElementById('dynaMark');
        while (svg.lastChild) svg.removeChild(svg.lastChild);
        svg.appendChild(this.htmlAddMark(state.mark));
    },

    htmlAddCircle: function(loc, color, R, stroke) {
        var XML = 'http://www.w3.org/2000/svg';
        var circle = document.createElementNS(XML, 'circle');
        circle.setAttribute('cx', loc.x);
        circle.setAttribute('cy', loc.y);
        circle.setAttribute('r', R);
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', stroke);
        return circle;
    },

    htmlAddTxt: function(loc, content) {
        var fontSize = 18,
            XML = 'http://www.w3.org/2000/svg';
        var text = document.createElementNS(XML, 'text');
        text.setAttribute('x', loc.x);
        text.setAttribute('y', loc.y + fontSize / 3);
        text.setAttribute('font-size', fontSize);
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = content;
        return text;
    },

    htmlAddEdge: function(locOfChild, locOfParent) {
        var widthOfStroke = 5,
            Black = '#000000',
            loc = 'M'+locOfChild.x+', '+locOfChild.y+' L' +locOfParent.x+', '+locOfParent.y;
            XML = 'http://www.w3.org/2000/svg';
        var path = document.createElementNS(XML, 'path');
        path.setAttribute('d', loc);
        path.setAttribute('stroke', Black);
        path.setAttribute('stroke-width', widthOfStroke);
        return path;
    },

    htmlAddElem: function(loc, color, content) {
        var Y = this.baseline - this.widthOfElement;
            halfOfElement = this.widthOfElement >> 1,
        	fontSize = '.24em',
            XML = 'http://www.w3.org/2000/svg';

        var g = document.createElementNS(XML, 'g');
        g.setAttribute('transform', 'translate(' + loc + ','+ Y + ')');
        
        var rect = document.createElementNS(XML, 'rect');
        rect.setAttribute('width', this.widthOfElement);
        rect.setAttribute('height', this.widthOfElement);
        rect.setAttribute('style', 'fill:' + color);

        var text = document.createElementNS(XML, 'text');
        text.setAttribute('dy', fontSize);
        text.setAttribute('x', halfOfElement);
        text.setAttribute('y', halfOfElement);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = content;

        g.appendChild(rect);
        g.appendChild(text);
        return g;
    },

    htmlAddMark: function(mark) {
        var fontSize = 16,
            XML = 'http://www.w3.org/2000/svg',
            X = 500,
            Y = 25;
        var text = document.createElementNS(XML, 'text');
        text.setAttribute('dy', fontSize);
        text.setAttribute('x', X);
        text.setAttribute('y', Y);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = mark;

        return text;
    },

    stateOfOrigin: function(len, capacity, elems, locsOfHeap, locsOfList) {
    	var state = new State(capacity);
        state.setContent(0, len);
    	for (var i = 1; i <= len; ++i) {
    		state.setLocation(i, locsOfHeap[i]);
    		state.setColor(i, this.COLOR_OF_ORIGIN);
    		state.setContent(i, elems[i]);
    	}

    	for (var i = len + 1; i < capacity; ++i) {
    		state.setLocation(i, locsOfList[i]);
    		state.setColor(i, this.COLOR_OF_ORIGIN);
    		state.setContent(i, elems[i]);
    	}

    	dynamic.stateList.push(state);
    },

    stateOfCompare: function(parent, leftChild, rightChild, elems, capacity, len) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 1; i < capacity; ++i) {
    		state.setColor(i, this.COLOR_OF_ORIGIN);
            state.setContent(i, elems[i]);
        }

        state.setColor(parent, this.COLOR_OF_COMPARE);
        state.setMark(elems[parent] + '与下一级比较');
        if (leftChild > len) {
            dynamic.stateList.push(state);
        }
        else if (rightChild > len) {
    	   state.setColor(leftChild, this.COLOR_OF_COMPARE);
           dynamic.stateList.push(state);
        }
        else {
            state.setColor(leftChild, this.COLOR_OF_COMPARE);
            state.setColor(rightChild, this.COLOR_OF_COMPARE);
            dynamic.stateList.push(state);
        }    	
    },

    stateOfExch: function(elemOfI, elemOfJ, capacity) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy(),
            indexOfI,
            indexOfJ;

    	for (var i = 1; i <= capacity; ++i) {
            if (state.content[i] == elemOfI) {
                indexOfJ = i;
                state.setColor(i, this.COLOR_OF_EXCHANGE);
            }else if (state.content[i] == elemOfJ) {
                indexOfI = i;
                state.setColor(i, this.COLOR_OF_EXCHANGE);
            }
            else
        		state.setColor(i, this.COLOR_OF_ORIGIN);
        }

        state.content[indexOfI] = elemOfI;
        state.content[indexOfJ] = elemOfJ;

        state.setMark(elemOfI + '与' + elemOfJ + '交换');
    	dynamic.stateList.push(state);
    },

    stateOfSelect: function(index, elems, capacity) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 1; i < capacity; ++i) {
    		state.setColor(i, this.COLOR_OF_ORIGIN);
            state.setContent(i, elems[i]);
        }

    	state.setColor(index, this.COLOR_OF_SELECT);
        state.setMark(elems[index] + '作为堆顶');
    	dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}
var heap = {
	MaxOfElement: 15,
	Max: 0,
	N: 0,
	elems: null,
	locsOfHeap: null,
	locsOfList: null,

	create: function(capacity) {
		guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;

        this.elems = new Array(capacity);
        this.locsOfHeap = new Array(capacity);
        this.locsOfList = new Array(capacity);
        this.Max = capacity;
        this.N = 0;

        dynaOfHeap.location(capacity + 1, this.locsOfHeap, this.locsOfList);
        dynamic.create();
	},

	present: function() {
        if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfHeap.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfHeap.animInterval);
	    	dynaOfHeap.animInterval = setInterval( function() {

		    	dynaOfHeap.drawCurrentState(dynamic.stateList[dynaOfHeap.current]);
		    	if (dynaOfHeap.current < len - 1)
		    		dynaOfHeap.current++;
		    	else
		    		clearInterval(dynaOfHeap.animInterval);
	        }, dynaOfHeap.transitionTime);

		}
	},

	size: function() { return this.N; },

	putVal: function(elem) {
        if (!guard.isSafe) return ;
        guard.isDigit(elem);

		if (this.size() == this.Max) {
			dynaOfHeap.stateOfError('元素个数已经达所定义容量');
			return ;
		}
		this.elems[++this.N] = elem;
	},

	exch: function(i, j) {
		var tmp = this.elems[i];
		this.elems[i] = this.elems[j];
		this.elems[j] = tmp;
	},

	sink: function(k, len) {
		var copyOfK = k;
		while (copyOfK < len) {
			var leftChild = 2 * copyOfK,
			    rightChild = leftChild + 1;
			dynaOfHeap.stateOfCompare(copyOfK, leftChild, rightChild, this.elems, this.size() + 1, len);
			
            if (leftChild > len) return;

            if (rightChild > len) {
                if (this.elems[leftChild] > this.elems[copyOfK]) {
                    dynaOfHeap.stateOfExch(this.elems[copyOfK], this.elems[leftChild], this.size() + 1);
                    this.exch(leftChild, copyOfK);
                    copyOfK = leftChild;
                }
                else return;
            }
            else {
                if (this.elems[leftChild] > this.elems[rightChild]) {
                    if (this.elems[leftChild] > this.elems[copyOfK]) {
                        dynaOfHeap.stateOfExch(this.elems[copyOfK], this.elems[leftChild], this.size() + 1);
                        this.exch(leftChild, copyOfK);
                        copyOfK = leftChild;
                    }
                    else return;
                }
                else if (this.elems[rightChild] > this.elems[copyOfK]) {
                    dynaOfHeap.stateOfExch(this.elems[copyOfK], this.elems[rightChild], this.size() + 1);
                    this.exch(rightChild, copyOfK);
                    copyOfK = rightChild;
                }
                else return;
            }
		}
	},

	sort: function() {
		var len = this.size();
		dynaOfHeap.stateOfOrigin(len, this.size() + 1, this.elems, this.locsOfHeap, this.locsOfList);
		for (var k = Math.floor(len / 2); k > 0; --k) {
			dynaOfHeap.stateOfSelect(k, this.elems, this.size() + 1);
			this.sink(k, len);
		}
        dynaOfHeap.stateOfOrigin(len, this.size() + 1, this.elems, this.locsOfHeap, this.locsOfList);
		while (len > 1) {
			dynaOfHeap.stateOfExch(this.elems[1], this.elems[len], len);
			this.exch(1, len--);
            dynaOfHeap.stateOfOrigin(len, this.size() + 1, this.elems, this.locsOfHeap, this.locsOfList);
			dynaOfHeap.stateOfSelect(1, this.elems, this.size() + 1);
			this.sink(1, len);
		}
        dynaOfHeap.stateOfOrigin(0, this.size() + 1, this.elems, this.locsOfHeap, this.locsOfList);
	}
}