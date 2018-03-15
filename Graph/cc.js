var dynaOfCC = {
	WHITE: '#FFFFFF',
	BLACK: '#000000',
    COLOR: ['#FFFFFF', '#718AD0', '#6EB9A0', '#A6D071', '#B9A56E', '#D08D7B', '#B3B5BF', '#6CB0B2', '#F0CA4D', '#F52A44', '#0696BD', '#07BFF0', '#88F9D4', '#E862A1', '#C662E8', '#FF6C68'],
    COLOR_OF_CONNECTED: '#85D0D4',
    COLOR_OF_SELECT: '#EE7081',
    COLOR_OF_TRAVEL: '#FF7426',

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

    stateOfOrigin: function(id, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = new State(this.G.V + this.G.E);
    	for (var i = 0; i < this.G.V; ++i) {
    		state.setLocation(i, locs[i]);
    		state.setColor(i, this.COLOR[id[i]]);
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

    stateOfTravel: function(V, W, id, marked, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.G.V; ++i) {
    		if (i == W) state.setColor(i, this.COLOR_OF_TRAVEL);
    		else state.setColor(i, this.COLOR[id[i]]);
    	}

    	for (var v = 0, e = 0; v < this.G.V; ++v) {
			var adj = this.G.adjOfV(v);
			for (var i = 0; i < adj.length; ++i) {
				if (adj[i] == v) {
					state.setLocation(e + this.G.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
					if (marked[v])
						state.setColor(e + this.G.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
				else if (adj[i] > v) {
					state.setLocation(e + this.G.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[adj[i]].x+', '+locs[adj[i]].y);
					if (marked[v] && marked[adj[i]])
						state.setColor(e + this.G.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
			}
		}
		state.setMark('将' + W + '并入' + V + '相连的连通分量');
    	dynamic.stateList.push(state);
    },

    stateOfSelect: function(V, id, marked, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.G.V; ++i) {
    		if (i == V) state.setColor(i, this.COLOR_OF_SELECT);
    		else state.setColor(i, this.COLOR[id[i]]);
    	}

    	for (var v = 0, e = 0; v < this.G.V; ++v) {
			var adj = this.G.adjOfV(v);
			for (var i = 0; i < adj.length; ++i) {
				if (adj[i] == v) {
					state.setLocation(e + this.G.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
					if (marked[v])
						state.setColor(e + this.G.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
				else if (adj[i] > v) {
					state.setLocation(e + this.G.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[adj[i]].x+', '+locs[adj[i]].y);
					if (marked[v] && marked[adj[i]])
						state.setColor(e + this.G.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.G.V, this.BLACK);
					e++;
				}
			}
		}
		state.setMark('寻找与' + V +'相连的节点');
    	dynamic.stateList.push(state);
    }
}
var cc = {
	marked: null,
	id: null,
	count: 0,
	locs: null,
	locsOfEnd: null,

	create: function(G) {
		var num = G.V;
		this.id = new Array(num);
		this.marked = new Array(num);
		this.locs = new Array(num);
		this.locsOfEnd = new Array(num);
		for (var i = 0; i < num; ++i) {
			this.id[i] = 0;
			this.marked[i] = false;
		}
		dynaOfCC.location(num, this.locs, this.locsOfEnd);
		dynaOfCC.getGraph(G);
		dynamic.create();

		dynaOfCC.stateOfOrigin(this.id, this.locs, this.locsOfEnd);
		for (var s = 0; s < num; ++s) {
			if (!this.marked[s]) {
				this.count++;
				this.DFS(G, s);
			}
		}
		dynaOfCC.stateOfOrigin(this.id, this.locs, this.locsOfEnd);
	},

	present: function() {
		if (!guard.isSafe) {
			cont = '';
			for (var i = 0; i < guard.errors.length; ++i)
				cont += guard.errors[i];
			dynaOfCC.drawErrors(cont);

			return ;
		}

		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfCC.animInterval);
	    	dynaOfCC.animInterval = setInterval( function() {

		    	dynaOfCC.drawCurrentState(dynamic.stateList[dynaOfCC.current]);
		    	if (dynaOfCC.current < len - 1)
		    		dynaOfCC.current++;
		    	else
		    		clearInterval(dynaOfCC.animInterval);
	        }, dynaOfCC.transitionTime);

		}
	},

	DFS: function(G, v) {
		var vertices = G.adjOfV(v),
			num = vertices.length;
		this.marked[v] = true;
		this.id[v] = this.count;
		if (num == 0)
			dynaOfCC.stateOfSelect(v, this.id, this.marked, this.locs, this.locsOfEnd);
		for (var i = 0; i < num; ++i) {
			var w = vertices[i];
			dynaOfCC.stateOfSelect(v, this.id, this.marked, this.locs, this.locsOfEnd);
			if (!this.marked[w]) {
				dynaOfCC.stateOfTravel(v, w, this.id, this.marked, this.locs, this.locsOfEnd);
				this.DFS(G, w);
			}
		}
	}
}