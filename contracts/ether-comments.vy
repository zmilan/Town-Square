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

passThroughAddress: address

@public
def __init__():
    self.comment_count = 0
    passThroughAddress = convert(1, 'address')

@public
def startThread(_moderator: address, _ipfs_hash: bytes32) -> int128:
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
    
    return self.comment_count

@public
def addComment(_parent: int128, _ipfs_hash: bytes32) -> int128:
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
    
    if self.comments[_parent].moderator == passThroughAddress:
        self.comments[self.comment_count].moderator = msg.sender

    return self.comment_count
    
@public
def moderateComment(_commentIndex: int128, _moderated: bool):
    assert msg.sender == self.comments[_commentIndex].moderator
    self.comments[_commentIndex].moderated = _moderated

@public
def editComment(_commentIndex: int128, _ipfs_hash: bytes32):
    assert msg.sender == self.comments[_commentIndex].author
    self.comments[_commentIndex].edited = True
    self.comments[_commentIndex].ipfs_hash = _ipfs_hash

@public
def registerName(_name: bytes32):
    self.names[msg.sender] = _name