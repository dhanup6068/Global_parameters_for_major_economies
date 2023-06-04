alter table FileData add column partitionValue varchar(100) not null;
alter table FileMetaData add column partitionedOn varchar(100) default null;