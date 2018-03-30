var dynaOfBS = {
	COLOR_OF_ORIGIN: '#beeb9f',
	COLOR_OF_INSERT: '#00a388',
	//COLOR_OF_EXCHANGE: '#00a388',
	COLOR_OF_COMPARE: '#fec515',
	COLOR_OF_REMOVE: '#e8670c',
	COLOR_OF_SELECT: '#00baf5',
	halfWidthOfSVG: 500,
	widthOfElement: 35,
	gap: 6,
	baseline: 250,
	current: 0,
	transitionTime: 2000,

	location: function (locs, capacity) {
		var half = capacity >> 1,
			halfOfElement = this.widthOfElement / 2,
			halfOfGap = this.gap / 2,
			totalWidth = this.widthOfElement + this.gap;

		if(capacity % 2) locs[0] = this.halfWidthOfSVG - halfOfElement - totalWidth * half;
		else locs[0] = this.halfWidthOfSVG + halfOfGap - totalWidth * half;
		
		for (var i = 1; i < capacity; ++i) {
			locs[i] = locs[i - 1] + totalWidth;
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
		var Y = this.baseline - this.widthOfElement,
			RX = 5,
			halfOfElement = this.widthOfElement >> 1,
			fontSize = '.24em',
			XML = 'http://www.w3.org/2000/svg';

		var g = document.createElementNS(XML, 'g');
		g.setAttribute('transform', 'translate(' + loc + ','+ Y + ')');
		
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

	stateOfRemove: function(locs, keys, capacity) {
		this.location(locs, capacity);
		var state = new State(capacity);
		for (var i = 0; i < capacity; ++i) {
			state.setColor(i, this.COLOR_OF_ORIGIN);
			state.setLocation(i, locs[i]);
			state.setContent(i, keys[i]);
		}
		state.setMark('删除元素完成');
		dynamic.stateList.push(state);
	},

	stateOfInsert: function(key, locs, keys, capacity) {
		this.location(locs, capacity);
		var state = new State(capacity);
		for (var i = 0; i < capacity; ++i) {
			state.setColor(i, this.COLOR_OF_ORIGIN);
			state.setLocation(i, locs[i]);
			state.setContent(i, keys[i]);
		}
		dynamic.stateList.push(state);
	},

	stateOfRank: function(lo, mid, hi, num, key) {
		var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
		var len = state.location.length;
		for (var i = 0; i < len; ++i) state.setColor(i, this.COLOR_OF_ORIGIN);

		state.setColor(mid, this.COLOR_OF_COMPARE);
		state.setMark('在' + lo + ', ' + hi + '内, ' + num + '与' + key + '比较');
		dynamic.stateList.push(state);
	}

	// stateOfExch: function(front, behind, keyOfFront, keyOfBehind) {
	// 	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
	// 	state.setColor(front, this.COLOR_OF_EXCHANGE);
	// 	state.setColor(behind, this.COLOR_OF_EXCHANGE);
	// 	state.setContent(front, keyOfBehind);
	// 	state.setContent(behind, keyOfFront);
	// 	state.setMark(keyOfFront + '与' + keyOfBehind + '交换');
	// 	dynamic.stateList.push(state);
	// },
}

var bs = {
	MaxOfElement: 16,
	N: 0,
	Max: 0,
	keys: null,
	locs: null,

	create: function(capacity) {
		guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;

		this.keys = new Array(capacity);
		this.locs = new Array(capacity);
		for (var i = 0; i < capacity; ++i) { this.keys[i] = null; }
		this.Max = capacity;
		this.N = 0;
		
		dynamic.create();
	},

	present: function() {
		if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfBS.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfBS.animInterval);
	    	dynaOfBS.animInterval = setInterval( function() {
	    	dynaOfBS.drawCurrentState(dynamic.stateList[dynaOfBS.current]);
	    	if (dynaOfBS.current < len - 1)
	    		dynaOfBS.current++;
	    	else
	    		clearInterval(dynaOfBS.animInterval);
	      }, dynaOfBS.transitionTime);

		}
	},

	isEmpty: function() { return this.N == 0; },

	size: function() { return this.N; },

	rank: function(key) {
		var lo = 0;
		var hi = this.N - 1;
		while (lo <= hi) {
			var mid = ((hi + lo) >> 1);
			dynaOfBS.stateOfRank(lo, mid, hi, this.keys[mid], key);
			if (this.keys[mid] > key) hi = mid - 1;
			else if (this.keys[mid] < key) lo = mid + 1;
			else return mid;
		}
		return lo;
	},

	getVal: function(key) {
		if (!guard.isSafe) return ;
		guard.isDigit(key);

		if (key == null || key == undefined) { window.alert('函数"getVal(key)"需要参数key值！'); return; }
		if (this.isEmpty()) return null;
		var index = this.rank(key);

		var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
		if (index < this.N && this.keys[index] == key) {
			state.setMark('所求元素为' + key);
			state.setColor(index, dynaOfBS.COLOR_OF_SELECT);
		}
		else { state.setMark('所求元素不存在'); }
		dynamic.stateList.push(state);

		dynaOfBS.stateOfOrigin(this.size());
	},

	putVal: function(key) {
		if (!guard.isSafe) return ;
		guard.isDigit(key);

		if (key == null || key == undefined) { window.alert('函数"putVal(key)"需要参数key值！'); return; }
		if (this.N == this.MaxOfElement || this.N == this.Max) { window.alert('达最大容量，无法增加元素！'); return; }
		var index = this.rank(key);
		if (index < this.N && this.keys[index] == key) {
			var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
			state.setMark('新增元素已存在');
			state.setColor(index, dynaOfBS.COLOR_OF_INSERT);
			dynamic.stateList.push(state);
			this.keys[index] = key;

			dynaOfBS.stateOfOrigin(this.size());
			return;
		}
		
		for (var j = this.size(); j > index; --j) this.keys[j] = this.keys[j - 1];
		
		this.keys[index] = key;
		this.N++;

		dynaOfBS.stateOfInsert(key, this.locs, this.keys, this.size());

		var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
		state.setMark('新增元素为' + key);
		state.setColor(index, dynaOfBS.COLOR_OF_INSERT);
		dynamic.stateList.push(state);
		dynaOfBS.stateOfOrigin(this.size());
	},

	delVal: function(key) {
		if (!guard.isSafe) return ;
		guard.isDigit(key);
		
		if (key == null || key == undefined) { window.alert('函数"delVal(key)"需要参数key值！'); return; }
		if (this.isEmpty()) return null;
		var index = this.rank(key);
		if (index >= this.size() || this.keys[index] != key) {
			var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
			state.setMark('待删除元素不存在');
			dynamic.stateList.push(state);

			dynaOfBS.stateOfOrigin(this.size());
			return;
		}

		var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
		state.setMark('待删除元素为' + key);
		state.setColor(index, dynaOfBS.COLOR_OF_REMOVE);
		dynamic.stateList.push(state);

		for (var j = index; j < this.size() - 1; ++j) {
			this.keys[j] = this.keys[j + 1];
		}

		dynaOfBS.stateOfRemove(this.locs, this.keys, this.size() - 1);

		this.N--;
		dynaOfBS.stateOfOrigin(this.size());
	}
}