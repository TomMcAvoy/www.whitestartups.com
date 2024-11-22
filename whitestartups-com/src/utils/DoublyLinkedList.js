class DoublyLinkedList {
    constructor(elements = []) {
        this.head = null;
        this.tail = null;
        elements.forEach((element) => this.append(element));
    }
    append(value) {
        const newNode = { value, next: null, prev: null };
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        }
        else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
    }
    remove(fileId) {
        let current = this.head;
        while (current) {
            if (current.value.id === fileId) {
                if (current.prev) {
                    current.prev.next = current.next;
                }
                else {
                    this.head = current.next;
                }
                if (current.next) {
                    current.next.prev = current.prev;
                }
                else {
                    this.tail = current.prev;
                }
                return;
            }
            current = current.next;
        }
    }
    find(fileId) {
        let current = this.head;
        while (current) {
            if (current.value.id === fileId) {
                return current.value;
            }
            current = current.next;
        }
        return null;
    }
    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current.value);
            current = current.next;
        }
        return result;
    }
}
export default DoublyLinkedList;
//# sourceMappingURL=DoublyLinkedList.js.map