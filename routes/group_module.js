var fs = require('fs');
var express = require("express");
var http = require("http");
var url = require('url');
var app = express();
var mysql = require('mysql');
var other=require("../other_function");
var connection = require('../dataBase/db');
const server = require('http').Server(app);
const bodyParser = require('body-parser')

app.set('view engine', 'ejs');

var router = express.Router();


app.use(bodyParser.urlencoded({extended: false}));

router.get("/group_display", function(req, res, next) {
    console.log("try to display group");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	if(qdata.action)
	{
    	if(qdata.action=="create_new_group")
    	    var sql = "insert into group_info values ('"+qdata.new_group_ID+"', '"+qdata.new_group_name+"', '"+qdata.new_group_description+"')";
    	else if(qdata.action=="create_new_subgroup")
    	    var sql = "insert into subgroup_info values ('"+qdata.under_which_group_id+"', '"+qdata.new_subgroup_ID+"', '"+qdata.new_subgroup_name+"', '"+qdata.new_subgroup_description+"')";
    	else if(qdata.action=="change_group")
    	    {
    	        var sql_group_name="";
            	var sql_group_description="";
            	if(qdata.change_group_name)
            	    sql_group_name="group_name = '"+qdata.change_group_name+"', ";
            	if(qdata.change_group_descripton)
            	    sql_group_description="group_descripton = '"+qdata.change_group_descripton+"', ";
            	var sql = "Update group_info set "+sql_group_name+sql_group_description+"group_id='"+qdata.change_group_id+"' WHERE group_id = '"+qdata.change_group_id+"'";
            }
        else if(qdata.action=="change_subgroup")
    	    {
    	        var sql_subgroup_name="";
            	var sql_subgroup_description="";
            	if(qdata.change_subgroup_name)
            	    sql_subgroup_name="subgroup_name = '"+qdata.change_subgroup_name+"', ";
            	if(qdata.change_subgroup_descripton)
            	    sql_subgroup_description="subgroup_descripton = '"+qdata.change_subgroup_descripton+"', ";
            	var sql = "Update subgroup_info set "+sql_subgroup_name+sql_subgroup_description+"subgroup_id='"+qdata.change_subgroup_id+"' WHERE subgroup_id = '"+qdata.change_subgroup_id+"'";
            }
        else if(qdata.action=="delete_group")
            var sql = "delete from group_info where group_id= '"+qdata.delete_group_id+"'";
        else if(qdata.action=="delete_subgroup")
            var sql = "delete from subgroup_info where subgroup_id= '"+qdata.delete_subgroup_id+"'";
    	connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                console.log(result);
             });
	}
    var sql = "Select * FROM group_info";
    connection.query(sql, function (err, group_result, fields) {
        if (err) throw err;
        console.log(group_result);
        //console.log("length: "+result.length);
        //res.render('modify_group', {group_result: group_result});
        var sqlsub = "Select * FROM subgroup_info";
        connection.query(sqlsub, function (err, subgroup_result, fields) {
            if (err) throw err;
            console.log(subgroup_result);
            //console.log("length: "+result.length);
            res.render('modify_group', {group_result: group_result, subgroup_result: subgroup_result}); 
        });
    });
});

module.exports = router;