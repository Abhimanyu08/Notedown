alter table slugpost
drop constraint slugpost_postid_fkey;

alter table slugpost
add constraint slugpost_postid_fkey
foreign key (postid)
references posts(id)
on delete cascade;
