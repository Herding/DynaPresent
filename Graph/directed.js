var dynaOfDi = {
	WHITE: '#FFFFFF',
	BLACK: '#000000',
    COLOR_OF_CONNECTED: '#85D0D4',
    COLOR_OF_SELECT: '#EE7081',
    COLOR_OF_TRAVEL: '#FF7426',

	widthOfSVG: 1000,
	diG: null,
    current: 0,
    animInterval: null,
    transitionTime: 2000,

    getGraph: function(diG) { this.diG = diG; },

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

    	svg.appendChild(this.htmlAddArrow());

    	num = state.location.length - this.diG.V;

    	for (var v = 0; v < this.diG.V; ++v) {
    		outCircle = this.htmlAddCircle(state.location[v], this.BLACK, outR, widthOfOutStroke);
    		inCircle = this.htmlAddCircle(state.location[v], state.color[v], inR, widthOfInStroke);
    		gOfCircle.appendChild(outCircle);
    		gOfCircle.appendChild(inCircle);
    		gOfTxt.appendChild(this.htmlAddTxt(state.location[v], state.content[v]));
    	}

    	for (var e = 0; e < num; ++e)
    		gOfEdge.appendChild(this.htmlAddEdge(state.location[e + this.diG.V], state.color[e + this.diG.V]));

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
		if (loc.indexOf('A') != -1)
			path.setAttribute('style', 'marker-end:url(#arrowOfLoop)');
		else
			path.setAttribute('style', 'marker-end:url(#arrowOfLine)');
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

    htmlAddArrow: function() {
    	var len = dynamic.stateList.length,
			XML = 'http://www.w3.org/2000/svg',
		    defs = document.createElementNS(XML, 'defs'),
		    markerOfLine = document.createElementNS(XML, 'marker'),
		    markerOfLoop = document.createElementNS(XML, 'marker'),
		    pathOfLine = document.createElementNS(XML, 'path');
		    pathOfLoop = document.createElementNS(XML, 'path');

		markerOfLine.setAttribute('id', 'arrowOfLine');
		markerOfLine.setAttribute('viewBox', '0 -5 10 10');
		markerOfLine.setAttribute('markerWidth', 3);
		markerOfLine.setAttribute('markerHeight', 3);
		markerOfLine.setAttribute('orient', 'auto');
		markerOfLine.setAttribute('refX', 21);

		pathOfLine.setAttribute('d', "M0,-5 L10,0 L0,5");
		pathOfLine.setAttribute('fill', 'black');

		markerOfLoop.setAttribute('id', 'arrowOfLoop');
		markerOfLoop.setAttribute('viewBox', '0 -5 10 10');
		markerOfLoop.setAttribute('markerWidth', 3);
		markerOfLoop.setAttribute('markerHeight', 3);
		markerOfLoop.setAttribute('orient', 'auto');
		markerOfLoop.setAttribute('refX', 6);

		pathOfLoop.setAttribute('d', "M0,-5 L10,0 L0,5");
		pathOfLoop.setAttribute('fill', 'black');

		markerOfLine.appendChild(pathOfLine);
		markerOfLoop.appendChild(pathOfLoop);
		defs.appendChild(markerOfLine);
		defs.appendChild(markerOfLoop);
		return defs;
    },

    stateOfOrigin: function(marked, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = new State(this.diG.V + this.diG.E);
    	for (var i = 0; i < this.diG.V; ++i) {
    		state.setLocation(i, locs[i]);
    		state.setContent(i, i);
    		if (marked[i]) state.setColor(i, this.COLOR_OF_CONNECTED);
    		else state.setColor(i, this.WHITE);
    	}
    	
    	for (var v = 0, e = 0; v < this.diG.V; ++v) {
			var adj = this.diG.adjOfV(v);
			for (var i = 0; i < adj.length; ++i) {
				if (adj[i] == v) {
					state.setLocation(e + this.diG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
					if (marked[v])
						state.setColor(e + this.diG.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.diG.V, this.BLACK);
					e++;
				}
				else {
					state.setLocation(e + this.diG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[adj[i]].x+', '+locs[adj[i]].y);
					if (marked[v] && marked[adj[i]])
						state.setColor(e + this.diG.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.diG.V, this.BLACK);
					e++;
				}
			}
		}

    	dynamic.stateList.push(state);
    },

    stateOfTravel: function(V, W, marked, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.diG.V; ++i) {
    		if (i == W) state.setColor(i, this.COLOR_OF_TRAVEL);
    		else if (marked[i]) state.setColor(i, this.COLOR_OF_CONNECTED);
    		else state.setColor(i, this.WHITE);
    	}

    	for (var v = 0, e = 0; v < this.diG.V; ++v) {
			var adj = this.diG.adjOfV(v);
			for (var i = 0; i < adj.length; ++i) {
				if (adj[i] == v) {
					state.setLocation(e + this.diG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
					if (marked[v])
						state.setColor(e + this.diG.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.diG.V, this.BLACK);
					e++;
				}
				else {
					state.setLocation(e + this.diG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[adj[i]].x+', '+locs[adj[i]].y);
					if (marked[v] && marked[adj[i]])
						state.setColor(e + this.diG.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.diG.V, this.BLACK);
					e++;
				}
			}
		}
		state.setMark(V + '可以到达' + W);
    	dynamic.stateList.push(state);
    },

    stateOfSelect: function(V, marked, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.diG.V; ++i) {
    		if (i == V) state.setColor(i, this.COLOR_OF_SELECT);
    		else if (marked[i]) state.setColor(i, this.COLOR_OF_CONNECTED);
    		else state.setColor(i, this.WHITE);
    	}

    	for (var v = 0, e = 0; v < this.diG.V; ++v) {
			var adj = this.diG.adjOfV(v);
			for (var i = 0; i < adj.length; ++i) {
				if (adj[i] == v) {
					state.setLocation(e + this.diG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
					if (marked[v])
						state.setColor(e + this.diG.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.diG.V, this.BLACK);
					e++;
				}
				else {
					state.setLocation(e + this.diG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[adj[i]].x+', '+locs[adj[i]].y);
					if (marked[v] && marked[adj[i]])
						state.setColor(e + this.diG.V, this.COLOR_OF_CONNECTED);
					else
						state.setColor(e + this.diG.V, this.BLACK);
					e++;
				}
			}
		}
		state.setMark('从' + V +'寻找可达节点');
    	dynamic.stateList.push(state);
    }
}

var directed = {
	marked: null,
	locs: null,
	locsOfEnd: null,

	create: function(diG) {
		var num = diG.V;
		this.marked = new Array(num);
		this.locs = new Array(num);
		this.locsOfEnd = new Array(num);
		for (var i = 0; i < num; ++i)
			this.marked[i] = false;

		dynaOfDi.location(num, this.locs, this.locsOfEnd);
		dynaOfDi.getGraph(diG);
		dynamic.create();
	},

	present: function() {
		if (!guard.isSafe) {
			cont = '';
			for (var i = 0; i < guard.errors.length; ++i)
				cont += guard.errors[i];
			dynaOfDi.drawErrors(cont);

			return ;
		}

		var len = dynamic.stateList.length;

		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfDi.animInterval);
	    	dynaOfDi.animInterval = setInterval( function() {

		    	dynaOfDi.drawCurrentState(dynamic.stateList[dynaOfDi.current]);
		    	if (dynaOfDi.current < len - 1)
		    		dynaOfDi.current++;
		    	else
		    		clearInterval(dynaOfDi.animInterval);
	        }, dynaOfDi.transitionTime);

		}
	},

	diOfSingle: function(diG, s) {
		guard.isExistOfNode(s, this.V);
		if (!guard.isSafe) return ;

		dynaOfDi.stateOfOrigin(this.marked, this.locs, this.locsOfEnd);
		this.DFS(diG, s);
		dynaOfDi.stateOfOrigin(this.marked, this.locs, this.locsOfEnd);
	},

	diOfMultiple: function(diG, sources) {
		var len = sources.length;
		for (var i = 0; i < len; ++i) {
			guard.isExistOfNode(sources[i], this.V);
		}
		if (!guard.isSafe) return ;
		
		dynaOfDi.stateOfOrigin(this.marked, this.locs, this.locsOfEnd);
		for (var i = 0; i < len; ++i) {
			var s = sources[i];
			if (!this.marked[s])
				this.DFS(diG, s);
		}
		dynaOfDi.stateOfOrigin(this.marked, this.locs, this.locsOfEnd);
	},

	DFS: function(diG, v) {
		var vertices = diG.adjOfV(v),
			num = vertices.length;
		this.marked[v] = true;
		if (num == 0)
			dynaOfDi.stateOfSelect(v, this.marked, this.locs, this.locsOfEnd);
		for (var i = 0;i < num; ++i) {
			var w = vertices[i];
			dynaOfDi.stateOfSelect(v, this.marked, this.locs, this.locsOfEnd);
			if (!this.marked[w]) {
				dynaOfDi.stateOfTravel(v, w, this.marked, this.locs, this.locsOfEnd);
				this.DFS(diG, w);
			}
		}
	}
}