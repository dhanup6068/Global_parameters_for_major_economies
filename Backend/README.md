# DSCI 551 Project 
#### Emulated file system
--- 

#### MYSQL Installation
---
1. Connect to mysql with root and add this user and set privileges for the project;
```
create user 'edfs75'@'localhost' identified with mysql_native_password by 'edfs75pass';
create database edfs75;
grant all privileges on edfs75.* to 'edfs75'@'localhost';
flush privileges;
exit;
```
2. Connect to mysql with the below command to access the project database
```
mysql -uedfs75 -pedfs75pass
```


### Metadata for Files

|column | type | description | 
|---|---|---|
| inode | number | 
| parentINode | number | 
| type | number | 0: file, 1: directory |
| fileName | string | 
| permission | string | 
| createdAt | timestamp | 
| createdBy | string | 
| atime | timestamp | 
| ctime | timestamp | 
| mtime | timestamp | 

### Metadata for Blocks

|column | type | default | description |
|---|---|---|---|
| blockId | number | auto increment |
| inode | number |
| filePartitionId | number || part of the file|
| replicationId | number | 
