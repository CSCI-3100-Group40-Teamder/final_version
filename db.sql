CREATE DATABASE teamder;
use teamder;

CREATE TABLE IF NOT EXISTS user_account(
	user_id varchar(10),
	email VARCHAR(50),
	password TEXT,
	UNIQUE(email),
	PRIMARY KEY (user_id)
);

CREATE TABLE user_information(
	user_id varchar(10),
	user_first_name varchar (40),
	user_last_name varchar (40),
	nickname varchar(40),
	email varchar(40),
	phone_number varchar(12),
	age int, need to change to born_year
	introduction varchar(700),
	sex varchar(1),
	perference1 varchar(20),
	perference2 varchar(20),
	perference3 varchar(20),
	is_admin varchar(2),
	icon_path varchar (100),
	PRIMARY KEY (user_id),
	FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE,
	FOREIGN KEY (icon_path) REFERENCES user_to_photo(photo_url) ON DELETE CASCADE // not add
);

CREATE TABLE user_to_rating(
	user_id varchar(10),
	rating float,
	FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

CREATE TABLE user_to_photo(
	user_id varchar(10),
	photo_url varchar (100),
	photo_time varchar (20),
	FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

CREATE TABLE post_to_photo(
	post_id varchar(50),
	photo_url varchar (100),
	photo_time varchar (20),
	FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE
);

CREATE TABLE group_info(
	group_id varchar(10),
	group_name varchar(70),
	group_descripton varchar(350),
	PRIMARY KEY (group_id)
);

CREATE TABLE subgroup_info(
	group_id varchar(10),
	subgroup_id varchar(10),
	subgroup_name varchar(70),
	subgroup_descripton varchar(350),
	PRIMARY KEY (subgroup_id),
	FOREIGN KEY (group_id) REFERENCES group_info(group_id) ON DELETE CASCADE
);


CREATE TABLE post(
	title varchar(500),
	description varchar(500), 
	post_id varchar(50),
	host_id varchar(10),
	group_id varchar(4),
	t varchar (20),
	subgroup_id varchar(4),
	hitrate int,
	suppose_place varchar(100),
	suppose_time varchar(100),
	suppose_duration varchar(100),
	suppose_date varchar(100),
	icon_path varchar (100),
	PRIMARY KEY (post_id),
	FOREIGN KEY (host_id) REFERENCES user_account(user_id) ON DELETE CASCADE,
	FOREIGN KEY (group_id) REFERENCES group_info(group_id),
	FOREIGN KEY (subgroup_id) REFERENCES subgroup_info(subgroup_id)
);

CREATE TABLE post_to_join(
	post_id varchar(50),
	joiner_id varchar(10),
	finish int,
	PRIMARY KEY (post_id, joiner_id),
	FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE,
	FOREIGN KEY (joiner_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

CREATE TABLE post_to_photo(
	post_id varchar(50),
	uploader_id varchar (10),
	photo_url varchar (100),
	photo_time varchar (20),
	FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE,
	FOREIGN KEY (uploader_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

CREATE TABLE room( not add
	room_id varchar(10),
	PRIMARY KEY (room_id),
	FOREIGN KEY (room_id) REFERENCES post(post_id) ON DELETE CASCADE
);

CREATE TABLE chat(
	room_id varchar(50),
	sender_id varchar(40),
	content varchar(350),
	chat_time varchar(20)
);

CREATE TABLE comment(
	comment_id varchar(50),
	post_id varchar(50),
	comment_user_id varchar(10),
	comment_date varchar(20),
	comment_content varchar(350),
	PRIMARY KEY (comment_id),
	FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE,
	FOREIGN KEY (comment_user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

CREATE TABLE hitrate(
	post_id varchar(50),
	no_of_hit int,
	PRIMARY KEY (post_id),
	FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE
);





