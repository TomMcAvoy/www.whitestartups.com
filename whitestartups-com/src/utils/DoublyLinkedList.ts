interface FileMetadata {
  id: string
  name: string
  size: number
  checksum: string
  createTime: string
  uploadTime: string
  status: 'pending' | 'uploaded' | 'synchronized'
  next?: FileMetadata | null
  prev?: FileMetadata | null
}

interface Node<T> {
  value: T
  next: Node<T> | null
  prev: Node<T> | null
}

class DoublyLinkedList<T extends FileMetadata> {
  head: Node<T> | null = null
  tail: Node<T> | null = null

  constructor(elements: T[] = []) {
    elements.forEach((element) => this.append(element))
  }

  append(value: T) {
    const newNode: Node<T> = { value, next: null, prev: null }
    if (!this.head) {
      this.head = newNode
      this.tail = newNode
    } else {
      this.tail!.next = newNode
      newNode.prev = this.tail
      this.tail = newNode
    }
  }

  remove(fileId: string) {
    let current = this.head
    while (current) {
      if (current.value.id === fileId) {
        if (current.prev) {
          current.prev.next = current.next
        } else {
          this.head = current.next
        }
        if (current.next) {
          current.next.prev = current.prev
        } else {
          this.tail = current.prev
        }
        return
      }
      current = current.next
    }
  }

  find(fileId: string): T | null {
    let current = this.head
    while (current) {
      if (current.value.id === fileId) {
        return current.value
      }
      current = current.next
    }
    return null
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.head
    while (current) {
      result.push(current.value)
      current = current.next
    }
    return result
  }
}

export default DoublyLinkedList
