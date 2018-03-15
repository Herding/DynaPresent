var dynaOfMerge = {
	COLOR_OF_ORIGIN: '#07FFF8',
	COLOR_OF_LEFT: '#05B2E8',
	COLOR_OF_RIGHT: '#0582FF',
	COLOR_OF_SORT: '#00E8B5',
	COLOR_OF_SORTED: '#FFAAD1',

	widthOfSVG: 1000,
    widthOfElement: 50,
    baseOver: 200,
    baseDown: 420,
    gap: 6,
    current: 0,
    animInterval: null,
    transitionTime: 2000,

    location: function (capacity, locs, elems, MaxOne) {
        var half = capacity >> 1,
            halfWidthOfSVG = this.widthOfSVG / 2,
            halfOfElement = this.widthOfElement / 2,
            halfOfGap = this.gap / 2,
            totalWidth = this.widthOfElement + this.gap,
            locsOfX = new Array(capacity),
            locsOfY = new Array(capacity);

        if(capacity % 2) locsOfX[0] = halfWidthOfSVG - halfOfElement - totalWidth * half;
        else locsOfX[0] = halfWidthOfSVG + halfOfGap - totalWidth * half;
        
        for (var i = 1; i < capacity; ++i)
            locsOfX[i] = locsOfX[i - 1] + totalWidth;

        for (var i = 0; i < capacity; ++i)
    		locsOfY[i] = this.baseOver - this.baseOver * (elems[i] / MaxOne);

    	for (var i = 0; i < capacity; ++i) {
    		locs[i] = new Location(locsOfX[i], locsOfY[i]);
    	}
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
        if (loc.y > 200)
        	rect.setAttribute('height', this.baseDown - loc.y);
        else
        	rect.setAttribute('height', this.baseOver - loc.y);
        rect.setAttribute('style', 'fill:' + color);

        var text = document.createElementNS(XML, 'text');
        text.setAttribute('dy', fontSize);
        text.setAttribute('x', halfOfElement);
        if (loc.y > 200)
        	text.setAttribute('y', this.baseDown - loc.y);
        else
        	text.setAttribute('y', this.baseOver - loc.y);
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

    stateOfOrigin: function(capacity, locs, elems, sz) {
    	var state = new State(capacity);

    	for (var i = 0; i < capacity; ++i) {
        	state.setLocation(i, locs[i]);
        	state.setContent(i, elems[i]);
        	state.setColor(i, this.COLOR_OF_ORIGIN);
        }
        if (sz != null) state.setMark('每组'+ sz + '个元素进行归并');
        dynamic.stateList.push(state);
    },

    stateOfMerge: function(lo, mid, hi, capacity) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var len = mid - lo + 1;
    	for (var i = 0; i < capacity; ++i) {
    		if (i < lo || i > hi) state.setColor(i, this.COLOR_OF_ORIGIN);
    		else if (i >= lo && i <= mid) state.setColor(i, this.COLOR_OF_LEFT);
    		else state.setColor(i, this.COLOR_OF_RIGHT);
    	}
    	dynamic.stateList.push(state);
    },

    stateOfSort: function(index, len, locOfX, locOfY, elem) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var tmp = new Location(locOfX, locOfY + this.baseDown - this.baseOver)
    	state.setLocation(index, tmp);
    	state.setColor(index, this.COLOR_OF_SORT);
    	state.setMark('将' + elem + '放入辅助数组中');
    	dynamic.stateList.push(state);
    },

    stateOfSorted: function(capacity, locs, elems, lo, hi) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < capacity; ++i) {
    		if (lo <= i && i <= hi) {
    			state.setLocation(i, locs[i]);
    			state.setColor(i, this.COLOR_OF_SORTED);
    			state.setContent(i, elems[i]);
    		}
    	}
    	state.setMark('两组归并成功，并复制到原数列');
    	dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}
var merge = {
	MaxOfElement: 15,
	Max: 0,
	MaxOne: -1,
	N: 0,
	elems: null,
	locs: null,
	aux: null,

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
            dynaOfBFS.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfMerge.animInterval);
	    	dynaOfMerge.animInterval = setInterval( function() {

		    	dynaOfMerge.drawCurrentState(dynamic.stateList[dynaOfMerge.current]);
		    	if (dynaOfMerge.current < len - 1)
		    		dynaOfMerge.current++;
		    	else
		    		clearInterval(dynaOfMerge.animInterval);
	        }, dynaOfMerge.transitionTime);

		}
	},

	size: function() { return this.N; },

	putVal: function(elem) {
        if (!guard.isSafe) return ;
        guard.isDigit(elem);
        
		if (this.size() == this.Max) {
			dynaOfMerge.stateOfError('元素个数已经达所定义容量');
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

	merge: function(lo, mid, hi) {
		var copyOfMid = mid + 1,
		    copyOfLo = lo,
		    len = 0;
		while (copyOfLo <= mid && copyOfMid <= hi) {
			if (this.elems[copyOfLo] < this.elems[copyOfMid]) {
				dynaOfMerge.stateOfSort(copyOfLo, len, this.locs[len].x, this.locs[copyOfLo].y, this.elems[copyOfLo]);
				this.aux[len++] = this.elems[copyOfLo++];
			}
			else {
				dynaOfMerge.stateOfSort(copyOfMid, len, this.locs[len].x, this.locs[copyOfMid].y, this.elems[copyOfMid]);
				this.aux[len++] = this.elems[copyOfMid++];
			}
		}

		while (copyOfLo <= mid) {
			dynaOfMerge.stateOfSort(copyOfLo, len, this.locs[len].x, this.locs[copyOfLo].y, this.elems[copyOfLo]);
			this.aux[len++] = this.elems[copyOfLo++];
		}
		
		while (copyOfMid <= hi) {
			dynaOfMerge.stateOfSort(copyOfMid, len, this.locs[len].x, this.locs[copyOfMid].y, this.elems[copyOfMid]);
			this.aux[len++] = this.elems[copyOfMid++];
		}

		for (var i = 0; i < len; ++i) {
			this.elems[lo + i] = this.aux[i];
		}
		dynaOfMerge.location(this.size(), this.locs, this.elems, this.MaxOne);
		dynaOfMerge.stateOfSorted(this.size(), this.locs, this.elems, lo, hi);
	},

	sort: function() {
		var len = this.size();
		this.aux = new Array(len);
		dynaOfMerge.location(this.size(), this.locs, this.elems, this.MaxOne);

		for (var sz = 1; sz < len; sz = sz + sz) {
			dynaOfMerge.stateOfOrigin(this.size(), this.locs, this.elems, sz);
			for (var lo = 0; lo < len - sz; lo += sz + sz) {
				dynaOfMerge.stateOfMerge(lo, lo + sz - 1, Math.min(lo + sz + sz - 1, len - 1), len);
				this.merge(lo, lo + sz - 1, Math.min(lo + sz + sz - 1, len - 1));
			}
		}
		dynaOfMerge.stateOfOrigin(this.size(), this.locs, this.elems, null);
	}
}