function State (capacity) {
	this.location = new Array(capacity);
	this.color = new Array(capacity);
	this.content = new Array(capacity);
	this.mark = "";
}

State.prototype.copy = function() {
	var len = this.location.length;
	var newState = new State(len);
	for (var i = 0; i < len; ++i) {
		newState.location[i] = this.location[i];
		newState.color[i] = this.color[i];
		newState.content[i] = this.content[i];
	}
	newState.mark = "";
	return newState;
}

State.prototype.setLocation = function(index, loc) { this.location[index] = loc; }

State.prototype.setColor = function(index, color) { this.color[index] = color; }

State.prototype.setContent = function(index, cont) { this.content[index] = cont; }

State.prototype.setMark = function(str) { this.mark = str; }

function Location (x, y) {
	this.x = x;
	this.y = y;
}

function Queue (capacity) {
	this.front = 0;
	this.rear = 0;
	this.N = capacity;
	this.elems = new Array(capacity);
}
Queue.prototype.enqueue = function(elem) {
	if ((this.rear + 1) % this.N != this.front) {
		this.elems[this.rear] = elem;
		this.rear = (this.rear + 1) % this.N;
	}
}

Queue.prototype.dequeue = function() {
	if (!this.isEmpty()) {
		var elem = this.elems[this.front];
		this.front = (this.front + 1) % this.N;
		return elem;
	}
}
Queue.prototype.isEmpty = function() {
	return this.rear == this.front
}
Queue.prototype.size = function() {
	return (this.rear - this.front + this.N ) % this.N;
}

function DirectedCycle(diG) {
	var num = diG.V;
	this.cycle = null;
	this.onStack = new Array(num);
	this.edgeTo = new Array(num);
	this.marked = new Array(num);
	for (var v = 0; v < num; ++v)
		this.marked[v] = false;

	for (var v = 0; v < num; ++v)
		if (!this.marked[v])
			this.DFS(diG, v);
}

DirectedCycle.prototype.DFS = function(diG, v) {
	var vertices = diG.adjOfV(v),
		num = vertices.length;
	this.onStack[v] = true;
	this.marked[v] = true;
	for (var i = 0; i < num; ++i) {
		var w = vertices[i];
		if (this.hasCycle()) return ;
		else if (!this.marked[w]) {
			this.edgeTo[w] = v;
			this.DFS(diG, w);
		}
		else if (this.onStack[w]) {
			this.cycle = new Array(0);
			for (var x = v; x != w; x = this.edgeTo[x])
				this.cycle.push(x);
			this.cycle.push(w);
			this.cycle.push(v);
		}
	}
	this.onStack[v] = false;
}

DirectedCycle.prototype.hasCycle = function() { this.cycle != null; }

function DepthFirstOrder (diG) {
	var num = diG.V;
	this.marked = new Array(num);
	this.pre = new Queue(num);
	this.post = new Queue(num);
	this.reversePost = new Array(0);
	for (var v = 0; v < num; ++v)
		this.marked[v] = false;

	for (var v = 0; v < num; ++v)
		if (!this.marked[v])
			this.DFS(diG, v);
}

DepthFirstOrder.prototype.DFS = function(diG, v) {
	var vertices = diG.adjOfV(v),
		num = vertices.length;
	this.pre.enqueue(v);
	this.marked[v] = true;
	for (var i = 0; i < num; ++i) {
		var w = vertices[i];
		if (!this.marked[w])
			this.DFS(diG, w);
	}
	this.post.enqueue(v);
	this.reversePost.push(v);
}

DepthFirstOrder.prototype.getReversePost = function() { return this.reversePost; }

function Edge(v, w, weight) {
	this.v = v;
	this.w = w;
	this.weight = weight;
}

Edge.prototype.getWeight = function() { return this.weight; }

Edge.prototype.either = function() { return this.v; }

Edge.prototype.other = function(v) {
	if (v == this.v) return this.w;
	else return this.v;
}

Edge.prototype.compareTo = function(that) {
	if (this.getWeight() < that.getWeight()) return -1;
	else if (this.getWeight() > that.getWeight()) return +1;
	else return 0;
}

Edge.prototype.toString = function() { return this.v + ' - ' + this.w + ' ' + this.weight; }

function IndexMinPQ(capacity) {
	this.pq = new Array(capacity + 1);
	this.qp = new Array(capacity + 1);
	this.keys = new Array(capacity + 1);
	this.N = 0;

	for (var i = 0; i <= capacity; ++i)
		this.qp[i] = -1;
}

IndexMinPQ.prototype.isEmpty = function() { return this.N == 0; }

IndexMinPQ.prototype.size = function() { return this.N; }

IndexMinPQ.prototype.delMin = function() {
	var indexOfMin = this.pq[1];
	this.exch(1, this.N--);
	this.sink(1);
	this.keys[indexOfMin] = null;
	this.qp[indexOfMin] = -1;
	return indexOfMin;
}

IndexMinPQ.prototype.min = function() { return this.keys[this.pq[1]]; }

IndexMinPQ.prototype.contains = function(k) { return this.qp[k] != -1; }

IndexMinPQ.prototype.change = function(k, item) {
	this.keys[k] = item;
	this.swim(this.qp[k]);
	this.sink(this.qp[k]);
}

IndexMinPQ.prototype.insert = function(k, item) {
	this.N++;
	this.qp[k] = this.N;
	this.pq[this.N] = k;
	this.keys[k] = item;
	this.swim(this.N);
}

IndexMinPQ.prototype.swim = function(k) {
	while (k > 1 && this.less(k, Math.floor(k / 2))) {
		this.exch(Math.floor(k / 2), k);
		k = Math.floor(k / 2);
	}
}

IndexMinPQ.prototype.sink = function(k) {
	while (2 * k <= this.N) {
		var j = 2 * k;
		if (j < this.N && this.less(j + 1, j)) j++;
		if (!this.less(j, k)) break;
		this.exch(k, j);
		k = j;
	}
}

IndexMinPQ.prototype.less = function(i, j) { return this.keys[this.pq[i]] < this.keys[this.pq[j]]; }

IndexMinPQ.prototype.exch = function(i, j) {
	var t = this.pq[i]; 
	this.pq[i] = this.pq[j];
	this.pq[j] = t;
	this.qp[this.pq[i]] = i;
	this.qp[this.pq[j]] = j;
}

function UF(capacity) {
	this.count = capacity;
	this.id =  new Array(capacity);
	this.sz = new Array(capacity);
	for (var i = 0; i < capacity; ++i) {
		this.id[i] = i;
		this.sz[i] = 1;
	}
}

UF.prototype.connected = function(p, q) {
	return this.find(p) == this.find(q);
}

UF.prototype.find =function(p) {
	while (p != this.id[p])
		p = this.id[p];
	return p;
}

UF.prototype.union = function(p, q) {
	var i = this.find(p),
		j = this.find(q);
	if (i == j) return ;

	if (this.sz[i] < this.sz[j]) {
		this.id[i] = j;
		this.sz[j] += this.sz[i];
	}
	else {
		this.id[j] = i;
		this.sz[i] += this.sz[j];
	}
	this.count--;
}

function MinPQ(elems) {
	var len = elems.length;
	this.pq = new Array(1);
	this.N = len;

	for (var i = 1; i < len + 1; ++i)
		this.pq[i] = elems[i - 1];

	for (var k = Math.floor(len / 2); k >= 1; --k)
		this.sink(k);
}

MinPQ.prototype.isEmpty = function() { return this.N == 0; }

MinPQ.prototype.size = function() { return this.N; }

MinPQ.prototype.insert = function(v) {
	this.pq[++this.N] = v;
	this.swim(this.N);
}

MinPQ.prototype.delMin = function() {
	var Min = this.pq[1];
	this.exch(1, this.N--);
	this.pq[this.N + 1] = null;
	this.sink(1);
	return Min;
}

MinPQ.prototype.swim = function(k) {
	while (k > 1 && this.less(Math.floor(k / 2), k)) {
		this.exch(Math.floor(k / 2), k);
		k = Math.floor(k / 2);
	}
}

MinPQ.prototype.sink = function(k) {
	while (2 * k <= this.N) {
		var j = 2 * k;
		if (j < this.N && this.less(j, j + 1)) j++;
		if (!this.less(k, j)) break;
		this.exch(k, j);
		k = j;
	}
}

MinPQ.prototype.less = function(i, j) { return this.pq[j].compareTo(this.pq[i]) < 0; }

MinPQ.prototype.exch = function(i, j) {
	var t = this.pq[i]; 
	this.pq[i] = this.pq[j];
	this.pq[j] = t;
}

function DirectedEdge(v, w, weight) {
	this.v = v;
	this.w = w;
	this.weight = weight;
}

DirectedEdge.prototype.getWeight = function() { return this.weight; }

DirectedEdge.prototype.from = function() { return this.v; }

DirectedEdge.prototype.to = function() { return this.w; }

DirectedEdge.prototype.compareTo = function(that) {
	if (this.getWeight() < that.getWeight()) return -1;
	else if (this.getWeight() > that.getWeight()) return +1;
	else return 0;
}

DirectedEdge.prototype.toString = function() { return this.v + ' -> ' + this.w + ' ' + this.weight; }

function Node(key, N, color) {
	this.key = key;
	this.N = N;
	this.left = null;
	this.right = null;
	if (color == null || color == undefined) this.color = null;
	else this.color = color;
}

var graph = {
	MaxOfV: 15,
	V: 0,
	E: 0,
	adj: null,

	create: function(V) {
		guard.isOver(V, this.MaxOfV);
		if (!guard.isSafe) return ;

		this.V = V;
		this.E = 0;
		this.adj = new Array(V);
		for (var v = 0; v < this.V; ++v)
			this.adj[v] = new Array(0);
	},

	addEdge: function(v, w) {
		guard.isExistOfEdge(v, w, 1, this.V);
		if (!guard.isSafe) return ;

		this.adj[v].push(w);
		if (v != w)
			this.adj[w].push(v);
		this.E++;
	},

	adjOfV: function(v) { return this.adj[v]; }
}

var diGraph = {
	MaxOfV: 15,
	V: 0,
	E: 0,
	adj: null,
	reAdj: null,

	create: function(V) {
		guard.isOver(V, this.MaxOfV);
		if (!guard.isSafe) return ;

		this.V = V;
		this.E = 0;
		this.adj = new Array(V);
		this.reAdj = new Array(V);
		for (var v = 0; v < this.V; ++v) {
			this.adj[v] = new Array(0);
			this.reAdj[v] = new Array(0);
		}
	},

	addEdge: function(v, w) {
		guard.isExistOfEdge(v, w, 1, this.V);
		if (!guard.isSafe) return ;

		this.adj[v].push(w);
		this.reAdj[w].push(v);
		this.E++;
	},

	adjOfV: function(v) { return this.adj[v]; },

	reAdjOfV: function(v) { return this.reAdj[v]; },

	reverse: function() {
		for (var i = 0; i < this.V; ++i) {
			var tmp = this.adj[i];
			this.adj[i] = this.reAdj[i];
			this.reAdj[i] = tmp;
		}
	}
}

var ewGraph = {
	MaxOfV: 15,
	V: 0,
	E: 0,
	adj: null,

	create: function(V) {
		guard.isOver(V, this.MaxOfV);
		if (!guard.isSafe) return ;

		this.V = V;
		this.E = 0;
		this.adj = new Array(V);

		for (var v = 0; v < V; ++v)
			this.adj[v] = new Array(0);
	},

	addEdge: function(v, w, weight) {
		guard.isExistOfEdge(v, w, weight, this.V);
		if (!guard.isSafe) return ;

		e = new Edge(v, w, weight);
		this.adj[v].push(e);
		this.adj[w].push(e);
		this.E++;
	},

	adjOfV: function(v) { return this.adj[v]; },

	edges: function() {
		var arr = new Array(0);
		for (var v = 0; v < this.V; ++v) {
			var edge = this.adj[v];
			for (var e = 0; e < edge.length; ++e) {
				if (edge[e].other(v) > v)
					arr.push(edge[e]);
			}
		}
		return arr;
	}
}

var ewDiGraph = {
	MaxOfV: 15,
	V: 0,
	E: 0,
	adj: null,

	create: function(V) {
		guard.isOver(V, this.MaxOfV);
		if (!guard.isSafe) return ;

		this.V = V;
		this.E = 0;
		this.adj = new Array(V);

		for (var v = 0; v < V; ++v)
			this.adj[v] = new Array(0);
	},

	addEdge: function(v, w, weight) {
		guard.isExistOfEdge(v, w, weight, this.V);
		if (!guard.isSafe) return ;

		e = new DirectedEdge(v, w, weight);
		this.adj[v].push(e);
		this.E++;
	},

	adjOfV: function(v) { return this.adj[v]; },

	edges: function() {
		var arr = new Array(0);
		for (var v = 0; v < this.V; ++v) {
			var edges = this.adj[v];
			for (var e = 0; e < edges.length; ++e)
				arr.push(edges[e]);
		}
		return arr;
	}
}


var dynamic = {
	stateList: null,

	create: function() { this.stateList = new Array(0); },

	// disappear: function(elem) {
	// 	var initialOpacity = 1,
	// 		opacityDelta = 1/32,
	// 		opacityLimit = 0,
	// 		current = initialOpacity,
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);
			
	// 	function doAnim() {
	// 		if (current < opacityLimit) {
	// 			cancelAnimationFrame(requestAnimationFrameID);
	// 			return;
	// 		}
	// 		elem.setAttribute("opacity", current);
	// 		current -= opacityDelta;
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);
	// 	}
	// },

	// display: function(elem) {
	// 	var initialOpacity = 0,
	// 		opacityDelta = 1/32,
	// 		opacityLimit = 1,
	// 		current = initialOpacity,
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);
			
	// 	function doAnim() {
	// 		if (current > opacityLimit) {
	// 			cancelAnimationFrame(requestAnimationFrameID);
	// 			return;
	// 		}
	// 		elem.setAttribute("opacity", current);
	// 		current += opacityDelta;
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);
	// 	}
	// },

	// delay: function() {
	// 	var initialTime  = 0,
	// 		timeDelta = 1/64,
	// 		timeLimit = 1,
	// 		currentTime = initialTime,
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);
	// 	function doAnim() {
	// 		if (currentTime > timeLimit) {
	// 			cancelAnimationFrame(requestAnimationFrameID);
	// 			return ;
	// 		}
	// 		currentTime += timeDelta;
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);
	// 	}
	// },

	// fadeOut: function(prio, late) {
	// 	var initialOpacity = 1,
	// 		opacityDelta = 1/16,
	// 		opacityLimit = 0,
	// 		currentOfPrio = initialOpacity,
	// 		currentOfLate = initialOpacity,
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);

	// 	function doAnim() {
	// 		if (currentOfPrio < opacityLimit && currentOfLate < opacityLimit) {
	// 			cancelAnimationFrame(requestAnimationFrameID);
	// 			return;
	// 		}
	// 		prio.setAttribute("opacity", currentOfPrio);
	// 		late.setAttribute("opacity", currentOfLate);
	// 		currentOfPrio -= opacityDelta;
	// 		currentOfLate -= opacityDelta;
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);
	// 	}
	// },

	// fadeIn: function(prio, late) {
	// 	var initialOpacity = 0,
	// 		opacityDelta = 1/16,
	// 		opacityLimit = 1,
	// 		currentOfPrio = initialOpacity,
	// 		currentOfLate = initialOpacity,
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);

	// 	function doAnim() {
	// 		if (currentOfPrio > opacityLimit && currentOfLate > opacityLimit) {
	// 			cancelAnimationFrame(requestAnimationFrameID);
	// 			return;
	// 		}
	// 		prio.setAttribute("opacity", currentOfPrio);
	// 		late.setAttribute("opacity", currentOfLate);
	// 		currentOfPrio += opacityDelta;
	// 		currentOfLate += opacityDelta;
	// 		requestAnimationFrameID = requestAnimationFrame(doAnim);
	// 	}
	// },

	// swapData: function(prio, late) {
	// 	var textOfPrio = prio.getElementsByTagName('text')[0];
	// 	var textOfLate = late.getElementsByTagName('text')[0];
	// 	var tmpText = textOfPrio.textContent;
	// 	textOfPrio.textContent = textOfLate.textContent;
	// 	textOfLate.textContent = tmpText;
	// }
}
