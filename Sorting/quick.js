var dynaOfQuick = {
	COLOR_OF_ORIGIN: '#beeb9f',
	COLOR_OF_SELECT: '#00a388',
	COLOR_OF_SORTED: '#e8670c',
	COLOR_OF_EXCHANGE: '#fec515',

	widthOfSVG: 1000,
    widthOfElement: 50,
    baseline: 250,
    gap: 6,
    current: 0,
    animInterval: null,
    transitionTime: 2000,

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

    stateOfSelect: function(index, elem, isSorted) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var len = state.location.length;

    	for (var i = 0; i < len; ++i) {
    		if (isSorted[i])
    			state.setColor(i, this.COLOR_OF_SORTED);
    		else
    			state.setColor(i, this.COLOR_OF_ORIGIN);
    	}

    	state.setColor(index, this.COLOR_OF_SELECT);
    	state.setMark(elem + '作为基准');
    	dynamic.stateList.push(state);
    },

    stateOfCompare: function(lo, i, elemOfLo, elemOfI, isSorted) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var len = state.location.length;

    	for (var k = 0; k < len; ++k) {
    		if (isSorted[k])
    			state.setColor(k, this.COLOR_OF_SORTED);
    		else if (k != lo && k != i)
    			state.setColor(k, this.COLOR_OF_ORIGIN);
    	}

    	state.setColor(i, this.COLOR_OF_SELECT);
    	if (elemOfLo < elemOfI)
    		state.setMark(elemOfLo + '小于' + elemOfI);
    	else if (elemOfLo > elemOfI)
    		state.setMark(elemOfLo + '大于' + elemOfI);
    	else
    		state.setMark(elemOfLo + '等于' + elemOfI);
    	dynamic.stateList.push(state);
    },

    stateOfExch: function(lo, i, j, locs, elems, capacity, isSorted) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var len = state.location.length;

    	for (var k = 0; k < len; ++k) {
    		if (isSorted[k])
    			state.setColor(k, this.COLOR_OF_SORTED);
    		else if (k != i && k != j)
    			state.setColor(k, this.COLOR_OF_ORIGIN);
    		
    		state.setLocation(k, locs[k]);
    		state.setContent(k, elems[k]);
    	}

    	if (lo != null)
    		state.setColor(lo, this.COLOR_OF_SELECT);
    	state.setColor(i, this.COLOR_OF_EXCHANGE);
    	state.setColor(j, this.COLOR_OF_EXCHANGE);
    	state.setMark(elems[i] + '与' + elems[j] + '两者交换');
    	dynamic.stateList.push(state);
    },

    stateOfSorted: function(index, elem, isSorted) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var len = state.location.length;

    	for (var k = 0; k < len; ++k) {
    		if (isSorted[k])
    			state.setColor(k, this.COLOR_OF_SORTED);
    		else if (k != index)
    			state.setColor(k, this.COLOR_OF_ORIGIN);
    	}

    	state.setColor(index, this.COLOR_OF_SORTED);
    	state.setMark(elem + '的一侧不大于它，另一侧不小于它，' + elem + '排序完成');
    	dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}
var quick = {
	MaxOfElement: 15,
	Max: 0,
	MaxOne: -1,
	N: 0,
	elems: null,
	locs: null,
	isSorted: null,

	create: function(capacity) {
		guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;

        this.elems = new Array(capacity);
        this.locs = new Array(capacity);
        this.isSorted = new Array(capacity);
        this.Max = capacity;
        this.N = 0;

        dynamic.create();
	},
	
	present: function() {
        if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfQuick.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfQuick.animInterval);
	    	dynaOfQuick.animInterval = setInterval( function() {

		    	dynaOfQuick.drawCurrentState(dynamic.stateList[dynaOfQuick.current]);
		    	if (dynaOfQuick.current < len - 1)
		    		dynaOfQuick.current++;
		    	else
		    		clearInterval(dynaOfQuick.animInterval);
	        }, dynaOfQuick.transitionTime);

		}
	},

	size: function() { return this.N; },

	putVal: function(elem) {
        if (!guard.isSafe) return ;
        guard.isDigit(elem);
        
		if (this.size() == this.Max) {
			dynaOfQuick.stateOfError('元素个数已经达所定义容量');
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

	partition: function(lo, hi) {
		var i = lo, j = hi + 1;
		var v = this.elems[lo];
		dynaOfQuick.stateOfSelect(lo, v, this.isSorted);
		while (true) {
			while (this.elems[++i] < v) {
				dynaOfQuick.stateOfCompare(lo, i, v, this.elems[i], this.isSorted);
				if (i == hi) break;
			}
			if (i < j && i < hi)
				dynaOfQuick.stateOfCompare(lo, i, v, this.elems[i], this.isSorted);
			while (v < this.elems[--j]) {
				dynaOfQuick.stateOfCompare(lo, j, v, this.elems[j], this.isSorted);
				if (j == lo) break;
			}
			if (j > i && j > lo)
				dynaOfQuick.stateOfCompare(lo, j, v, this.elems[j], this.isSorted);
			if (i >= j) break;
			this.exch(i, j);
			dynaOfQuick.location(this.size(), this.locs, this.elems, this.MaxOne);
			dynaOfQuick.stateOfExch(lo, i, j, this.locs, this.elems, this.size(), this.isSorted);
		}
		this.exch(lo, j);
		dynaOfQuick.location(this.size(), this.locs, this.elems, this.MaxOne);
		dynaOfQuick.stateOfExch(null, lo, j, this.locs, this.elems, this.size(), this.isSorted);
		dynaOfQuick.stateOfSorted(j, this.elems[j], this.isSorted);
		return j;
	},

	quicksort: function(lo, hi) {
		if (hi <= lo) {
			if (hi == lo) {
				this.isSorted[lo] = true;
				dynaOfQuick.stateOfSorted(lo, this.elems[lo], this.isSorted);
			}
			return ;
		}
		var j = this.partition(lo, hi);
		this.isSorted[j] = true;
		this.quicksort(lo, j - 1);
		this.quicksort(j + 1, hi);
	},

	sort: function() {
		for (var i = 0; i < this.size(); ++i)
			this.isSorted[i] = false;

		dynaOfQuick.location(this.size(), this.locs, this.elems, this.MaxOne);
		dynaOfQuick.stateOfOrigin(this.size(), this.locs, this.elems);
		this.quicksort(0, this.size() - 1);
		dynaOfQuick.stateOfOrigin(this.size(), this.locs, this.elems);
	}
}