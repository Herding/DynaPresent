var guard = {
	isSafe: true,
	errors: new Array(0),

	isOver: function(capacity, Max) {
		if (!this.isSafe) return ;

		if (Number.isInteger(capacity)) {
			if (this.isSafe && capacity > Max) {
				this.isSafe = false;
				this.errors.push('需创建的元素个数大于最大元素个数，请输入' + '[1, ' + Max + ']中的一个值。');
			}
			else if (capacity <= 0) {
				this.isSafe = false;
				this.errors.push('请输入' + '[1, ' + Max + ']中的一个值。');
			}
		}
		else {
			this.isSafe = false;
			this.errors.push('请输入' + '[1, ' + Max + ']中的一个值。');
		}
	},

	isDigit: function(elem) {
		if (!this.isSafe) return ;

		if (Number.isInteger(elem)) {
			if (1 > elem || elem > 100) {
				this.isSafe = false;
				this.errors.push('输入元素' + elem + '不属于[1, 100]之间的区间');
			}
		}
		else {
			this.isSafe = false;
			this.errors.push('输入元素' + elem + '不属于[1, 100]之间的区间');
		}
	},

	isString: function(str) {
		if (!this.isSafe) return ;

		if (typeof str !== 'string') {
			this.isSafe = false;
			this.errors.push(str + '类型不为字符串类型');
		}
	},

	isExistOfNode: function(v, V) {
		if (!this.isSafe) return ;

		if (Number.isInteger(v)) {
			if (v < 0 || v > V) {
				this.isSafe = false;
				this.errors.push('边' + v + '顶点元素不存在');
			}
		}
		else {
			this.isSafe = false;
			this.errors.push('请输入[0, ' + V - 1 + ']之内的值，作为顶点元素');
		}
	},

	isExistOfEdge: function(v, w, wei, V) {
		if (!this.isSafe) return ;

		this.isExistOfNode(v, V);

		this.isExistOfNode(w, V);

		this.isDigit(wei);
	},

	isInRange: function(elem, capacity) {
		if (!this.isSafe) return ;

		if (Number.isInteger(elem)) {
			if (0 > elem || elem >= capacity) {
				this.isSafe = false;
				this.errors.push('输入元素' + elem + '不属于[0, ' + capacity - 1 + ']之间的区间');
			}
		}
		else {
			this.isSafe = false;
			this.errors.push('输入元素' + elem + '不属于[0, ' + capacity - 1 + ']之间的区间');
		}
	},

	isInSet: function(elem, capacity) {
		if (!this.isSafe) return ;

		if (Number.isInteger(elem)) {
			if (1 > elem || elem > capacity) {
				this.isSafe = false;
				this.errors.push('输入元素' + elem + '不属于[1, ' + capacity + ']之间的区间');
			}
		}
		else {
			this.isSafe = false;
			this.errors.push('输入元素' + elem + '不属于[1, ' + capacity + ']之间的区间');
		}
	}
}