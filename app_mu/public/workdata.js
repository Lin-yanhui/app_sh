$(function() {
	var COLS = ["USER_CODE","USER_NAME","WORK_DATE","MORNING_BEGIN","AFTERNOON_END","CUSTOMER_NAME","ABNORMAL_REASON"];
	//var SREASON = ["早退","旷工","未签到"];
	var SREASON = ["迟到","早退","旷工","未签到"];
	var headArray = [];
	function parseHead(oneRow) {
		for ( var key in oneRow) {
			if($.inArray(key,COLS) > -1){
				headArray[headArray.length] = key;
			}
		}
	}
	function appendTable(jsonArray) {
		parseHead(jsonArray[0]);
		var div = document.getElementById("div-workdata");
		var table = document.createElement("table");
		var thead = document.createElement("tr");
		for ( var count = 0; count < headArray.length; count++) {
			var td = document.createElement("th");
			td.innerHTML = headArray[count];
			thead.appendChild(td);
		}
		table.appendChild(thead);
		var line = 0;
		for ( var tableRowNo = 0; tableRowNo < jsonArray.length; tableRowNo++) {
			if($.inArray(jsonArray[tableRowNo]["ABNORMAL_REASON"],SREASON) < 0){
				continue;
			}
			var tr = document.createElement("tr");
			for ( var headCount = 0; headCount < headArray.length; headCount++) {
				var cell = document.createElement("td");
				cell.innerHTML = jsonArray[tableRowNo][headArray[headCount]];
				tr.appendChild(cell);
			}
			table.appendChild(tr);
			line++;
		}
		if(line > 0){
			div.appendChild(table);
		}
		var msg = "";
		if(line > 0){
			msg = "共有"+line+"条签到异常记录。";
		}else{
			msg = "所有人签到正常！";
		}
		$("#div-msg").html(msg).show();
	}

	var showData = function(){

		$.ajax({
			url : "./workdata",
			type : "post",
			//data : formData,
			processData : false,
			contentType : false,
			dataType: "json",
			success: function(data){
				if(!!data && !!data.rows){
					appendTable(data.rows);
				}
			},
			error:function(){
				console.log( "error!" );
			}
		});
	}
	$( document ).ready(function() {
		console.log( "ready!" );
		showData();
	});
});