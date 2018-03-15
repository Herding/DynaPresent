var dynaOfShell = {
	COLOR_OF_ORIGIN: '#beeb9f',
	COLOR_OF_SELECT: '#e8670c',
	COLOR_OF_EXCHANGE: '#00a388',
	COLOR_OF_COMPARE: '#fec515',

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

    stateOfOrigin: function(capacity, locs, elems) {
    	var state = new State(capacity);

    	for (var i = 0; i < capacity; ++i) {
        	state.setLocation(i, locs[i]);
        	state.setContent(i, elems[i]);
        	state.setColor(i, this.COLOR_OF_ORIGIN);
        }
        dynamic.stateList.push(state);
    },

    stateOfSubsequent: function(index, h, locs, elems, capacity) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var tmp;

    	for (var i = 0; i < capacity; ++i) {
    		state.setLocation(i, locs[i]);
    		state.setColor(i, this.COLOR_OF_ORIGIN);
    		state.setContent(i, elems[i]);
    	}

    	for (var i = index; i >= 0; i -= h) {
    		tmp = new Location(locs[i].x, locs[i].y + this.baseDown - this.baseOver);
    		state.setLocation(i, tmp);
    	}
    	state.setMark('在间隔为' + h + '的序列中进行插入排序');
    	dynamic.stateList.push(state);
    },

    stateOfCompare: function(late, prio, locs, elems, capacity) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var tmp;

    	for (var i = 0; i < capacity; ++i) {
    		if (state.location[i].y > 200) {
    			tmp = new Location(locs[i].x, locs[i].y +  this.baseDown - this.baseOver);
	    		state.setLocation(i, tmp);
    		}
	    	else
	    		state.setLocation(i, locs[i]);
    		state.setColor(i, this.COLOR_OF_ORIGIN);
    		state.setContent(i, elems[i]);
    	}

    	state.setColor(late, this.COLOR_OF_COMPARE);
    	state.setColor(prio, this.COLOR_OF_COMPARE);
    	state.setMark(elems[late] + '与' + elems[prio] + '比较');
    	dynamic.stateList.push(state);
    },

    stateOfExch: function(late, prio) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	state.setColor(late, this.COLOR_OF_EXCHANGE);
    	state.setColor(prio, this.COLOR_OF_EXCHANGE);
    	state.setMark('两者交换');
    	dynamic.stateList.push(state);
    },

    stateOfInsert: function(index, locs, elems, capacity, cont) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();

    	for (var i = 0; i < capacity; ++i) {
    		if (state.location[i].y > 200) {
    			tmp = new Location(locs[i].x, locs[i].y +  this.baseDown - this.baseOver);
	    		state.setLocation(i, tmp);
    		}
	    	else
	    		state.setLocation(i, locs[i]);
    		state.setColor(i, this.COLOR_OF_ORIGIN);
    		state.setContent(i, elems[i]);
    	}

    	state.setColor(index, this.COLOR_OF_SELECT);
    	state.setMark(cont);
    	dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}
var shell = {
	MaxOfElement: 15,
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
            dynaOfShell.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfShell.animInterval);
	    	dynaOfShell.animInterval = setInterval( function() {

		    	dynaOfShell.drawCurrentState(dynamic.stateList[dynaOfShell.current]);
		    	if (dynaOfShell.current < len - 1)
		    		dynaOfShell.current++;
		    	else
		    		clearInterval(dynaOfShell.animInterval);
	        }, dynaOfShell.transitionTime);

		}
	},

	size: function() { return this.N; },

	putVal: function(elem) {
        if (!guard.isSafe) return ;
        guard.isDigit(elem);
        
		if (this.size() == this.Max) {
			dynaOfShell.stateOfError('元素个数已经达所定义容量');
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
		var len = this.size(),
		    h = 1;
		while (3 * h < len) h = 3 * h + 1;

		dynaOfShell.location(this.size(), this.locs, this.elems, this.MaxOne);

		while (h >= 1) {
			dynaOfShell.stateOfOrigin(this.size(), this.locs, this.elems);

			for (var j, i = h; i < len; ++i) {
				dynaOfShell.stateOfSubsequent(i, h, this.locs, this.elems, this.size());
				dynaOfShell.stateOfInsert(i, this.locs, this.elems, this.size(), this.elems[i] + '为待插入元素');
				for (j = i; j >= h; j -= h) {
					dynaOfShell.stateOfCompare(j, j - h, this.locs, this.elems, this.size());
					if (this.elems[j] >= this.elems[j - h])
						break;
					dynaOfShell.stateOfExch(j, j - h);
					this.exch(j, j - h);
					dynaOfShell.location(this.size(), this.locs, this.elems, this.MaxOne);
				}
				dynaOfShell.stateOfInsert(j, this.locs, this.elems, this.size(), '在子序列中，插入成功');
			}
			h = Math.floor(h / 3);
		}
		dynaOfShell.stateOfOrigin(this.size(), this.locs, this.elems);
	}
}