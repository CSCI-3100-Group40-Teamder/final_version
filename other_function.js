exports.sicount = function () {
  	var date = new Date;

        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();

        var year = date.getFullYear();
        var month = date.getMonth()+1; // beware: January = 0; February = 1, etc.
        var day = date.getDate();
        if (month<10)
            month='0'+month;
        if (day<10)
            day='0'+day;
        if (hour<10)
            hour='0'+hour;
        if (minutes<10)
            minutes='0'+minutes;
        if (seconds<10)
            seconds='0'+seconds;
        var t=''+year+month+day+hour+minutes+seconds;
    		return t;
};