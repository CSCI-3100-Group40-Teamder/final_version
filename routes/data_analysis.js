const mysql_method = require('../database-dev/create_table')
const connection = mysql_method.connection

const express = require('express')
var router = express.Router();

router.get("/", (req, res) => {
    DA(req, res)
})


function DA(req, res){
    const post_sql = "SELECT * FROM post"
    connection.query(post_sql,  (err, post_results) => {
        if (err) throw err
        
        const group_sql = "SELECT * FROM group_info"
        connection.query(group_sql, (err, group_results) => {
            if (err) throw err
            
            const user_sql = "SELECT * FROM user_information"
            connection.query(user_sql, (err, user_results) => {
                if (err) throw err
                
                // ================================================= Merge group data to post data =================================================
                for (var i = 0; i < post_results.length; i++){
                    for (var j = 0; j < group_results.length; j++){
                        if (group_results[j].group_id == post_results[i].group_id){
                            post_results[i].group_name = group_results[j].group_name
                        }
                    }
                }
                
                // ================================================= Merge user data to post data =================================================
                for (var i = 0; i < post_results.length; i++){
                    for (var j = 0; j < user_results.length; j++){
                        if (user_results[j].user_id == post_results[i].host_id){
                            post_results[i].host_sex = user_results[j].sex
                        }
                    }
                }
                
                // ================================================= Post count against group =================================================
                const post_count_group_groupby = groupBy(post_results, result => result.group_name);
                
                const post_count_group_data_x = []
                const post_count_group_data_y = []
                
                post_count_group_groupby.forEach((value, key, map) => {
                    post_count_group_data_x.push(key)
                    post_count_group_data_y.push(value.length)
                })
                
                
                // ================================================= Overall Sex =================================================
                const overall_sex_groupby = groupBy(user_results, result => result.sex)
                
                const overall_sex_data_x = []
                const overall_sex_data_y_M = []
                const overall_sex_data_y_F = []
                
                
                overall_sex_groupby.forEach((value, key, map) => {
                    overall_sex_data_x.push(key)
                    
                    var M = 0
                    var F = 0
                    for (var i = 0; i < value.length; i++){
                        if (value[i].sex == 'M'){
                            M = M + 1
                        } else{
                            F = F + 1
                        }
                    }
                    overall_sex_data_y_M.push(M)
                    overall_sex_data_y_F.push(F)
                })
                
                // ================================================= By group Sex =================================================
                const sex_group_groupby = groupBy(post_results, result => result.group_name);
                
                const sex_group_data_x = []
                const sex_group_data_y_M = []
                const sex_group_data_y_F = []
                
                sex_group_groupby.forEach((value, key, map) => {
                    sex_group_data_x.push(key)
                    
                    var M = 0
                    var F = 0
                    for (var i = 0; i < value.length; i++){
                        if (value[i].host_sex == 'M'){
                            M = M + 1
                        } else{
                            F = F + 1
                        }
                    }
                    sex_group_data_y_M.push(M)
                    sex_group_data_y_F.push(F)
                    
                })
                
                
                // ================================================= Hit rate by group =================================================
                const hitrate_group_groupby = groupBy(post_results, result => result.group_name);
                
                const hitrate_group_data_x = []
                const hitrate_group_data_y = []
                
                hitrate_group_groupby.forEach((value, key, map) => {
                    hitrate_group_data_x.push(key)
                    
                    var hit = 0
                    
                    for (var i = 0; i < value.length; i++){
                        hit = hit + value[i].hitrate
                    }
                    
                    hitrate_group_data_y.push(hit)
                })


                res.render("data_analysis.ejs", 
                    { number_of_user : user_results.length ,
                    post_count_group_groupby: {x : post_count_group_data_x, y: post_count_group_data_y},
                    overall_sex_groupby: {x : overall_sex_data_x, y_M : overall_sex_data_y_M, y_F : overall_sex_data_y_F},
                    sex_group_groupby: {x : sex_group_data_x, y_M: sex_group_data_y_M, y_F: sex_group_data_y_F},
                    hitrate_group_groupby: {x : hitrate_group_data_x, y : hitrate_group_data_y}
                    }
                    
                )
            })
    })
})
}


// ========================================================Custom Functions========================================================================
function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}

module.exports = router