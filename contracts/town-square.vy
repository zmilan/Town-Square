Comment: event({index: indexed(int128), author: indexed(address), _parent: indexed(int128)})

comments: public({
    child: int128,
    sibling: int128,
    author: address,
    ipfs_hash: bytes32,
    date_posted: timestamp
}[int128])

comment_count: public(int128)

@public
def __init__():
    self.comment_count = 0

@public
def publishThread(_ipfs_hash: bytes32):
    self.comment_count += 1
    self.comments[self.comment_count] = {
        child: 0,
        sibling: 0,
        author: msg.sender,
        ipfs_hash: _ipfs_hash,
        date_posted: block.timestamp
    }
    
    log.Comment(
        self.comment_count,
        msg.sender,
        0
    )

@public
def publishComment(_parent: int128, _ipfs_hash: bytes32):
    assert self.comments[_parent].author != 0x0000000000000000000000000000000000000000

    self.comment_count += 1

    self.comments[self.comment_count] = {
        child: 0,
        sibling: self.comments[_parent].child,
        author: msg.sender,
        ipfs_hash: _ipfs_hash,
        date_posted: block.timestamp
    }
    
    self.comments[_parent].child = self.comment_count

    log.Comment(
        self.comment_count,
        msg.sender,
        _parent
    )
