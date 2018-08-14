
Comment: event({index: int128, author: indexed(address), _parent: indexed(int128), ipfs_hash: bytes32})
Edit: event({index: indexed(int128), ipfs_hash: bytes32})
Moderate: event({index: indexed(int128)})
Name: event({person: indexed(address), name: bytes32})

comments: public({
    moderator: address,
    author: address,
    exclusive: bool
}[int128])

names: public(bytes32[address])

comment_count: public(int128)

@public
def __init__():
    self.comment_count = 0

@public
def startThread(_moderator: address, _exclusive: bool, _ipfs_hash: bytes32):
    self.comment_count += 1
    self.comments[self.comment_count] = {
        author: msg.sender,
        exclusive: _exclusive,
        moderator: _moderator
    }
    
    log.Comment(
        self.comment_count,
        msg.sender,
        0,
        _ipfs_hash
    )

    return 

@public
def addComment(_parent: int128, _ipfs_hash: bytes32):
    assert self.comments[_parent].author != 0x0000000000000000000000000000000000000000
    assert not self.comments[_parent].exclusive or self.comments[_parent].moderator == msg.sender

    self.comment_count += 1

    self.comments[self.comment_count] = {
        author: msg.sender,
        exclusive: self.comments[_parent].exclusive,
        moderator: self.comments[_parent].moderator
    }

    log.Comment(
        self.comment_count,
        msg.sender,
        _parent,
        _ipfs_hash
    )

    
@public
def moderateComment(_commentIndex: int128):
    assert msg.sender == self.comments[_commentIndex].moderator

    log.Moderate(
        _commentIndex
    )

@public
def editComment(_commentIndex: int128, _ipfs_hash: bytes32):
    assert msg.sender == self.comments[_commentIndex].author

    log.Edit(
        _commentIndex,
        _ipfs_hash
    )

@public
def registerName(_name: bytes32):
    log.Name(
        msg.sender,
        _name
    )