var dynaOfQueue = {
    COLOR_OF_ORIGIN: '#85D0D4',
    COLOR_OF_DEQUEUE: '#EE7081',
    COLOR_OF_ENQUEUE: '#92C395',

    widthOfSVG: 1000,
    widthOfElement: 70,
    baseline: 250,
    gap: 6,
    current: 0,
    animInterval: null,
    transitionTime: 2000,

    location: function (locs, capacity) {
        var half = capacity >> 1,
            halfWidthOfSVG = this.widthOfSVG / 2;
            halfOfElement = this.widthOfElement / 2,
            halfOfGap = this.gap / 2,
            totalWidth = this.widthOfElement + this.gap;

        if(capacity % 2) locs[0] = halfWidthOfSVG - halfOfElement - totalWidth * half;
        else locs[0] = halfWidthOfSVG + halfOfGap - totalWidth * half;
        
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
            RX = 10,
            halfOfElement = this.widthOfElement >> 1,
            fontSize = '.48em',
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

    stateOfDequeue: function(front, elems, locs, capacity, Max) {
        var index = front;
        var state = new State(capacity);
        for (var i = 0; i < capacity; ++i) {
            state.setColor(i, this.COLOR_OF_ORIGIN);
            state.setLocation(i, locs[i]);
            state.setContent(i, elems[index]);
            index = (index + 1) % Max;
        }
        dynamic.stateList.push(state);
    },

    stateOfEnqueue: function(front, elems, locs, capacity, Max) {
        var last = capacity - 1,
            index = front;
        var state = new State(capacity);
        for (var i = 0; i < last; ++i) {
            state.setColor(i, this.COLOR_OF_ORIGIN);
            state.setLocation(i, locs[i]);
            state.setContent(i, elems[index]);
            index = (index + 1) % Max;
        }
        state.setColor(last, this.COLOR_OF_ENQUEUE);
        state.setLocation(last, locs[last]);
        state.setContent(last, elems[index]);
        state.setMark(elems[index] + '入队');
        dynamic.stateList.push(state);
    },

    stateOfError: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);
        
        dynamic.stateList.push(state);
    }
}

var queue = {
    MaxOfElement: 8,
    Max: 0,
    front: 0,
    rear: 0,
    N: 0,
    elems: null,
    locs: null,

    create: function(capacity) {
        guard.isOver(capacity, this.MaxOfElement);
        if (!guard.isSafe) return ;
        
        this.elems = new Array(capacity);
        this.locs = new Array(capacity);
        this.front = 0;
        this.rear = 0;
        this.Max = capacity;
        this.N = 0;

        dynaOfQueue.location(this.locs, this.Max);
        dynamic.create();
    },

    present: function() {
        if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfQueue.drawErrors(cont);

            return ;
        }

        var len = dynamic.stateList.length;
        for (var i = 0; i < len; ++i) {
            clearInterval(dynaOfQueue.animInterval);
            dynaOfQueue.animInterval = setInterval( function() {
            dynaOfQueue.drawCurrentState(dynamic.stateList[dynaOfQueue.current]);
            if (dynaOfQueue.current < len - 1)
                dynaOfQueue.current++;
            else
                clearInterval(dynaOfQueue.animInterval);
          }, dynaOfQueue.transitionTime);

        }
    },

    size: function() { return this.N; },

    enqueue: function(elem) {
        if (!guard.isSafe) return ;
        guard.isDigit(elem);
        
        if ((this.rear + 1) % this.Max == this.front) {
            dynaOfQueue.stateOfError('队列未满！无法使' + elem + '入队');
            return ;
        }
        this.elems[this.rear] = elem;
        this.rear = (this.rear + 1) % this.Max;
        this.N++;
        dynaOfQueue.stateOfEnqueue(this.front, this.elems, this.locs, this.size(), this.Max);
        dynaOfQueue.stateOfOrigin(this.size());
    },
    
    dequeue: function() {
        var elem;
        if (this.front == this.rear) {
            dynaOfQueue.stateOfError('队列为空！无法使' + elem + '出队');
            return ;
        }
        else {
            var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
            state.setColor(0, dynaOfQueue.COLOR_OF_DEQUEUE);
            state.setMark(this.elems[this.front] + '出队');
            dynamic.stateList.push(state);
            elem = this.elems[this.front];
            this.front = (this.front + 1) % this.Max;
            this.N--;
            dynaOfQueue.stateOfDequeue(this.front, this.elems, this.locs, this.size(), this.Max);
        }
    }
}