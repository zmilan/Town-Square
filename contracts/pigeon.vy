
Comment: event({index: int128, author: indexed(address), _parent: int128})

comments: public({
    child: int128,
    sibling: int128,
    author: address,
    ipfs_hash: bytes32,
    moderator: address,
    moderated: bool,
    edited: bool,
    date_posted: timestamp
}[int128])

names: public(bytes32[address])

comment_count: public(int128)

@public
def __init__():
    self.comment_count = 0

@public
def startThread(_moderator: address, _ipfs_hash: bytes32):
    self.comment_count += 1
    self.comments[self.comment_count] = {
        child: 0,
        sibling: 0,
        author: msg.sender,
        ipfs_hash: _ipfs_hash,
        moderator: _moderator,
        moderated: False,
        edited: False,
        date_posted: block.timestamp
    }
    
    log.Comment(
        self.comment_count,
        msg.sender,
        0
    )

    return 

@public
def addComment(_parent: int128, _ipfs_hash: bytes32):
    assert self.comments[_parent].date_posted > 0

    self.comment_count += 1

    self.comments[self.comment_count] = {
        child: 0,
        sibling: self.comments[_parent].child,
        author: msg.sender,
        ipfs_hash: _ipfs_hash,
        moderator: self.comments[_parent].moderator,
        moderated: False,
        edited: False,
        date_posted: block.timestamp
    }
    
    self.comments[_parent].child = self.comment_count

    log.Comment(
        self.comment_count,
        msg.sender,
        _parent
    )

    
@public
def moderateComment(_commentIndex: int128):
    assert msg.sender == self.comments[_commentIndex].moderator
    self.comments[_commentIndex].moderated = True
    self.comments[_commentIndex].author = 0
    self.comments[_commentIndex].ipfsHash = 0

@public
def editComment(_commentIndex: int128, _ipfs_hash: bytes32):
    assert msg.sender == self.comments[_commentIndex].author
    self.comments[_commentIndex].edited = True
    self.comments[_commentIndex].ipfs_hash = _ipfs_hash

@public
def registerName(_name: bytes32):
    self.names[msg.sender] = _name