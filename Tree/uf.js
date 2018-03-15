var dynaOfUF = {
	WHITE: '#FFFFFF',
	BLACK: '#000000',
    COLOR_OF_FIND: '#FF7426',
    COLOR_OF_SELECT: '#69D277',

	widthOfSVG: 1000,
	widthOfElem: 50,
    centerOfTree: 500,
    gapOfY: 66,
    current: 0,
    animInterval: null,
    transitionTime: 1000,

    location: function(capacity, childs, locs) {
    	var locOfX = new Array(capacity + 1),
    		locOfY = new Array(capacity + 1),
    		level = new Queue(capacity + 1),
            gap = new Array(capacity + 1),
    		halfOfElement = this.widthOfElem / 2;
    	locOfY[0] = 0;
    	locOfX[0] = this.centerOfTree;
        gap[0] = this.widthOfSVG;
    	level.enqueue(0);
    	while(!level.isEmpty()) {
    		var node = level.dequeue();
    		if (childs[node].length == 0 || childs[node].length == null || childs[node].length == undefined)
                continue;

    		level.enqueue(childs[node][0]);
            var half = (childs[node].length - 1 ) / 2;
    		locOfY[childs[node][0]] = locOfY[node] + this.gapOfY;

            gap[childs[node][0]] = gap[node] / (childs[node].length + 1);

            locOfX[childs[node][0]] = locOfX[node] - gap[childs[node][0]] * half;

    		for (var i = 1; i < childs[node].length; ++i) {
    			level.enqueue(childs[node][i]);
    			locOfY[childs[node][i]] = locOfY[node] + this.gapOfY;
                gap[childs[node][i]] = gap[childs[node][0]];
    			locOfX[childs[node][i]] = locOfX[childs[node][i - 1]] + gap[childs[node][0]];
    		}
    	}

    	for (var i = 0; i < capacity + 1; ++i)
    		locs[i] = new Location(locOfX[i], locOfY[i]);

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

        num = state.content.length / 2;
        for (var i = 1; i <= state.content[0]; ++i)
            gOfEdge.appendChild(this.htmlAddEdge(state.location[i + num], state.color[i + num]));

        for (var i = 1; i <= num; ++i) {
    		outCircle = this.htmlAddCircle(state.location[i], this.BLACK, outR, widthOfOutStroke);
    		inCircle = this.htmlAddCircle(state.location[i], state.color[i], inR, widthOfInStroke);
    		gOfCircle.appendChild(outCircle);
    		gOfCircle.appendChild(inCircle);
    		gOfTxt.appendChild(this.htmlAddTxt(state.location[i], state.content[i]));
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

    stateOfOrigin: function(id, locs) {
    	var num = id.length - 1;
    	var state = new State(2 * num);
    	state.location[0] = null;
    	state.content[0] = 0;
    	for (var i = 1; i <= num; ++i) {
            state.setLocation(i, locs[i]);
            state.setColor(i, this.WHITE);
            state.setContent(i, i);
            if (id[i] == i) continue;

            var locOfChild = locs[i],
                locOfParent = locs[id[i]],
                loc =  'M'+locOfChild.x+', '+locOfChild.y+' L' +locOfParent.x+', '+locOfParent.y;
    		state.setLocation(num + state.content[0] + 1, loc);
            state.setColor(num + state.content[0] + 1, this.BLACK);
            state.content[0]++;
    	}

    	dynamic.stateList.push(state);
    },

    stateOfFind: function(pre, p) {
    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	if (pre != null)
            state.setColor(pre, this.WHITE);

        state.setColor(p, this.COLOR_OF_FIND);
        state.setMark('寻找' + p + '的父节点');
    	dynamic.stateList.push(state);
    },

    stateOfUnion: function(p, q, id, locs) {
    	var num = id.length - 1;
        var state = new State(2 * num);
        state.location[0] = null;
        state.content[0] = 0;
        for (var i = 1; i <= num; ++i) {
            state.setLocation(i, locs[i]);
            state.setColor(i, this.WHITE);
            state.setContent(i, i);
            if (id[i] == i) continue;

            var locOfChild = locs[i],
                locOfParent = locs[id[i]],
                loc =  'M'+locOfChild.x+', '+locOfChild.y+' L' +locOfParent.x+', '+locOfParent.y;
            state.setLocation(num + state.content[0] + 1, loc);
            state.setColor(num + state.content[0] + 1, this.BLACK);
            state.content[0]++;
        }
    	
        state.setColor(p, this.COLOR_OF_SELECT);
        state.setColor(q, this.COLOR_OF_SELECT);
        state.setMark(q + '作为' + p + '的父节点');
    	dynamic.stateList.push(state);
    },

    stateOfConnet: function(p, q, pp, qq) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        
        state.setColor(p, this.WHITE);
        state.setColor(q, this.WHITE);
        if (p == q)
            state.setMark(pp + ', ' + qq + '相连');
        else
            state.setMark(pp + ', ' + qq + '不相连');
        dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}

var uf = {
	MaxOfElement: 16,
	id: null,
    sz: null,
	childs: null,
	locs: null,
	count: 0,

	create: function(capacity) {
		guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;

        this.id = new Array(capacity + 1);
        this.sz = new Array(capacity + 1);
        this.childs = new Array(capacity + 1);
        this.locs = new Array(capacity + 1);
		this.count = capacity;
		this.childs[0] = new Array(0);

		for (var i = 1; i <= capacity; ++i) {
			this.id[i] = i;
            this.sz[i] =1;
			this.childs[i] = new Array(0);
            this.childs[i].length = 0;
			this.childs[0].push(i);
		}

		dynaOfUF.location(this.id.length - 1, this.childs, this.locs);
		dynamic.create();

		dynaOfUF.stateOfOrigin(this.id, this.locs);
	},

    present: function() {
        if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfUF.drawErrors(cont);

            return ;
        }
        
        var len = dynamic.stateList.length;
        for (var i = 0; i < len; ++i) {
            clearInterval(dynaOfUF.animInterval);
            
            dynaOfUF.animInterval = setInterval( function() {
            dynaOfUF.drawCurrentState(dynamic.stateList[dynaOfUF.current]);
            if (dynaOfUF.current < len - 1)
                dynaOfUF.current++;
            else
                clearInterval(dynaOfUF.animInterval);
          }, dynaOfUF.transitionTime);
        }
    },

	counter: function() { return this.count; },

	connected: function(p, q) {
		var rootOfP = this.find(p);
        var rootOfQ = this.find(q);
		dynaOfUF.stateOfConnet(rootOfP, rootOfQ, p, q);
        dynaOfUF.stateOfOrigin(this.id, this.locs);
	},

	find: function(p) {
        if (!guard.isSafe) return ;
        guard.isInSet(p, this.id.length);

        var pre = null;
		while (p != this.id[p]) {
			dynaOfUF.stateOfFind(pre, p);
            pre = p;
			p = this.id[p];
		}
        dynaOfUF.stateOfFind(pre, p);
        dynaOfUF.stateOfOrigin(this.id, this.locs);
		return p;
	},

	union: function(p, q) {
        if (!guard.isSafe) return ;

        guard.isInSet(p, this.id.length);
        guard.isInSet(q, this.id.length);
        
		var rootOfP = this.find(p);
		var rootOfQ = this.find(q);
		if (rootOfP == rootOfQ) return ;

        var parent = rootOfQ,
            child = rootOfP;

        if (this.sz[rootOfP] > this.sz[rootOfQ]) {
            parent = rootOfP;
            child = rootOfQ;
            var t = p;
            p = q;
            q = t;
        }

        if (p == child && parent != child) {
            var len = this.childs[0].length;
            for (var i = 0; i < len; ++i) {
                if (this.childs[0][i] == child) {
                    this.childs[0].splice(i, 1);
                    break;
                }
            }
        }
        else if (parent != child) {
            var len = this.childs[this.id[child]].length;
            for (var i = 0; i < len; ++i) {
                if (this.childs[this.id[child]][i] == child) {
                    this.childs[this.id[child]].splice(i, 1);
                    break;
                }
            }
        }
		this.id[child] = parent;
        this.childs[parent].push(child);
        this.sz[parent] += this.sz[child];
        dynaOfUF.stateOfUnion(child, parent, this.id, this.locs);
        
		this.count--;
		
        dynaOfUF.location(this.id.length - 1, this.childs, this.locs);
		dynaOfUF.stateOfOrigin(this.id, this.locs);
	}
}