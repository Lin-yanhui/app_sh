function getDate(extra){  
	var dat = new Date;//生成日期  
	var year = dat.getFullYear();//取得年  
	var month = dat.getMonth()+1;    //取得月,js从0开始取,所以+1  
	var date1 = dat.getDate(); //取得天  
	var hour = dat.getHours();//取得小时  
	var minutes = dat.getMinutes();//取得分钟  
	var second = dat.getSeconds();//取得秒  
	var haomiao = dat.getMilliseconds();  
	dat = undefined;  
	return year+"-"+month+"-"+date1+" "+hour+":"+minutes +":"+second+" "+haomiao + extra ;  
}
function debug(msg){  
	console.log(getDate('-log-: ') + msg); 
}