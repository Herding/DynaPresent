var dynaOfStack = {
	COLOR_OF_ORIGIN: '#00baf5',
	COLOR_OF_PUSH: '#00a388',
	COLOR_OF_POP: '#f69a9a',

	widthOfSVG: 1000,
	widthOfElement: 70,
	gap: 5,
	current: 0,
	animInterval: null,
	transitionTime: 2000,

	location: function (locs, capacity) {
		if (capacity < 1) return;
		var totalWidth = this.widthOfElement + this.gap;

		locs[0] = totalWidth * capacity - this.widthOfElement;
		for (var i = 1; i < capacity; ++i) {
			locs[i] = locs[i - 1] - totalWidth;
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
		var X = (this.widthOfSVG - this.widthOfElement) / 2,
			RX = 10,
			halfOfElement = this.widthOfElement >> 1,
			fontSize = '.48em',
			XML = 'http://www.w3.org/2000/svg';

		var g = document.createElementNS(XML, 'g');
		g.setAttribute('transform', 'translate(' + X + ','+ loc + ')');
		
		var rect = document.createElementNS(XML, 'rect');
		rect.setAttribute('width', this.widthOfElement);
		rect.setAttribute('height', this.widthOfElement);
		rect.setAttribute('style', 'fill:' + color);
		rect.setAttribute('rx', RX);

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
		var fontSize = '.36em',
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

	stateOfOrigin: function(capacity) {
		var state = dynamic.stateList[dynamic.stateList.length - 1].copy();

		for (var i = 0; i < capacity; ++i) state.setColor(i, this.COLOR_OF_ORIGIN);

		dynamic.stateList.push(state);
	},

	stateOfPop: function(elems, locs, capacity) {
		var state = new State(capacity);
		for (var i = 0; i < capacity; ++i) {
			state.setColor(i, this.COLOR_OF_ORIGIN);
			state.setLocation(i, locs[i]);
			state.setContent(i, elems[i]);
		}
		dynamic.stateList.push(state);
	},

	stateOfPush: function(elem, elems, locs, capacity) {
		var last = capacity - 1;
		var state = new State(capacity);
		for (var i = 0; i < last; ++i) {
			state.setColor(i, this.COLOR_OF_ORIGIN);
			state.setLocation(i, locs[i]);
			state.setContent(i, elems[i]);
		}
		state.setColor(last, this.COLOR_OF_PUSH);
		state.setLocation(last, locs[last]);
		state.setContent(last, elem);
		state.setMark(elem + '入栈');
		dynamic.stateList.push(state);
	},

	stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}

var stack = {
	MaxOfElement: 6,
	Max: 0,
	N: 0,
	elems: null,
	locs: null,

	create: function(capacity) {
		guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;

		this.elems = new Array(capacity);
		this.locs = new Array(capacity);
		dynaOfStack.location(this.locs, capacity);
		this.Max = capacity;
		this.N = 0;

		dynamic.create();
	},

	present: function() {
		if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfStack.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {
			clearInterval(dynaOfStack.animInterval);
	    	dynaOfStack.animInterval = setInterval( function() {
	    	dynaOfStack.drawCurrentState(dynamic.stateList[dynaOfStack.current]);
	    	if (dynaOfStack.current < len - 1)
	    		dynaOfStack.current++;
	    	else
	    		clearInterval(dynaOfStack.animInterval);
	      }, dynaOfStack.transitionTime);

		}
	},

	size: function() { return this.N; },

	pushVal: function(elem) {
		if (!guard.isSafe) return ;
		guard.isDigit(elem);
		
		if (this.size() == this.Max) {
			dynaOfStack.stateOfError('栈已满！无法使' + elem + '入栈');
			return ;
		}
		else {
			this.elems[this.N++] = elem;
			dynaOfStack.stateOfPush(elem, this.elems, this.locs, this.size());
			dynaOfStack.stateOfOrigin(this.size());
		}
	},

	popVal: function() {
		if (this.size() > 0) {
			var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
			state.setColor(this.size() - 1, dynaOfStack.COLOR_OF_POP);
			state.setMark(this.elems[this.size() - 1] + '出栈');
			dynamic.stateList.push(state);
			this.elems[--this.N];
			dynaOfStack.stateOfPop(this.elems, this.locs, this.size());
		}
		else {
			//
		}
	}
}