var dynaOfRBBST = {
	RED: '#CC3D33',
	WHITE: '#FFFFFF',
	BLACK: '#000000',
    COLOR_OF_TRAVEL: '#FF7426',
    COLOR_OF_SELECT: '#69D277',
    COLOR_OF_H: '#A8FFDE',
    COLOR_OF_X: '#2E7F60',

    widthOfSVG: 1000,
    capacity: 32,
    centerOfTree: 500,
    gapOfY: 54,
    current: 0,
    animInterval: null,
    transitionTime: 2400,

    location: function(locs) {
    	var centers = new Array(this.capacity),
    		locsOfY = new Array(this.capacity);
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
    		locs[i] = new Location(X, Y);
    	}
    },

    drawErrors: function(cont) {
    	var svg = document.getElementById('dynaContent');
    	while (svg.lastChild) svg.removeChild(svg.lastChild);
    	svg.appendChild(this.htmlAddMark(cont));
    },

    drawCurrentState: function(state) {
    	var XML = 'http://www.w3.org/2000/svg',
    		outR = 21,
    		inR = 18,
    		widthOfOutStroke = 3,
    		widthOfInStroke = 0;

    	var svg = document.getElementById('dynaContent');
    	while (svg.lastChild) svg.removeChild(svg.lastChild);

    	var gOfEdge = document.createElementNS(XML, 'g');
    	var gOfCircle = document.createElementNS(XML, 'g');
    	var gOfTxt = document.createElementNS(XML, 'g');

    	for (var i = 1; i < this.capacity; ++i) {
    		var indexOfNode = this.capacity + i - 1;
    		if (i > 1 && state.location[i] != null)
    			gOfEdge.appendChild(this.htmlAddEdge(state.location[i], state.color[i]));

    		if (state.location[indexOfNode] != null) {
    			outCircle = this.htmlAddCircle(state.location[indexOfNode], this.BLACK, outR, widthOfOutStroke);
    			inCircle = this.htmlAddCircle(state.location[indexOfNode], state.color[indexOfNode], inR, widthOfInStroke);
    			gOfCircle.appendChild(outCircle);
    			gOfCircle.appendChild(inCircle);
    			gOfTxt.appendChild(this.htmlAddTxt(state.location[indexOfNode], state.content[indexOfNode]));
    		}
    	}

    	svg.appendChild(gOfEdge);
    	svg.appendChild(gOfCircle);
    	svg.appendChild(gOfTxt);

    	svg = document.getElementById('dynaMark');
        while (svg.lastChild) svg.removeChild(svg.lastChild);
        svg.appendChild(this.htmlAddMark(state.mark));
    },

    htmlAddCircle: function(loc, color, r, widthOfStroke) {
    	var XML = 'http://www.w3.org/2000/svg';
    	var circle = document.createElementNS(XML, 'circle');
    	circle.setAttribute('cx', loc.x);
    	circle.setAttribute('cy', loc.y);
    	circle.setAttribute('r', r);
    	circle.setAttribute('fill', color);
    	circle.setAttribute('stroke', color);
    	circle.setAttribute('stroke-width', widthOfStroke);
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

    htmlAddEdge: function(loc, color) {
    	var widthOfStroke = 4,
		    XML = 'http://www.w3.org/2000/svg';
		var path = document.createElementNS(XML, 'path');
		path.setAttribute('d', loc);
		path.setAttribute('stroke', color);
		path.setAttribute('stroke-width', widthOfStroke);
		return path;
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

    stateOfOrigin: function(locs, elems, redElem) {
    	var state = new State(2 * this.capacity);
    	for (var i = this.capacity - 1; i >= 1; --i) {
    		if (elems[i] != -1) {
    			if (i > 1) {
	    			locOfChild = locs[i];
	    			locOfParent = locs[Math.floor(i / 2)];
	    			loc = 'M'+locOfChild.x+', '+locOfChild.y+' L' +locOfParent.x+', '+locOfParent.y;
	    			color = this.BLACK;
	    			if (redElem[i]) color = this.RED;

	    			state.setLocation(i, loc);
	    			state.setColor(i, color);
    			}
    			state.setLocation(this.capacity + i, locs[i]);
    			state.setColor(this.capacity + i, this.WHITE);
    			state.setContent(this.capacity + i, elems[i]);
    		}
    		else {
    			state.setLocation(i, null);
    			state.setLocation(this.capacity + i, null);
    		}
    	}

    	dynamic.stateList.push(state);
    },

    stateOfTravel: function(node, edge, cont) {
    	if (dynamic.stateList.length <= 0) return;

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	if (node != null)
    		state.setColor(this.capacity + node, this.COLOR_OF_TRAVEL);
    	if (edge != null)
    		state.setColor(edge, this.COLOR_OF_TRAVEL);

    	state.setMark(cont);

    	dynamic.stateList.push(state);
    },

    stateOfInsert: function(key, index, locs, elems, redElem) {
    	var locOfChild,
    		locOfParent,
    		loc,
    		color,
    		state;

    	if (dynamic.stateList.length <= 0)
    		state = new State(2 * this.capacity);
    	else 
    		state = dynamic.stateList[dynamic.stateList.length - 1].copy();

    	if (index > 1) {
	    	locOfChild = locs[index];
	    	locOfParent = locs[Math.floor(index / 2)];
	    	loc = 'M'+locOfChild.x+', '+locOfChild.y+' L' +locOfParent.x+', '+locOfParent.y;
	    	state.setLocation(index, loc);
	    	state.setColor(index, this.COLOR_OF_TRAVEL);
    	}
    	state.setLocation(this.capacity + index, locs[index]);
    	state.setColor(this.capacity + index, this.COLOR_OF_SELECT);
    	state.setContent(this.capacity + index, key);
    	state.setMark(key + '插入');

    	dynamic.stateList.push(state);
    },

    stateOfMoveSide: function(indexOfH, indexOfX, indexOfY, locs, cont) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	state.setColor(this.capacity + indexOfH, this.COLOR_OF_H);
    	state.setColor(this.capacity + indexOfX, this.COLOR_OF_X);
    	if (indexOfY != null) {
    		var locOfChild = locs[indexOfY],
    			locOfParent = locs[indexOfH],
    			loc = 'M'+locOfChild.x+', '+locOfChild.y+' L' +locOfParent.x+', '+locOfParent.y;
    		state.setLocation(indexOfY, loc);
    		state.setColor(indexOfY, this.COLOR_OF_H);
    		state.setMark('将' + state.content[this.capacity + indexOfH] + ', ' + state.content[this.capacity + indexOfX] + ', ' + state.content[this.capacity + indexOfY] + cont);
    	}
    	state.setColor(indexOfX, this.COLOR_OF_X);
    	state.setMark('将' + state.content[this.capacity + indexOfH] + ', ' + state.content[this.capacity + indexOfX] + ', ' + cont);
    	dynamic.stateList.push(state);
    },

    stateOfSelect: function(index, cont) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	state.setColor(this.capacity + index, this.COLOR_OF_SELECT);
    	state.setMark(cont);

    	dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}
var redBlackBST = {
	MaxOfElement: 15,
	capacity: 0,
	root: null,
	RED: 1,
	BLACK: 0,
	locs: null,
	elems: null,
	redElem: null,

	create: function(capacity) {
		guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;

		var len = this.MaxOfElement * 2 + 2;
		this.locs = new Array(len);
		this.elems = new Array(len);
		this.redElem = new Array(len);
		this.inStackOfNodes = new Array(0);
		this.inStackOfEdges = new Array(0);
		this.capacity = capacity;
		for (var i = 0; i < len; ++i) {
			this.elems[i] = -1;
			this.redElem[i] = false;
		}
		dynaOfRBBST.location(this.locs);
		dynamic.create();
	},

	present: function() {
		if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfRBBST.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {
			clearInterval(dynaOfRBBST.animInterval);
			
	    	dynaOfRBBST.animInterval = setInterval( function() {
	    	dynaOfRBBST.drawCurrentState(dynamic.stateList[dynaOfRBBST.current]);
	    	if (dynaOfRBBST.current < len - 1)
	    		dynaOfRBBST.current++;
	    	else
	    		clearInterval(dynaOfRBBST.animInterval);
	      }, dynaOfRBBST.transitionTime);
		}
	},

	clear: function() {
		var len = this.MaxOfElement * 2 + 2
		for (var i = 0; i < len; ++i) {
			this.elems[i] = -1;
			this.redElem[i] = false;
		}
	},

	travel: function(h, index) {
		if (h == null) return ;
		this.elems[index] = h.key;
		if (this.isRed(h)) this.redElem[index] = true;

		if (h.left != null) this.travel(h.left, index * 2);
		if (h.right != null) this.travel(h.right, index * 2 + 1);
	},

	isRed: function(x) {
		if (x == null) return false;
		return x.color == this.RED;
	},

	size: function(x) {
		if (x == null) return 0;
		else return x.N;
	},

	rotateLeft: function(h, index) {
		var x = h.right;
		var indexOfH = index,
			indexOfX = 2 * index + 1,
			indexOfY = 2 * indexOfX;
			cont = '做左旋操作，将红边旋转成以' + x.key + '父结点的边';
		if (x.left == null) indexOfY = null;

		dynaOfRBBST.stateOfMoveSide(indexOfH, indexOfX, indexOfY, this.locs, cont);

		h.right = x.left;
		x.left = h;
		x.color = h.color;
		h.color = this.RED;
		x.N = h.N;
		h.N = 1 + this.size(h.left) + this.size(h.right);

		return x;
	},

	rotateRight: function(h, index) {
		var x = h.left;
		var indexOfH = index,
			indexOfX = 2 * index,
			indexOfY = 2 * indexOfX + 1;
			cont = '做右旋操作，将红边旋转成以' + x.key + '父结点的边';
		if (x.right == null) indexOfY = null;

		dynaOfRBBST.stateOfMoveSide(indexOfH, indexOfX, indexOfY, this.locs, cont);

		h.left = x.right;
		x.right = h;
		x.color = h.color;
		h.color = this.RED;
		x.N = h.N;
		h.N = 1 + this.size(h.left) + this.size(h.right);

		return x;
	},

	flipColors: function(h) {
		h.color = this.RED;
		h.left.color = this.BLACK;
		h.right.color = this.BLACK;
	},

	min: function(x, index) {
		dynaOfRBBST.stateOfTravel(index, null, x.key + '与' + this.elems[index] + '比较');
		if (x.left == null)  {
			dynaOfRBBST.stateOfSelect(index, x.key + '为待删除元素右子树上最小元素');
			return x;
		}
		dynaOfRBBST.stateOfTravel(null, 2 * index, '往左子树遍历');
		return this.min(x.left, 2 * index);
	},

	putVal: function(key) {
		if (!guard.isSafe) return ;
		guard.isDigit(key);
		
		if (this.size() + 1 == this.capacity) {
			dynaOfBST.stateOfError('元素个数超过所定义容量！无法将' + key + '放入红黑树中');
			return ;
		}
		this.clear();
		this.travel(this.root, 1);

		this.root = this.insert(this.root, key, 1);
		this.root.color = this.BLACK;

		this.clear();
		this.travel(this.root, 1);
		dynaOfRBBST.stateOfOrigin(this.locs, this.elems, this.redElem);
	},

	insert: function(h, key, index) {
		if (h != null)
			dynaOfRBBST.stateOfTravel(index, null, key + '与' + h.key + '比较');

		if (h == null) {
			dynaOfRBBST.stateOfInsert(key, index, this.locs, this.elems, this.redElem);
			var newNode = new Node(key, 1, this.RED);
			return newNode;
		}
		if (h.key > key) {
			dynaOfRBBST.stateOfTravel(null, 2 * index, '往左子树遍历');
			h.left = this.insert(h.left, key, 2 * index);
		}
		else if (h.key < key) {
			dynaOfRBBST.stateOfTravel(null, 2 * index + 1, '往右子树遍历');
			h.right = this.insert(h.right, key, 2 * index + 1);
		}
		else  {
			h.key = key;
			dynaOfRBBST.stateOfSelect(index, key + '已经存在');
		}

		this.clear();
		this.travel(this.root, 1);
		dynaOfRBBST.stateOfOrigin(this.locs, this.elems, this.redElem);

		if (this.isRed(h.right) && !this.isRed(h.left)) h = this.rotateLeft(h, index);
		if (this.isRed(h.left) && this.isRed(h.left.left)) h = this.rotateRight(h, index);
		if (this.isRed(h.left) && this.isRed(h.right)) this.flipColors(h, index);
		h.N = this.size(h.left) + this.size(h.right) + 1;
		return h;
	},

	balance: function(h, index) {
		if (this.isRed(h.right))
			h = this.rotateLeft(h, index);
		return h;
	},

	moveRedLeft: function(h, index) {
		this.flipColors(h);
		if (this.isRed(h.right.left)) {
			h.right = this.rotateRight(h.right, 2 * index + 1);
			h = this.rotateLeft(h, index);
		}
		return h;
	},

	moveRedRight: function(h, index) {
		this.flipColors(h);
		if (!this.isRed(h.left.left)) h = this.rotateRight(h, index);
		return h;
	},

	deleteMin: function(h, index) {
		if (h.left == null) return null;
		if (!this.isRed(h.left) && !this.isRed(h.left.left)) h = this.moveRedLeft(h, index);
		h.left = this.deleteMin(h.left, 2 * index);
		return this.balance(h, index);
	},

	// delVal: function(key) {
	// 	if (this.size() + 1 == this.capacity) {
	// 		dynaOfBST.stateOfError('当前为空树！无法将' + key + '删除');
	// 		return ;
	// 	}
	// 	this.clear();
	// 	this.travel(this.root, 1);
	// 	//
	// 	if (!this.isRed(this.root.left) && !this.isRed(this.root.right)) this.root.color = this.RED;
	// 	this.root = this.remove(this.root, key, 1);
	// 	if (this.root.N != 0) this.root.color = this.BLACK;

	// 	this.clear();
	// 	this.travel(this.root, 1);
	// 	dynaOfRBBST.stateOfOrigin(this.locs, this.elems, this.redElem);
	// },

	remove: function(h, key, index) {
		dynaOfRBBST.stateOfTravel(index, null);
		if (h.key > key) {
			if (!this.isRed(h.left) && !isRed(h.left.left)) h = this.moveRedLeft(h, index);
			h.left = this.remove(h.left, key, 2 * index);
			h = this.balance(h, index);

			this.clear();
			this.travel(this.root, 1);
			dynaOfRBBST.stateOfOrigin(this.locs, this.elems, this.redElem);
			return h;
		}
		if (this.isRed(h.left)) h = this.rotateRight(h, index);
		if (h.key == key && (h.right == null)) return null;
		if (!this.isRed(h.right) && !this.isRed(h.right.left)) h = this.moveRedRight(h, index);
		
		this.clear();
		this.travel(this.root, 1);
		dynaOfRBBST.stateOfOrigin(this.locs, this.elems, this.redElem);

		if (h.key == key) {
			dynaOfRBBST.stateOfSelect(index);
			h.key = this.min(h.right, 2 * index + 1).key;
			h.right = this.deleteMin(h.right, 2 * index + 1);
		}
		else {
			h.right = this.remove(h.right, key, 2 * index + 1);
		}
		h = this.balance(h, index);

		this.clear();
		this.travel(this.root, 1);
		dynaOfRBBST.stateOfOrigin(this.locs, this.elems, this.redElem);
		return h;
		
	}
}