var dynaOfPrim = {
	WHITE: '#FFFFFF',
	BLACK: '#000000',
	COLOR_OF_ORIGIN: '#85D0D4',
    COLOR_OF_VISITED: '#03B82E',
    COLOR_OF_SELECT: '#EE7081',
    COLOR_OF_TRAVEL: '#FFB454',

	widthOfSVG: 1000,
	ewG: null,
    current: 0,
    animInterval: null,
    transitionTime: 2500,

    getGraph: function(ewG) { this.ewG = ewG; },

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
    		gOfWei = document.createElementNS(XML, 'g');

    	var svg = document.getElementById('dynaContent');
    	while (svg.lastChild) svg.removeChild(svg.lastChild);

    	for (var e = 0; e < this.ewG.E; ++e) {
    		gOfEdge.appendChild(this.htmlAddEdge(e, state.location[e + this.ewG.V], state.color[e + this.ewG.V]));
    		gOfWei.appendChild(this.htmlAddWei(e, state.content[e + this.ewG.V]));
    	}

    	svg.appendChild(gOfEdge);

    	for (var v = 0; v < this.ewG.V; ++v) {
    		outCircle = this.htmlAddCircle(state.location[v], this.BLACK, outR, widthOfOutStroke);
    		inCircle = this.htmlAddCircle(state.location[v], state.color[v], inR, widthOfInStroke);
    		gOfCircle.appendChild(outCircle);
    		gOfCircle.appendChild(inCircle);
    		gOfTxt.appendChild(this.htmlAddTxt(state.location[v], state.content[v]));
    	}

    	svg.appendChild(gOfCircle);
    	svg.appendChild(gOfWei);
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

    htmlAddEdge: function(index, loc, color) {
    	var widthOfStroke = 5,
		    XML = 'http://www.w3.org/2000/svg';
		var path = document.createElementNS(XML, 'path');
		path.setAttribute('id', 'e' + index);
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

    htmlAddWei: function(index, wei) {
    	var fontSize = 16,
		    XML = 'http://www.w3.org/2000/svg',
		    XLINK = 'http://www.w3.org/1999/xlink';
		var text = document.createElementNS(XML, 'text');
		text.setAttribute('fill', this.BLACK);
		text.setAttribute('font-size', fontSize);
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle');

        var textpath = document.createElementNS(XML, 'textPath');
        textpath.setAttributeNS(XLINK, 'href', '#e' + index);
        textpath.setAttribute('startOffset', '40%');

        var tspan = document.createElementNS(XML, 'tspan');
        tspan.setAttribute('dy', -5);
        tspan.textContent = wei;

        textpath.appendChild(tspan);
        text.appendChild(textpath);
        return text;
    },

    stateOfOrigin: function(marked, edges, edgeTo, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = new State(this.ewG.V + this.ewG.E);
    	for (var i = 0; i < this.ewG.V; ++i) {
    		state.setLocation(i, locs[i]);
    		state.setContent(i, i);
    		if (marked[i]) state.setColor(i, this.COLOR_OF_VISITED);
    		else state.setColor(i, this.WHITE);
    	}
    	
    	for (var i = 0; i < edges.length; ++i) {
			var e = edges[i],
				v = e.either();
				w = e.other(v);

			state.setContent(i + this.ewG.V, e.getWeight());

			if (v == w) {
				state.setLocation(i + this.ewG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
				state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
			}
			else {
				state.setLocation(i + this.ewG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[w].x+', '+locs[w].y);
				if (edgeTo[w] == v || edgeTo[v] == w)
					state.setColor(i + this.ewG.V, this.COLOR_OF_VISITED);
				else
					state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
			}
		}

    	dynamic.stateList.push(state);
    },

    stateOfTravel: function(V, W, marked, edges, edgeTo, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.ewG.V; ++i) {
    		if (i == W) state.setColor(i, this.COLOR_OF_TRAVEL);
    		else if (marked[i]) state.setColor(i, this.COLOR_OF_VISITED);
    		else state.setColor(i, this.WHITE);
    	}

    	for (var i = 0; i < edges.length; ++i) {
			var e = edges[i],
				v = e.either();
				w = e.other(v);
			if (v == w) {
				state.setLocation(i + this.ewG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
				state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
			}
			else {
				state.setLocation(i + this.ewG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[w].x+', '+locs[w].y);
				if (v == V && w == W || w == V && v == W)
					state.setColor(i + this.ewG.V, this.COLOR_OF_TRAVEL);
				else if (edgeTo[w] == v || edgeTo[v] == w)
					state.setColor(i + this.ewG.V, this.COLOR_OF_VISITED);
				else
					state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
			}
		}

		state.setMark('已有生成树通过' + V + '到达' + W + '有更小的距离');
    	dynamic.stateList.push(state);
    },

    stateOfSelect: function(V, marked, edges, edgeTo, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.ewG.V; ++i) {
    		if (i == V) state.setColor(i, this.COLOR_OF_SELECT);
    		else if (marked[i]) state.setColor(i, this.COLOR_OF_VISITED);
    		else state.setColor(i, this.WHITE);
    	}

    	for (var i = 0; i < edges.length; ++i) {
			var e = edges[i],
				v = e.either();
				w = e.other(v);
			if (v == w) {
				state.setLocation(i + this.ewG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
				state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
			}
			else {
				state.setLocation(i + this.ewG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[w].x+', '+locs[w].y);
				if (edgeTo[w] == v || edgeTo[v] == w)
					state.setColor(i + this.ewG.V, this.COLOR_OF_VISITED);
				else
					state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
			}
		}
		state.setMark(V +'到最小生成树的距离最短，将其作为最小生成树节点');
    	dynamic.stateList.push(state);
    }
}
var prim = {
	edgeTo: null,
	distTo: null,
	marked: null,
	edges: null,
	locs: null,
	locsOfEnd: null,
	pq: null,

	create: function(ewG) {
		var num = ewG.V;
		this.edgeTo = new Array(num);
		this.distTo = new Array(num);
		this.marked = new Array(num);
		this.locs = new Array(num);
		this.locsOfEnd = new Array(num);
		this.edges = ewG.edges();
		for (var v = 0; v < num; ++v) {
			this.edgeTo[v] = null;
			this.distTo[v] = Number.POSITIVE_INFINITY;
			this.marked[v] = false;
		}

		dynaOfPrim.location(num, this.locs, this.locsOfEnd);
		dynaOfPrim.getGraph(ewG);
		dynamic.create();

		dynaOfPrim.stateOfOrigin(this.marked, this.edges, this.edgeTo, this.locs, this.locsOfEnd);
		this.pq = new IndexMinPQ(num);
		this.distTo[0] = 0.0;
		this.pq.insert(0, 0.0);
		while (!this.pq.isEmpty())
			this.visit(ewG, this.pq.delMin());

		dynaOfPrim.stateOfOrigin(this.marked, this.edges, this.edgeTo, this.locs, this.locsOfEnd);
	},

	present: function() {
		if (!guard.isSafe) {
			cont = '';
			for (var i = 0; i < guard.errors.length; ++i)
				cont += guard.errors[i];
			dynaOfPrim.drawErrors(cont);

			return ;
		}
		
		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfPrim.animInterval);
	    	dynaOfPrim.animInterval = setInterval( function() {

		    	dynaOfPrim.drawCurrentState(dynamic.stateList[dynaOfPrim.current]);
		    	if (dynaOfPrim.current < len - 1)
		    		dynaOfPrim.current++;
		    	else
		    		clearInterval(dynaOfPrim.animInterval);
	        }, dynaOfPrim.transitionTime);

		}
	},

	visit: function(ewG, v) {
		var edgeOfV = ewG.adjOfV(v),
			num = edgeOfV.length;
		this.marked[v] = true;
		dynaOfPrim.stateOfSelect(v, this.marked, this.edges, this.edgeTo, this.locs, this.locsOfEnd);
		for (var i = 0; i < num; ++i) {
			var e = edgeOfV[i];
			var w = e.other(v);
			if (this.marked[w]) continue;
			if (e.getWeight() < this.distTo[w]) {
				dynaOfPrim.stateOfTravel(v, w, this.marked, this.edges, this.edgeTo, this.locs, this.locsOfEnd);
				this.edgeTo[w] = v;
				this.distTo[w] = e.getWeight();
				if (this.pq.contains(w)) this.pq.change(w, this.distTo[w]);
				else this.pq.insert(w, this.distTo[w]);
			}
		}
	}
}