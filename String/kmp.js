var dynaOfKMP = {
	COLOR_OF_ORIGIN: '#18C29C',
    COLOR_OF_COMPARE: '#2EBBD1',

    widthOfSVG: 1000,
    widthOfElement: 40,
    baselineOfTxt: 150,
    baselineOfPat: 250,
    lenOfTxt: 0,
    gap: 5,
    current: 0,
    animInterval: null,
    transitionTime: 2000,

    getLengthOfTxt: function(len) { this.lenOfTxt = len; },

    locationOfTxt: function (locs, capacity) {
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

    locationOfPat: function (indexOfTxt, locsOfTxt, capaOfTxt, indexOfPat, locsOfPat, capaOfPat) {
    	var delta = indexOfTxt - indexOfPat;
        for (var i = 0; i < capaOfPat; ++i) {
        	if (i + delta < capaOfTxt) locsOfPat[i] = locsOfTxt[i + delta];
        	else locsOfPat[i] = null;
        }
    },

    drawCurrentState: function(state) {
    	var yOfTxt = this.baselineOfTxt - this.widthOfElement,
            yOfPat = this.baselineOfPat - this.widthOfElement;
        var svg = document.getElementById('dynaContent');
        while (svg.lastChild) svg.removeChild(svg.lastChild);

        var len = state.location.length;
        for (var i = 0; i < len; ++i) {
            var loc = state.location[i];
            var color = state.color[i];
            var content = state.content[i];
            if (loc == null) break;
            if (i < this.lenOfTxt) svg.appendChild(this.htmlAddElem(loc, yOfTxt, color, content));
            else svg.appendChild(this.htmlAddElem(loc, yOfPat, color, content));
        }
        svg = document.getElementById('dynaMark');
        while (svg.lastChild) svg.removeChild(svg.lastChild);
        svg.appendChild(this.htmlAddMark(state.mark));
    },

    htmlAddElem: function(X, Y, color, content) {
        var RX = 6,
            halfOfElement = this.widthOfElement >> 1,
            fontSize = '.30em',
            XML = 'http://www.w3.org/2000/svg';

        var g = document.createElementNS(XML, 'g');
        g.setAttribute('transform', 'translate(' + X + ','+ Y + ')');
        
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

    stateOfOrigin: function(capacity, mark) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        for (var i = 0; i < capacity; ++i)
        	state.setColor(i, this.COLOR_OF_ORIGIN);
        state.setMark(mark);
        dynamic.stateList.push(state);
    },

    stateOfCompare: function(indexOfTxt, indexOfPat, txt, pat, locsOfTxt, locsOfPat) {
    	var lenOfTxt = txt.length,
    		lenOfPat = pat.length;
    		capacity = lenOfPat + lenOfTxt;
    	this.locationOfPat(indexOfTxt, locsOfTxt, lenOfTxt,indexOfPat, locsOfPat, lenOfPat);
        var state = new State(capacity);
        for (var i = 0; i < capacity; ++i) {
            state.setColor(i, this.COLOR_OF_ORIGIN);
            if (i < lenOfTxt) {
            	state.setLocation(i, locsOfTxt[i]);
            	state.setContent(i, txt[i]);
            }
            else {
            	state.setLocation(i, locsOfPat[i - lenOfTxt]);
            	state.setContent(i, pat[i - lenOfTxt]);
            }
        }
        state.setColor(indexOfTxt, this.COLOR_OF_COMPARE);
        state.setColor(lenOfTxt + indexOfPat, this.COLOR_OF_COMPARE);
        state.setMark(txt[indexOfTxt] + '与' + pat[indexOfPat] + '比较');
        dynamic.stateList.push(state);
    },

    stateOfWarn: function(cont) {
        var state = dynamic.stateList[dynamic.stateList.length - 1].copy();
        state.setMark(cont);

        dynamic.stateList.push(state);
    }
}
var kmp = {
	MaxLength: 20,
	pat: null,
	txt: null,
	dfa: null,
	lenOfPat: 0,
	lenOfTxt: 0,
	locsOfPat: null,
	locsOfTxt: null,

	create: function(txt, pat) {
		this.pat = pat;
		this.txt = txt;
		this.lenOfPat = pat.length;
		this.lenOfTxt = txt.length;
        guard.isString(txt);
        guard.isString(pat);
        if (!guard.isSafe) return ;

		if (this.lenOfPat > this.MaxLength) {
            dynaOfKMP.stateOfWarn('模式串的长度过长，20个字符之后的字符已截去');
			this.lenOfPat = this.MaxLength;
		}
		if (this.lenOfTxt > this.MaxLength) {
			dynaOfKMP.stateOfWarn('文本串的长度过长，20个字符之后的字符已截去');
			this.lenOfTxt = this.MaxLength;
		}
		this.dfa = new Array(this.lenOfPat);
		this.locsOfPat = new Array(this.lenOfPat);
		this.locsOfTxt = new Array(this.lenOfTxt);

		this.dfa[0] = -1;
		var i = 0,
			j = -1;
		while (i < this.lenOfPat) {
			if (j == -1 || this.pat[i] == this.pat[j]) {
				++i, ++j;
				if (this.pat[i] != this.pat[j]) this.dfa[i] = j;
				else this.dfa[i] = this.dfa[j];
			}
			else j = this.dfa[j];
		}

		dynaOfKMP.locationOfTxt(this.locsOfTxt, this.lenOfTxt);
		dynaOfKMP.getLengthOfTxt(this.lenOfTxt);
		dynamic.create();
	},

	present: function() {
        if (!guard.isSafe) {
            cont = '';
            for (var i = 0; i < guard.errors.length; ++i)
                cont += guard.errors[i];
            dynaOfKMP.drawErrors(cont);

            return ;
        }

		var len = dynamic.stateList.length;
        for (var i = 0; i < len; ++i) {
            clearInterval(dynaOfKMP.animInterval);
            dynaOfKMP.animInterval = setInterval( function() {
            dynaOfKMP.drawCurrentState(dynamic.stateList[dynaOfKMP.current]);
            if (dynaOfKMP.current < len - 1)
                dynaOfKMP.current++;
            else
                clearInterval(dynaOfKMP.animInterval);
          }, dynaOfKMP.transitionTime);

        }
    },

	search: function(pos) {
        if (pos == undefined || pos == null) pos = 0;
        
        if (!guard.isSafe) return ;
        guard.isInRange(pos, this.txt.length);

		var i = pos,
			j = 0;
		while (i < this.lenOfTxt && j < this.lenOfPat) {
			if (j == -1) {
				dynaOfKMP.stateOfOrigin(this.lenOfTxt + this.lenOfPat, '对比元素不一致,主串后移一位');
				++i, ++j;
				continue;
			}
			dynaOfKMP.stateOfCompare(i, j, this.txt, this.pat, this.locsOfTxt, this.locsOfPat);
			if (this.txt[i] == this.pat[j]) {
				var mark = '';
				++i, ++j;
				if (j < this.lenOfPat) mark = ',主串、模式串均后移一位';
				dynaOfKMP.stateOfOrigin(this.lenOfTxt + this.lenOfPat, '对比元素一致' + mark);
			}
			else {
				var mark = '';
				j = this.dfa[j];
				if (j != -1) mark = ',模式串退回至' + j;
				dynaOfKMP.stateOfOrigin(this.lenOfTxt + this.lenOfPat, '对比元素不一致' + mark);
			}
		}
		if (j >= this.lenOfPat) dynaOfKMP.stateOfOrigin(this.lenOfTxt + this.lenOfPat, '模式串与主串匹配成功');
		else dynaOfKMP.stateOfOrigin(this.lenOfTxt + this.lenOfPat, '模式串与主串匹配失败');
	}
}