create table FileMetaData (
    inode int not null primary key auto_increment comment 'inode for the file',
    parentInode int not null comment 'inode for the parent directory',
    name varchar(255) not null comment 'name of the file',
    type tinyint not null comment 'type of the file (0: directory, 1: file)',
    size int not null comment 'size of the file/dir',
    createdTime timestamp not null default current_timestamp comment 'time when the file/dir was created',
    mtime timestamp not null default current_timestamp comment 'last modified time',
    ctime timestamp not null default current_timestamp comment 'last changed time',
    atime timestamp not null default current_timestamp comment 'last accessed time',
    permission tinyint not null comment 'permission for the file/dir',
    foreign key (parentInode) references FileMetaData(inode),
    unique key (parentInode, name)
);