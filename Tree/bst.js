var dynaOfBST = {
	WHITE: '#FFFFFF',
	BLACK: '#000000',
    COLOR_OF_TRAVEL: '#FF7426',
    COLOR_OF_SELECT: '#69D277',

	widthOfSVG: 1000,
    centerOfTree: 500,
    gapOfY: 54,
    current: 0,
    animInterval: null,
    transitionTime: 1000,

	location: function(capacity, locs) {
    	var centers = new Array(capacity),
    		locsOfY = new Array(capacity);
    	locsOfY[1] = this.gapOfY;
    	centers[1] = this.centerOfTree;
    	for (var level = 1, i = 2; level < 9; ++level) {
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

    	for (var i = 1; i < capacity; ++i) {
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
    		widthOfInStroke = 0,
    		num,
    		gOfEdge = document.createElementNS(XML, 'g'),
    		gOfCircle = document.createElementNS(XML, 'g'),
    		gOfTxt = document.createElementNS(XML, 'g');

    	var svg = document.getElementById('dynaContent');
    	while (svg.lastChild) svg.removeChild(svg.lastChild);

    	num = state.content[0];

    	for (var i = 0; i < num; ++i) {
    		var indexOfNode = num + i;
    		if (i > 0 && state.location[i] != null)
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
    	var widthOfStroke = 5,
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

    stateOfOrigin: function(locs, elems, nodes) {
    	var num = nodes.length;
    	var state = new State(2 * num);
    	state.location[0] = null;
    	state.content[0] = num;
    	for (var i = 0; i < num; ++i) {
    		var index = nodes[i];
    		if (elems[index] != -1) {
    			if (index > 1) {
	    			locOfChild = locs[index];
	    			locOfParent = locs[Math.floor(index / 2)];
	    			loc = 'M'+locOfChild.x+', '+locOfChild.y+' L' +locOfParent.x+', '+locOfParent.y;
	    			
	    			state.setLocation(i, loc);
	    			state.setColor(i, this.BLACK);
    			}
    			state.setLocation(num + i, locs[index]);
    			state.setColor(num + i, this.WHITE);
    			state.setContent(num + i, elems[index]);
    		}
    	}

    	dynamic.stateList.push(state);
    },

    stateOfTravel: function(index, isNode, nodes, elem) {
    	if (dynamic.stateList.length <= 0) return;
    	var i;
    	for (i = 0; i < nodes.length; ++i)
    		if (nodes[i] == index)
    			break;

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	if (isNode) {
    		var num = state.content[0];
    		state.setColor(num + i, this.COLOR_OF_TRAVEL);
    		state.setMark('与' + elem + '比较');
    	}
    	else 
    		state.setColor(i, this.COLOR_OF_TRAVEL);

    	dynamic.stateList.push(state);
    },

    stateOfInsert: function(capacity, key, locs, elems, nodes) {
    	var state = new State(2 * capacity);
    	state.location[0] = null;
    	state.content[0] = capacity;

    	for (var i = 0; i < capacity; ++i) {
    		var index = nodes[i];
    		if (elems[index] != -1) {
    			if (index > 1) {
	    			locOfChild = locs[index];
	    			locOfParent = locs[Math.floor(index / 2)];
	    			loc = 'M'+locOfChild.x+', '+locOfChild.y+' L' +locOfParent.x+', '+locOfParent.y;
	    			
	    			state.setLocation(i, loc);
	    			state.setColor(i, this.BLACK);
    			}
    			state.setLocation(capacity + i, locs[index]);
    			state.setColor(capacity + i, this.WHITE);
    			state.setContent(capacity + i, elems[index]);
    		}
    	}
    	state.setColor(capacity - 1, this.COLOR_OF_SELECT);
    	state.setColor(2 * capacity - 1, this.COLOR_OF_SELECT);
    	state.setMark('插入' + key);

    	dynamic.stateList.push(state);
    },

    stateOfSelect: function(index, nodes, cont) {
    	var i;
    	for (i = 0; i < nodes.length; ++i)
    		if (nodes[i] == index)
    			break;

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	var num = state.content[0];
    	state.setColor(num + i, this.COLOR_OF_SELECT);
    	state.setMark(cont);

    	dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}
var bst = {
	MaxOfElement: 6,
	capacity: 0,
	root: null,
	locs: null,
	elems: null,
	nodes: null,

	create: function(capacity) {
		guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;

		var len = (1 << (this.MaxOfElement + 1)) + 1;
		this.locs = new Array(len);
		this.elems = new Array(len);
		this.nodes = new Array(0);
		this.capacity = capacity;
		for (var i = 0; i < len; ++i)
			this.elems[i] = -1;

		dynaOfBST.location(len, this.locs);
		dynamic.create();
	},

    present: function() {
    	if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfBST.drawErrors(cont);

            return ;
        }
        
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {
			clearInterval(dynaOfBST.animInterval);
			
	    	dynaOfBST.animInterval = setInterval( function() {
	    	dynaOfBST.drawCurrentState(dynamic.stateList[dynaOfBST.current]);
	    	if (dynaOfBST.current < len - 1)
	    		dynaOfBST.current++;
	    	else
	    		clearInterval(dynaOfBST.animInterval);
	      }, dynaOfBST.transitionTime);
		}
	},

	size: function() { return this.nodes.length; },

	// getVal: function(x, key) {
	// 	//
	// 	if (x == null) return null;
	// 	if (x.key < key) return this.getVal(x.left, key);
	// 	else if (x.key > key) return this.getVal(x.right, key);
	// 	else return x.key;
	// },

	putVal: function(key) {
		if (!guard.isSafe) return ;
		guard.isDigit(key);

		if (this.size() + 1 > this.capacity) {
			dynaOfBST.stateOfError('元素个数超过所定义容量！无法将' + key + '放入二叉树中');
			return ;
		}
		this.insert(1, key);
		dynaOfBST.stateOfOrigin(this.locs, this.elems, this.nodes);
	},

	insert: function(index, key) {
		if (this.elems[index] != -1)
			dynaOfBST.stateOfTravel(index, true, this.nodes, this.elems[index]);
		if (this.elems[index] == -1) {
			this.nodes.push(index);
			this.elems[index] = key;
			dynaOfBST.stateOfInsert(this.size(), key, this.locs, this.elems, this.nodes);
			return ;
		}
		if (this.elems[index] > key) {
			dynaOfBST.stateOfTravel(2 * index, false, this.nodes);
			this.insert(2 * index, key);
		}
		else if (this.elems[index] < key) {
			dynaOfBST.stateOfTravel(2 * index + 1, false, this.nodes);
			this.insert(2 * index + 1, key);
		}
		else {
			dynaOfBST.stateOfSelect(index, this.nodes, key + '已存在');
			this.elems[index] = key;
		}
	},

	min: function(index) {
		dynaOfBST.stateOfTravel(index, true, this.nodes, this.elems[index]);
		if (this.elems[2 * index] == -1) return index;
		dynaOfBST.stateOfTravel(2 * index, false, this.nodes);
		return this.min(2 * index);
	},
	
	deleteMin: function(index) {
		var copyOfelems = new Array(0),
			indexes = new Array(0),
			curIndexex = new Array(0),
			front = 0,
			parent,
			tmp;

		copyOfelems.push(this.elems[index]);
		indexes.push(index);
		curIndexex.push(Math.floor(index / 2));
		this.elems[index] = -1;

		while (front < indexes.length) {
			tmp = indexes[front++];
			if (this.elems[2 * tmp] != -1) {
				copyOfelems.push(this.elems[2 * tmp]);
				indexes.push(2 * tmp);
				curIndexex.push(2 * curIndexex[front - 1]);
				this.elems[2 * tmp] = -1;
			}
			if (this.elems[2 * tmp + 1] != -1) {
				copyOfelems.push(this.elems[2 * tmp + 1]);
				indexes.push(2 * tmp + 1);
				curIndexex.push(2 * curIndexex[front - 1] + 1);
				this.elems[2 * tmp + 1] = -1;
			}
		}

		front = 0;
		while (front < curIndexex.length) {
			this.elems[curIndexex[front]] = copyOfelems[front];
			front++;
		}

		this.nodes = [];
		for (var i = 1; i < this.elems.length; ++i) {
			if (this.elems[i] != -1) this.nodes.push(i);
		}
	},

	delVal: function(key) {
		if (!guard.isSafe) return ;
		guard.isDigit(key);
		
		if (this.size() == 0) {
			dynaOfBST.stateOfError('当前为空树！无法将' + key + '删除');
			return ;
		}

		this.remove(1, key);
		dynaOfBST.stateOfOrigin(this.locs, this.elems, this.nodes);
	},

	remove: function(index, key) {
		var cont = '';
		if (this.elems[index] == -1) {
			//
			return ;
		}
		if (this.elems[index] != -1)
			dynaOfBST.stateOfTravel(index, true, this.nodes, this.elems[index]);
		if (this.elems[index] > key) {
			dynaOfBST.stateOfTravel(2 * index, false, this.nodes);
			this.remove(2 * index, key);
		}
		else if (this.elems[index] < key) {
			dynaOfBST.stateOfTravel(2 * index + 1, false, this.nodes);
			this.remove(2 * index + 1, key);
		}
		else {
			cont = this.elems[index] + '待删除';
			dynaOfBST.stateOfSelect(index, this.nodes, cont);
			if (this.elems[2 * index + 1] == -1) {
				if (this.elems[2 * index] != -1) {
					cont = '用其左子树的父节点取代';
					dynaOfBST.stateOfSelect(2 * index, this.nodes, cont);
				}

				this.elems[index] = this.elems[2 * index];
				this.deleteMin(2 * index);
				return ;
			}
			if (this.elems[2 * index] == -1) {
				cont = '用其右子树的父节点取代';
				dynaOfBST.stateOfSelect(2 * index + 1, this.nodes, cont);
				this.elems[index] = this.elems[2 * index + 1];
				this.deleteMin(2 * index + 1);
				return ;
			}
			cont = '用其右子树的最小值取代，并删除右子树中相应的节点';
			x = this.min(2 * index + 1);
			dynaOfBST.stateOfSelect(x, this.nodes, cont);
			this.elems[index] = this.elems[x];
			this.deleteMin(x);
		}
	}
}