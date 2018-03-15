var dynaOfBFS = {
	WHITE: '#FFFFFF',
	BLACK: '#000000',
    COLOR_OF_TRAVEL: '#FF7426',
    COLOR_OF_VISITED: '#69D277',
    COLOR_OF_SELECT: '#e8670c',

	widthOfSVG: 1000,
	G: null,
    current: 0,
    animInterval: null,
    transitionTime: 2000,

    getGraph: function(G) { this.G = G; },

    location: function(capacity, locs, locsOfEnd) {
    	var pi = Math.PI,
		    degreesOfRotation = 2 * pi / capacity,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4),
		    R = Math.sqrt(5000 / (1 - Math.cos(degreesOfRotation))),
		    d = R + r,
		    l = Math.sqrt(d * d + r * r - 2 * d * r * Math.cos(pi / 4)),
		    theta = Math.asin(Math.sin(pi / 4) * r / l),
		    CX = 500,
		    CY = 270;
		for (var i = 0, alpha = 0; i < capacity; ++i) {
		    locs[i] = new Location(CX + R * Math.cos(alpha), CY + R * Math.sin(alpha));
		    locsOfEnd[i] = new Location(CX + l * Math.cos(alpha - theta), CY + l * Math.sin(alpha - theta));
		    alpha += degreesOfRotation;
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

    	num = state.location.length - this.G.V;

    	for (var v = 0; v < this.G.V; ++v) {
    		outCircle = this.htmlAddCircle(state.location[v], this.BLACK, outR, widthOfOutStroke);
    		inCircle = this.htmlAddCircle(state.location[v], state.color[v], inR, widthOfInStroke);
    		gOfCircle.appendChild(outCircle);
    		gOfCircle.appendChild(inCircle);
    		gOfTxt.appendChild(this.htmlAddTxt(state.location[v], state.content[v]));
    	}

    	for (var e = 0; e < num; ++e)
    		gOfEdge.appendChild(this.htmlAddEdge(state.location[e + this.G.V], state.color[e + this.G.V]));

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
		path.setAttribute('fill', '#ffffff');
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

    stateOfOrigin: function(locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = new State(this.G.V + this.G.E);
    	for (var i = 0; i < this.G.V; ++i) {
    		state.setLocation(i, locs[i]);
    		state.setColor(i, this.WHITE);
    		state.setContent(i, i);
    	}
    	
    	for (var v = 0, e = 0; v < this.G.V; ++v) {
			var adj = this.G.adjOfV(v);
			for (var i = 0; i < adj.length; ++i) {
				if (adj[i] > v) {
					state.setLocation(e + this.G.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[adj[i]].x+', '+locs[adj[i]].y);
					state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
				else if (adj[i] == v) {
					state.setLocation(e + this.G.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
					state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
			}
		}

    	dynamic.stateList.push(state);
    },

    stateOfTravel: function(V, W, marked, edgeTo, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.G.V; ++i) {
    		if (i == W) 
    			state.setColor(i, this.COLOR_OF_TRAVEL);
    		else if (marked[i]) 
    			state.setColor(i, this.COLOR_OF_VISITED);
    		else
    			state.setColor(i, this.WHITE);
    	}

    	for (var v = 0, e = 0; v < this.G.V; ++v) {
			var adj = this.G.adjOfV(v);
			for (var i = 0; i < adj.length; ++i) {
				if (adj[i] > v || adj[i] < v) {
					state.setLocation(e + this.G.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[adj[i]].x+', '+locs[adj[i]].y);
					if (v == V && adj[i] == W || adj[i] == V && v == W)
						state.setColor(e + this.G.V, this.COLOR_OF_TRAVEL);
					else if (edgeTo[adj[i]] == v || edgeTo[v] == adj[i])
						state.setColor(e + this.G.V, this.COLOR_OF_VISITED);
					else
						state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
				else if (adj[i] == v) {
					state.setLocation(e + this.G.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
					if (v == V && adj[i] == W)
						state.setColor(e + this.G.V, this.COLOR_OF_TRAVEL);
					else
						state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
			}
		}
		state.setMark('从' + V + '访问' + W);
    	dynamic.stateList.push(state);
    },

    stateOfSelect: function(w, marked, edgeTo, isFrom, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.G.V; ++i) {
    		if (i == w) 
    			state.setColor(i, this.COLOR_OF_SELECT);
    		else if (marked[i])
    			state.setColor(i, this.COLOR_OF_VISITED);
    		else
    			state.setColor(i, this.WHITE);
    	}

    	for (var v = 0, e = 0; v < this.G.V; ++v) {
			var adj = this.G.adjOfV(v);
			for (var i = 0; i < adj.length; ++i) {
				if (adj[i] > v || adj[i] < v) {
					state.setLocation(e + this.G.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[adj[i]].x+', '+locs[adj[i]].y);
					if (edgeTo[adj[i]] == v || edgeTo[v] == adj[i])
						state.setColor(e + this.G.V, this.COLOR_OF_VISITED);
					else
						state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
				else if (adj[i] == v) {
					state.setLocation(e + this.G.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
					state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
			}
		}
		if (isFrom)
			state.setMark('从' + w + '开始访问相邻节点');
		else if (marked[w])
			state.setMark(w + '已访问，无需访问');
		else
			state.setMark('访问' + w);
    	dynamic.stateList.push(state);
    }
}
var bfs = {
	marked: null,
	edgeTo: null,
	s: 0,
	locs: null,
	locsOfEnd: null,

	create: function(G, s) {
		guard.isExistOfNode(s);
		if (!guard.isSafe) return ;

		var num = G.V;
		this.marked = new Array(num);
		this.edgeTo = new Array(num);
		this.locs = new Array(num);
		this.locsOfEnd = new Array(num);
		this.s = s;
		for (var i = 0; i < num; ++i) {
			this.edgeTo[i] = null;
			this.marked[i] = false;
		}
		dynaOfBFS.location(num, this.locs, this.locsOfEnd);
		dynaOfBFS.getGraph(G);
		dynamic.create();
		this.BFS(G, s);
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

			clearInterval(dynaOfBFS.animInterval);
	    	dynaOfBFS.animInterval = setInterval( function() {

		    	dynaOfBFS.drawCurrentState(dynamic.stateList[dynaOfBFS.current]);
		    	if (dynaOfBFS.current < len - 1)
		    		dynaOfBFS.current++;
		    	else
		    		clearInterval(dynaOfBFS.animInterval);
	        }, dynaOfBFS.transitionTime);

		}
	},

	BFS: function(G, s) {
		dynaOfBFS.stateOfOrigin(this.locs, this.locsOfEnd);
		var q = new Queue(G.V);
		this.marked[s] = true;
		q.enqueue(s);
		while (!q.isEmpty()) {
			var v = q.dequeue();
			dynaOfBFS.stateOfSelect(v, this.marked, this.edgeTo, true, this.locs, this.locsOfEnd);
			vertices = G.adjOfV(v);
			num = vertices.length;
			for (var i = 0; i < num; ++i) {
				var w = vertices[i];
				dynaOfBFS.stateOfTravel(v, w, this.marked, this.edgeTo, this.locs, this.locsOfEnd);
				if (!this.marked[w]) {
					dynaOfBFS.stateOfSelect(w, this.marked, this.edgeTo, false, this.locs, this.locsOfEnd);
					this.edgeTo[w] = v;
					this.marked[w] = true;
					q.enqueue(w);
				}
				else
					dynaOfBFS.stateOfSelect(w, this.marked, this.edgeTo, false, this.locs, this.locsOfEnd);
			}
		}
		dynaOfBFS.stateOfOrigin(this.locs, this.locsOfEnd);
	}
}