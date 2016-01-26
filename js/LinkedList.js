THREE.LinkedListNode = function(value){
	this.data = value;
	this.prev = null;
	this.next = null;
}

THREE.LinkedListNode.prototype.getValue = function(){
	return this.data;
}

THREE.LinkedListNode.prototype.getPrev = function(){
	return this.prev
}

THREE.LinkedListNode.prototype.getNext = function(){
	return this.next
}

THREE.LinkedList = function(){
	this.head = null;
	this.current = null;
	this.tail = null;
	this.length = 0;
}

THREE.LinkedList.prototype.getHead = function(){
	return this.head;
}

THREE.LinkedList.prototype.getCurrent = function(){
	return this.current;
}

THREE.LinkedList.prototype.getTail = function(){
	return this.tail;
}

THREE.LinkedList.prototype.getLength = function(){
	return this.length;
}

THREE.LinkedList.prototype.appendHead = function(node){
	if (this == null)
		return;
	if (node == null)
		return;
	if (this.head == null){
		this.tail = this.head = node;
	}
	else{
		this.head.prev = node;
		node.next = this.head;
		this.head = node;
	}
	this.length++;
}

THREE.LinkedList.prototype.appendTail = function(node){
	if (this == null)
		return;
	if (node == null)
		return;
	if (this.tail == null){
		this.tail = this.head = node;
	}
	else{
		this.tail.next = node;
		node.prev = this.tail;
		this.tail = node;
	}
	this.length++;
}

THREE.LinkedList.prototype.removeNode = function(node){
	if (this == null)
		return;
	if (node == null)
		return;
	if (node.prev != null){
		node.prev.next = node.next;
	}
	if (node.next != null){
		node.next.prev = node.prev;
	}
	if (node == this.head){
		this.head = node.next;
	}
	if (node == this.tail){
		if (node.prev){
			this.tail = node.prev;
		}
		else{
			this.tail = this.head = null;
		}
	}
	node.prev = null;
	node.next = null;
	this.length--;
}
