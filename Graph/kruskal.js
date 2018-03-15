var dynaOfKruskal = {
	WHITE: '#FFFFFF',
	BLACK: '#000000',
	COLOR_OF_ORIGIN: '#85D0D4',
    COLOR_OF_VISITED: '#03B82E',
    COLOR_OF_SELECT: '#EE7081',
    COLOR_OF_ADD: '#FFB454',

	widthOfSVG: 1000,
	ewG: null,
    current: 0,
    animInterval: null,
    transitionTime: 2000,

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

    stateOfOrigin: function(edges, mst, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = new State(this.ewG.V + this.ewG.E);
    	for (var i = 0; i < this.ewG.V; ++i) {
    		state.setLocation(i, locs[i]);
    		state.setContent(i, i);
    		state.setColor(i, this.WHITE);
    	}
    	
    	for (var i = 0; i < mst.size(); ++i) {
    		var e = mst.elems[i],
    			v = e.either(),
    			w = e.other(v);

    		state.setColor(v, this.COLOR_OF_VISITED);
    		state.setColor(w, this.COLOR_OF_VISITED);
    	}

    	for (var i = 0; i < edges.length; ++i) {
    		var e = edges[i],
    			v = e.either(),
    			w = e.other(v);
    		state.setContent(i + this.ewG.V, e.getWeight());
    		if (v == w) {
    			state.setLocation(i + this.ewG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
				state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
    		}
    		else {
	    		state.setLocation(i + this.ewG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[w].x+', '+locs[w].y);
				state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
    		}

    		for (var j = 0; j < mst.size(); ++j) {
    			eOfMst = mst.elems[j],
    			vOfMst = eOfMst.either(),
    			wOfMst = eOfMst.other(vOfMst);
    			if ((vOfMst == v && wOfMst == w ) || (vOfMst == w && wOfMst == v))
					state.setColor(i + this.ewG.V, this.COLOR_OF_VISITED);
    		}
    	}

    	dynamic.stateList.push(state);
    },

    stateOfAdd: function(E, edges, mst, locs, locsOfEnd) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.ewG.V; ++i)
    		state.setColor(i, this.WHITE);

    	for (var i = 0; i < mst.size(); ++i) {
    		var e = mst.elems[i],
    			v = e.either(),
    			w = e.other(v);

    		state.setColor(v, this.COLOR_OF_VISITED);
    		state.setColor(w, this.COLOR_OF_VISITED);
    	}

    	for (var i = 0; i < edges.length; ++i) {
    		var e = edges[i],
    			v = e.either(),
    			w = e.other(v),
    			vOfE = E.either(),
    			wOfE = E.other(vOfE);
    		state.setContent(i + this.ewG.V, e.getWeight());
    		if (v == w) {
    			state.setLocation(i + this.ewG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
				state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
    		}
    		else {
	    		state.setLocation(i + this.ewG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[w].x+', '+locs[w].y);
				if ((vOfE == v && wOfE == w ) || (vOfE == w && wOfE == v))
					state.setColor(i + this.ewG.V, this.COLOR_OF_ADD);
				else
					state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
    		}
    		
    		for (var j = 0; j < mst.size(); ++j) {
    			eOfMst = mst.elems[j],
    			vOfMst = eOfMst.either(),
    			wOfMst = eOfMst.other(vOfMst);
    			if ((vOfMst == v && wOfMst == w ) || (vOfMst == w && wOfMst == v))
					state.setColor(i + this.ewG.V, this.COLOR_OF_VISITED);
    		}
    	}

		state.setMark('将边' + E.toString() + '加入到最小生成树中');
    	dynamic.stateList.push(state);
    },

    stateOfSelect: function(E, edges, mst, locs, locsOfEnd, cont) {
    	var pi = Math.PI,
		    outR = 21,
		    r = outR * Math.sin(3 * pi / 8) / Math.sin(pi / 4);

    	var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
    	for (var i = 0; i < this.ewG.V; ++i)
    		state.setColor(i, this.WHITE);

    	for (var i = 0; i < mst.size(); ++i) {
    		var e = mst.elems[i],
    			v = e.either(),
    			w = e.other(v);

    		state.setColor(v, this.COLOR_OF_VISITED);
    		state.setColor(w, this.COLOR_OF_VISITED);
    	}

    	for (var i = 0; i < edges.length; ++i) {
    		var e = edges[i],
    			v = e.either(),
    			w = e.other(v),
    			vOfE = E.either(),
    			wOfE = E.other(vOfE);
    		state.setContent(i + this.ewG.V, e.getWeight());
    		if (v == w) {
    			state.setLocation(i + this.ewG.V, 'M '+locs[v].x+' '+locs[v].y+' A '+r+' '+r+',0,1,0,'+locsOfEnd[v].x +' '+locsOfEnd[v].y);
				if (vOfE == v)
					state.setColor(i + this.ewG.V, this.COLOR_OF_SELECT);
				else
					state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
    		}
    		else {
	    		state.setLocation(i + this.ewG.V, 'M'+locs[v].x+', '+locs[v].y+' L' +locs[w].x+', '+locs[w].y);
				if ((vOfE == v && wOfE == w ) || (vOfE == w && wOfE == v))
					state.setColor(i + this.ewG.V, this.COLOR_OF_SELECT);
				else
					state.setColor(i + this.ewG.V, this.COLOR_OF_ORIGIN);
    		}
    		
    		for (var j = 0; j < mst.size(); ++j) {
    			eOfMst = mst.elems[j],
    			vOfMst = eOfMst.either(),
    			wOfMst = eOfMst.other(vOfMst);
    			if ((vOfMst == v && wOfMst == w ) || (vOfMst == w && wOfMst == v))
					state.setColor(i + this.ewG.V, this.COLOR_OF_VISITED);
    		}
    	}

		state.setMark(cont);
    	dynamic.stateList.push(state);
    }
}
var kruskal = {
	mst: null,
	edges: null,
	locs: null,
	locsOfEnd: null,

	create: function(ewG) {
		var num = ewG.V;
		this.locs = new Array(num);
		this.locsOfEnd = new Array(num);
		this.edges = ewG.edges();

		var pq = new MinPQ(this.edges);
		var uf = new UF(num);
		this.mst = new Queue(num);

		dynaOfKruskal.location(num, this.locs, this.locsOfEnd);
		dynaOfKruskal.getGraph(ewG);
		dynamic.create();

		dynaOfKruskal.stateOfOrigin(this.edges, this.mst, this.locs, this.locsOfEnd);
		while(!pq.isEmpty() && this.mst.size() < num - 1) {
			var e = pq.delMin(),
				v = e.either(),
				w = e.other(v);
			dynaOfKruskal.stateOfAdd(e, this.edges, this.mst, this.locs, this.locsOfEnd);
			if (uf.connected(v, w)) {
				var cont = '该边相连的两个顶点已经在最小生成树内';
				dynaOfKruskal.stateOfSelect(e, this.edges, this.mst, this.locs, this.locsOfEnd, cont);
				continue;
			}
			var cont = '将该边放入最小生成树内';
			dynaOfKruskal.stateOfSelect(e, this.edges, this.mst, this.locs, this.locsOfEnd, cont);
			uf.union(v, w);
			this.mst.enqueue(e);
		}
		dynaOfKruskal.stateOfOrigin(this.edges, this.mst, this.locs, this.locsOfEnd);
	},

	present: function() {
        if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfKruskal.drawErrors(cont);

            return ;
        }

		var len = dynamic.stateList.length;
		for (var i = 0; i < len; ++i) {

			clearInterval(dynaOfKruskal.animInterval);
	    	dynaOfKruskal.animInterval = setInterval( function() {

		    	dynaOfKruskal.drawCurrentState(dynamic.stateList[dynaOfKruskal.current]);
		    	if (dynaOfKruskal.current < len - 1)
		    		dynaOfKruskal.current++;
		    	else
		    		clearInterval(dynaOfKruskal.animInterval);
	        }, dynaOfKruskal.transitionTime);

		}
	}
}