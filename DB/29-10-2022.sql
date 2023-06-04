create table FileData (
    blockId int not null primary key auto_increment,
    inode int not null,
    data json not null
);

create table FileExtensions (
    inode int not null primary key,
    extension varchar(10) not null default "json"
);