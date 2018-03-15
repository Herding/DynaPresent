var dynaOfSelction = {
	COLOR_OF_ORIGIN: '#beeb9f',
	COLOR_OF_MIN: '#00a388',
	COLOR_OF_EXCHANGE: '#00a388',
	COLOR_OF_COMPARE: '#fec515',
	COLOR_OF_SORTED: '#e8670c',

	widthOfSVG: 1000,
    widthOfElement: 70,
    baseline: 250,
    gap: 6,
    current: 0,
    animInterval: null,
    transitionTime: 1000,

    location: function (capacity, locs, elems, MaxOne) {
        var half = capacity >> 1,
            halfWidthOfSVG = this.widthOfSVG / 2;
            halfOfElement = this.widthOfElement / 2,
            halfOfGap = this.gap / 2,
            totalWidth = this.widthOfElement + this.gap
            locsOfX = new Array(capacity)
            locsOfY = new Array(capacity);

        if(capacity % 2) locsOfX[0] = halfWidthOfSVG - halfOfElement - totalWidth * half;
        else locsOfX[0] = halfWidthOfSVG + halfOfGap - totalWidth * half;
        
        for (var i = 1; i < capacity; ++i)
            locsOfX[i] = locsOfX[i - 1] + totalWidth;

        for (var i = 0; i < capacity; ++i)
    		locsOfY[i] = this.baseline - this.baseline * (elems[i] / MaxOne);

    	for (var i = 0; i < capacity; ++i)
    		locs[i] = new Location(locsOfX[i], locsOfY[i]);
    },

    drawErrors: function(cont) {
        var svg = document.getElementById('dynaContent');
        while (svg.lastChild) svg.removeChild(svg.lastChild);
        svg.appendChild(this.htmlAddMark(cont));
    },

    drawCurrentState: function(state) {
        var svg = document.getElementById('dynaContent');
        while (svg.lastChild) svg.removeChild(svg.lastChild);

        var len = state.location.length;
        for (var i = 0; i < len; ++i) {
            var index = i;
            var loc = state.location[index];
            var color = state.color[index];
            var content = state.content[index];
            svg.appendChild(this.htmlAddElem(loc, color, content));
        }
        svg = document.getElementById('dynaMark');
        while (svg.lastChild) svg.removeChild(svg.lastChild);
        svg.appendChild(this.htmlAddMark(state.mark));
    },

    htmlAddElem: function(loc, color, content) {
        var halfOfElement = this.widthOfElement >> 1,
        	fontSize = 16,
            XML = 'http://www.w3.org/2000/svg';

        var g = document.createElementNS(XML, 'g');
        g.setAttribute('transform', 'translate(' + loc.x + ','+ loc.y + ')');
        
        var rect = document.createElementNS(XML, 'rect');
        rect.setAttribute('width', this.widthOfElement);
        rect.setAttribute('height', this.baseline - loc.y);
        rect.setAttribute('style', 'fill:' + color);

        var text = document.createElementNS(XML, 'text');
        text.setAttribute('dy', fontSize);
        text.setAttribute('x', halfOfElement);
        text.setAttribute('y', this.baseline - loc.y);
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

    stateOfOrigin: function(capacity, locs, elems) {
        var state = new State(capacity);

        for (var i = 0; i < capacity; ++i) {
        	state.setLocation(i, locs[i]);
        	state.setContent(i, elems[i]);
        	state.setColor(i, this.COLOR_OF_ORIGIN);
        }

        dynamic.stateList.push(state);
    },

    stateOfMin: function(prio, late, elem) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();

    	if (prio != null) state.setColor(prio, this.COLOR_OF_ORIGIN);
    	state.setColor(late, this.COLOR_OF_MIN);
    	state.setMark('当前最小值为' + elem);

    	dynamic.stateList.push(state);
    },

    stateOfCompare: function(index, indexOfMin, elem, min) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	if (index - 1 > indexOfMin)
    		state.setColor(index - 1, this.COLOR_OF_ORIGIN);
    	state.setColor(index, this.COLOR_OF_COMPARE);
    	state.setMark(elem + '与' + min + '比较');
    	dynamic.stateList.push(state);
    },

    stateOfSorted: function(i, min, locOfI, locOfMin, elemOfI, elemOfMin) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	state.setColor(min, this.COLOR_OF_ORIGIN);
    	state.setColor(i, this.COLOR_OF_SORTED);
    	state.setLocation(min, locOfMin);
    	state.setLocation(i, locOfI);
    	state.setContent(i, elemOfI);
    	state.setContent(min, elemOfMin);
    	dynamic.stateList.push(state);
    },

    stateOfExch: function(i, min, capacity) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	state.setColor(i, this.COLOR_OF_EXCHANGE);
    	state.setColor(min, this.COLOR_OF_EXCHANGE);
    	if (i != capacity - 1)
	    	state.setColor(capacity - 1, this.COLOR_OF_ORIGIN);
    	state.setMark('将最小值放入正确的位置');
    	dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}
var selection = {
	MaxOfElement: 10,
	Max: 0,
	MaxOne: -1,
	N: 0,
	elems: null,
	locs: null,

	create: function(capacity) {
		guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;

        this.elems = new Array(capacity);
        this.locs = new Array(capacity);
        this.Max = capacity;
        this.N = 0;

        dynamic.create();
	},

	present: function() {
        if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfSelction.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfSelction.animInterval);
	    	dynaOfSelction.animInterval = setInterval( function() {
	    	dynaOfSelction.drawCurrentState(dynamic.stateList[dynaOfSelction.current]);
	    	if (dynaOfSelction.current < len - 1)
	    		dynaOfSelction.current++;
	    	else
	    		clearInterval(dynaOfSelction.animInterval);
	      }, dynaOfSelction.transitionTime);

		}
	},

	size: function() { return this.N; },

	putVal: function(elem) {
        if (!guard.isSafe) return ;
        guard.isDigit(elem);
        
		if (this.size() == this.Max) {
			dynaOfSelction.stateOfError('元素个数已经达所定义容量');
			return ;
		}
		this.elems[this.N++] = elem;
		if (this.MaxOne < elem)
			this.MaxOne = elem;
	},

	exch: function(i, j) {
		var tmp = this.elems[i];
		this.elems[i] = this.elems[j];
		this.elems[j] = tmp;
	},
	
	sort: function() {
		var len = this.size();
		dynaOfSelction.location(this.size(), this.locs, this.elems, this.MaxOne);
		dynaOfSelction.stateOfOrigin(this.size(), this.locs, this.elems);
		for (var i = 0; i < len; ++i) {
			var min = i;
			dynaOfSelction.stateOfMin(null, min, this.elems[min]);
			for (var j = i + 1; j < len; ++j) {
				dynaOfSelction.stateOfCompare(j, min, this.elems[j], this.elems[min]);
				if (this.elems[j] < this.elems[min]) {
					dynaOfSelction.stateOfMin(min, j, this.elems[j]);
					min = j;
				}
			}
			dynaOfSelction.stateOfExch(i, min, this.size());
			this.exch(i, min);
			dynaOfSelction.location(this.size(), this.locs, this.elems, this.MaxOne);
			dynaOfSelction.stateOfSorted(i, min, this.locs[i], this.locs[min], this.elems[i], this.elems[min]);
		}
		dynaOfSelction.stateOfOrigin(this.size(), this.locs, this.elems);
	}
}